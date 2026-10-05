import { opaqueId } from 'app/utility/patientFieldPolicy';
import {
  getScheduleDayValue,
  parseScheduleDay,
} from 'app/utility/parseScheduleString';
const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const validDate = (value) => {
  const str = String(value ?? '').slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(str) ||
    Number.isNaN(Date.parse(str + 'T00:00:00Z')) ||
    new Date(str + 'T00:00:00Z').toISOString().slice(0, 10) !== str
  ) {
    throw new Error('The schedule contains invalid dates.');
  }
  return str;
};
export const centreDate = (now = new Date()) =>
  new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
export const previewDates = (now = new Date()) => {
  const today = centreDate(now);
  return [
    today,
    new Date(Date.parse(today + 'T00:00:00Z') + 86400000)
      .toISOString()
      .slice(0, 10),
  ];
};
export const previewActivities = (rows, date, now = new Date()) => {
  if (!previewDates(now).includes(date)) {
    throw new Error('Select today or tomorrow in Singapore time.');
  }
  if (!Array.isArray(rows)) {
    throw new Error('The weekly schedule is unavailable.');
  }
  const day = dayNames[new Date(date + 'T00:00:00Z').getUTCDay()];
  const titles = new Set();
  let covered = false;
  const mapped = rows
    .map((row) => {
      const start = validDate(row.StartDate);
      const end = validDate(row.EndDate);
      if (end < start) {
        throw new Error('The schedule has an invalid date range.');
      }
      if (date < start || date > end) {
        return null;
      }
      covered = true;
      const id = opaqueId(row.PatientID);
      if (!row.Name || typeof row.Name !== 'string') {
        throw new Error('The schedule is missing a patient name.');
      }
      let dayValue = getScheduleDayValue(row, day);
      if (typeof dayValue === 'string' && /^[{[]/.test(dayValue.trim())) {
        try {
          dayValue = JSON.parse(dayValue);
        } catch {
          throw new Error('The selected day has invalid schedule data.');
        }
      }
      if (
        Array.isArray(dayValue) ||
        (dayValue != null &&
          typeof dayValue !== 'string' &&
          typeof dayValue !== 'object')
      ) {
        throw new Error('The selected day has invalid schedule data.');
      }
      if (
        dayValue &&
        typeof dayValue === 'object' &&
        Object.entries(dayValue).some(
          ([time, title]) =>
            !/^(?:[01]?\d|2[0-3]):[0-5]\d-(?:[01]?\d|2[0-3]):[0-5]\d$/.test(
              time,
            ) || typeof title !== 'string',
        )
      ) {
        throw new Error('The selected day has invalid schedule slots.');
      }
      const slots = parseScheduleDay(
        dayValue,
        date + 'T00:00:00+08:00',
        id,
        row.Name,
      );
      if (
        slots.some(
          (slot) =>
            !slot.activityTitle ||
            Number.isNaN(slot.startTime.getTime()) ||
            Number.isNaN(slot.endTime.getTime()),
        )
      ) {
        throw new Error('The selected day has invalid schedule slots.');
      }
      const scheduledTitles = [
        ...new Set(slots.map((slot) => slot.activityTitle.trim())),
      ];
      scheduledTitles.forEach((title) => titles.add(title));
      return { id, name: row.Name, scheduledTitles };
    })
    .filter(Boolean);
  if (!covered) {
    throw new Error(
      'No existing weekly schedule covers this date. No schedule was generated.',
    );
  }
  return {
    date,
    patients: mapped,
    activities: [...titles].sort((a, b) => a.localeCompare(b)),
  };
};
export const affectedPatients = (preview, selectedTitle) => {
  if (!preview?.activities.includes(selectedTitle)) {
    throw new Error('Select an activity from the existing schedule.');
  }
  const unique = new Map();
  for (const row of preview.patients) {
    if (row.scheduledTitles.includes(selectedTitle)) {
      const key = String(row.id);
      if (unique.has(key) && unique.get(key).name !== row.name) {
        throw new Error('The schedule has conflicting patient names.');
      }
      unique.set(key, { id: row.id, name: row.name });
    }
  }
  return [...unique.values()];
};
