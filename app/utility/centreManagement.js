import { centreDay } from 'app/utility/centreClock';
import {
  activityEntityId,
  exclusionBlockedIds,
} from 'app/utility/exclusionEligibility';
import { currentUserId } from 'app/utility/medicationAdminister';
import { opaqueId } from 'app/utility/patientFieldPolicy';
import {
  getScheduleDayValue,
  parseScheduleDay,
} from 'app/utility/parseScheduleString';

export const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
export const hasWeekday = (mask, index) =>
  Math.floor(Number(mask) / 2 ** index) % 2 === 1;
export const supervisorActor = (user) => {
  if (
    String(user?.roleName || user?.role || '').toUpperCase() !== 'SUPERVISOR' ||
    !currentUserId(user)
  ) {
    throw new Error('Supervisor sign-in is required.');
  }
  return String(opaqueId(currentUserId(user)));
};
export const calendarDate = (value) => {
  const date = String(value || '').trim();
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date + 'T00:00:00Z')) ||
    new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date
  ) {
    throw new Error('Enter a valid date as YYYY-MM-DD.');
  }
  return date;
};
export const timeMinutes = (value) => {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(String(value))) {
    throw new Error('Enter a valid time as HH:mm.');
  }
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
};
export const configuredHours = (response) => {
  if (
    !response?.ok ||
    String(response.data?.id) !== '1' ||
    !response.data?.working_hours
  ) {
    throw new Error('Centre hours are unavailable. Retry before saving.');
  }
  return weekDays.map((day) => {
    const value = response.data.working_hours[day.toLowerCase()];
    if (!value || typeof value !== 'object') {
      throw new Error('Centre hours are incomplete. Retry before saving.');
    }
    if (value.open == null && value.close == null) {
      return { day, open: null, close: null };
    }
    if (timeMinutes(value.open) >= timeMinutes(value.close)) {
      throw new Error('Centre hours have an invalid time range.');
    }
    return {
      day,
      open: value.open.slice(0, 5),
      close: value.close.slice(0, 5),
    };
  });
};
const positiveInteger = (value, label) => {
  if (
    !/^\d+$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < 1
  ) {
    throw new Error(`${label} must be a positive whole number.`);
  }
  return Number(value);
};
const activeById = (rows, value, label) => {
  const id = activityEntityId(value);
  const row = rows.find((r) => String(r.id) === String(id) && !r.is_deleted);
  if (!row) {
    throw new Error(`Select an active ${label}.`);
  }
  return row;
};
const dateRange = (draft, creating, now) => {
  const start = calendarDate(draft.start_date),
    end = calendarDate(draft.end_date);
  if (end < start || (creating && start < centreDay(now))) {
    throw new Error('Use an ordered date range starting today or later.');
  }
  return { start_date: start, end_date: end };
};
const assertOpen = (hours, index, start, end) => {
  const day = hours[index];
  if (
    !day?.open ||
    start < timeMinutes(day.open) ||
    end > timeMinutes(day.close)
  ) {
    throw new Error(`Use configured opening hours for ${weekDays[index]}.`);
  }
};
export const buildActivityPayload = ({
  kind,
  action,
  draft,
  user,
  data,
  patientId,
  now = new Date(),
}) => {
  const actor = supervisorActor(user);
  const identity =
    action === 'create' ? {} : { id: activityEntityId(draft.id) };
  if (action === 'delete') {
    return identity;
  }
  let payload;
  if (kind === 'activity') {
    const title = String(draft.title || '').trim();
    if (!title) {
      throw new Error('Enter an activity name.');
    }
    if (
      data.activities.some(
        (r) =>
          String(r.id) !== String(draft.id) &&
          String(r.title).trim().toLowerCase() === title.toLowerCase(),
      )
    ) {
      throw new Error(
        'Activity names must be unique, including deleted activities.',
      );
    }
    payload = {
      title,
      description: String(draft.description || '').trim() || null,
    };
    return action === 'create'
      ? payload
      : { ...identity, ...payload, is_deleted: false, modified_by_id: actor };
  }
  if (kind === 'centre') {
    activeById(data.activities, draft.activity_id, 'catalogue activity');
    const duration = Number(draft.min_duration);
    if (![30, 60].includes(duration)) {
      throw new Error('Choose a 30 or 60 minute duration.');
    }
    if (draft.is_compulsory && !draft.is_fixed) {
      throw new Error(
        'The current service requires compulsory activities to have fixed times.',
      );
    }
    const people = draft.is_group
      ? positiveInteger(draft.min_people_req, 'Minimum participants')
      : 1;
    if (draft.is_group && people < 2) {
      throw new Error('Group activities require at least two participants.');
    }
    const slots = String(draft.fixed_time_slots || '')
      .trim()
      .split(',')
      .filter(Boolean)
      .map((s) => s.trim());
    if (draft.is_fixed && !slots.length) {
      throw new Error('Add fixed slots as Monday 09:00,Friday 11:00.');
    }
    slots.forEach((slot) => {
      const [day, time, extra] = slot.split(' ');
      const index = weekDays.indexOf(day);
      if (index < 0 || extra || !time) {
        throw new Error(
          'Use fixed slots in Day HH:mm format, separated by commas.',
        );
      }
      const start = timeMinutes(time);
      assertOpen(data.hours, index, start, start + duration);
    });
    payload = {
      activity_id: activityEntityId(draft.activity_id),
      is_fixed: !!draft.is_fixed,
      is_compulsory: !!draft.is_compulsory,
      is_group: !!draft.is_group,
      ...dateRange(draft, action === 'create', now),
      min_duration: duration,
      max_duration: duration,
      min_people_req: people,
      fixed_time_slots: draft.is_fixed ? slots.join(',') : null,
    };
  } else if (kind === 'availability') {
    const centre = activeById(
      data.centres,
      draft.centre_activity_id,
      'centre activity',
    );
    const range = dateRange(draft, action === 'create', now);
    if (
      range.start_date < centre.start_date ||
      range.end_date > centre.end_date
    ) {
      throw new Error('Availability dates must fit the centre activity dates.');
    }
    const start = timeMinutes(draft.start_time),
      end = timeMinutes(draft.end_time);
    if (start >= end) {
      throw new Error('End time must follow start time on the same day.');
    }
    const mask = Number(draft.days_of_week);
    if (!Number.isInteger(mask) || mask < 0 || mask > 127) {
      throw new Error('Select valid recurring weekdays.');
    }
    if (!mask && range.start_date !== range.end_date) {
      throw new Error(
        'A one-off availability must use one date. Select weekdays to repeat.',
      );
    }
    const indexes = mask
      ? weekDays.map((_, i) => i).filter((i) => hasWeekday(mask, i))
      : [(new Date(range.start_date + 'T00:00:00Z').getUTCDay() + 6) % 7];
    indexes.forEach((i) => assertOpen(data.hours, i, start, end));
    const duration = end - start;
    if (
      centre.is_fixed
        ? duration !== centre.min_duration && duration !== centre.max_duration
        : duration < centre.min_duration
    ) {
      throw new Error(
        'The availability window must fit the activity duration.',
      );
    }
    payload = {
      centre_activity_id: activityEntityId(draft.centre_activity_id),
      ...range,
      start_time: draft.start_time.slice(0, 5) + ':00',
      end_time: draft.end_time.slice(0, 5) + ':00',
      days_of_week: mask,
    };
  } else if (kind === 'adhoc') {
    const old = activeById(
      data.centres,
      draft.old_centre_activity_id,
      'scheduled centre activity',
    );
    const replacement = activeById(
      data.centres,
      draft.new_centre_activity_id,
      'replacement centre activity',
    );
    if (String(old.id) === String(replacement.id)) {
      throw new Error('Choose a different replacement activity.');
    }
    if (
      exclusionBlockedIds(data.rules || {}).includes(String(replacement.id))
    ) {
      throw new Error(
        'The replacement is disliked, excluded or not recommended for this patient.',
      );
    }
    const dates = currentWeekDates(now),
      start = calendarDate(draft.start_date),
      end = calendarDate(draft.end_date);
    if (!dates.includes(start) || !dates.includes(end)) {
      throw new Error(
        'Ad hoc changes must stay within the current Singapore week.',
      );
    }
    timeMinutes(draft.start_time);
    timeMinutes(draft.end_time);
    const startISO = `${start}T${draft.start_time.slice(0, 5)}:00+08:00`,
      endISO = `${end}T${draft.end_time.slice(0, 5)}:00+08:00`;
    if (Date.parse(startISO) >= Date.parse(endISO)) {
      throw new Error('End date and time must follow the start.');
    }
    const utcEnd = new Date(now);
    utcEnd.setUTCHours(23, 59, 59, 0);
    utcEnd.setUTCDate(utcEnd.getUTCDate() + ((7 - utcEnd.getUTCDay()) % 7));
    if (Date.parse(endISO) > utcEnd.getTime()) {
      throw new Error(
        'The service current-week boundary differs from Singapore time. This change cannot be saved yet.',
      );
    }
    if (
      start < old.start_date ||
      end > old.end_date ||
      start < replacement.start_date ||
      end > replacement.end_date
    ) {
      throw new Error(
        'The selected activities must cover the whole date range.',
      );
    }
    if (!data.oldScheduledIds?.includes(String(old.id))) {
      throw new Error(
        'The existing schedule does not identify this activity unambiguously.',
      );
    }
    payload = {
      patient_id: activityEntityId(patientId),
      old_centre_activity_id: old.id,
      new_centre_activity_id: replacement.id,
      status: action === 'create' ? 'PENDING' : draft.status,
      start_date: startISO,
      end_date: endISO,
    };
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(payload.status)) {
      throw new Error('The ad hoc status is invalid. Reload the record.');
    }
  } else {
    throw new Error('Unknown activity operation.');
  }
  return {
    ...identity,
    ...payload,
    ...(action === 'create'
      ? { created_by_id: actor }
      : { is_deleted: false, modified_by_id: actor }),
  };
};
export const currentWeekDates = (now = new Date()) => {
  const today = centreDay(now),
    weekday = new Date(today + 'T00:00:00Z').getUTCDay();
  const days = (7 - weekday) % 7;
  return Array.from({ length: days + 1 }, (_, i) =>
    new Date(Date.parse(today + 'T00:00:00Z') + i * 86400000)
      .toISOString()
      .slice(0, 10),
  );
};
export const activityLabel = (centre, activities) =>
  `${
    activities.find((a) => String(a.id) === String(centre.activity_id))
      ?.title || 'Unnamed activity'
  } (#${centre.id})`;
export const patientScheduledCentreIds = ({
  rows,
  patientId,
  startDate,
  endDate,
  centres,
  activities,
}) => {
  const start = calendarDate(startDate),
    end = calendarDate(endDate);
  if (
    !Array.isArray(rows) ||
    end < start ||
    Date.parse(end) - Date.parse(start) > 6 * 86400000
  ) {
    throw new Error('The existing weekly schedule is unavailable.');
  }
  const scoped = rows.filter(
    (r) =>
      String(activityEntityId(r.PatientID)) ===
      String(activityEntityId(patientId)),
  );
  const titles = new Set();
  for (
    let date = start;
    date <= end;
    date = new Date(Date.parse(date + 'T00:00:00Z') + 86400000)
      .toISOString()
      .slice(0, 10)
  ) {
    const matching = scoped.filter(
      (r) =>
        calendarDate(String(r.StartDate || '').slice(0, 10)) <= date &&
        calendarDate(String(r.EndDate || '').slice(0, 10)) >= date,
    );
    if (matching.length !== 1) {
      throw new Error(
        'One existing patient schedule must cover every selected date.',
      );
    }
    const weekday = (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7;
    let value = getScheduleDayValue(matching[0], weekDays[weekday]);
    if (typeof value === 'string' && /^[{[]/.test(value.trim())) {
      try {
        value = JSON.parse(value);
      } catch {
        throw new Error('The existing schedule has invalid activity slots.');
      }
    }
    if (
      Array.isArray(value) ||
      (value != null && !['string', 'object'].includes(typeof value))
    ) {
      throw new Error('The existing schedule has invalid activity slots.');
    }
    if (
      value &&
      typeof value === 'object' &&
      Object.entries(value).some(
        ([range, title]) =>
          !/^(?:[01]?\d|2[0-3]):[0-5]\d-(?:[01]?\d|2[0-3]):[0-5]\d$/.test(
            range,
          ) || typeof title !== 'string',
      )
    ) {
      throw new Error('The existing schedule has invalid activity slots.');
    }
    parseScheduleDay(
      value,
      date + 'T00:00:00+08:00',
      patientId,
      'Patient',
    ).forEach((slot) => {
      if (
        !slot.activityTitle ||
        Number.isNaN(slot.startTime.getTime()) ||
        Number.isNaN(slot.endTime.getTime()) ||
        slot.endTime <= slot.startTime
      ) {
        throw new Error('The existing schedule has invalid activity slots.');
      }
      titles.add(slot.activityTitle.trim().toLowerCase());
    });
  }
  const candidates = centres.filter(
    (c) => !c.is_deleted && c.start_date <= start && c.end_date >= end,
  );
  const groups = new Map();
  candidates.forEach((centre) => {
    const title = activities
      .find((a) => String(a.id) === String(centre.activity_id) && !a.is_deleted)
      ?.title?.trim()
      .toLowerCase();
    if (title && titles.has(title)) {
      groups.set(title, [...(groups.get(title) || []), String(centre.id)]);
    }
  });
  return {
    ids: [...groups.values()].filter((ids) => ids.length === 1).flat(),
    ambiguousTitles: [...groups.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([title]) => title),
  };
};
