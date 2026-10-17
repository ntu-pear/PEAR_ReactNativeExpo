import { exactNumericPatientId } from 'app/utility/medicationAdminister';
import { calendarDate } from 'app/utility/centreManagement';
import {
  getScheduleDayValue,
  parseScheduleDay,
} from 'app/utility/parseScheduleString';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const patientScheduleParameters = (patientId, date) => ({
  patientId: String(exactNumericPatientId(patientId)),
  date: date == null ? undefined : calendarDate(date),
});

export const patientScheduleFailure = (status) => ({
  weekly: [],
  patientName: '',
  error: true,
  status,
  retry: status !== 401 && status !== 403,
  message:
    status === 401
      ? 'Your session has expired. Sign in again to view this schedule.'
      : status === 403
      ? 'You do not have permission to view this patient schedule.'
      : status === 503
      ? 'A service needed to load this schedule is unavailable. Please retry.'
      : 'The patient schedule could not be loaded. Please retry.',
});

export const patientScheduleResult = (response, patientId) => {
  if (!response?.ok || response.status !== 200) {
    return patientScheduleFailure(response?.status);
  }
  const body = response.data;
  // The scheduler returns HTTP 200 with Status 404 for an unsaved week.
  if (
    String(body?.Status) === '404' &&
    (body.Data === '' || (Array.isArray(body.Data) && body.Data.length === 0))
  ) {
    return { weekly: [], patientName: '', error: false, status: 200 };
  }
  if (
    String(body?.Status) !== '200' ||
    !Array.isArray(body.Data) ||
    body.Data.length > 1
  ) {
    return patientScheduleFailure(200);
  }
  if (!body.Data.length) {
    return { weekly: [], patientName: '', error: false, status: 200 };
  }
  try {
    const row = body.Data[0];
    if (
      !row ||
      String(exactNumericPatientId(row.PatientID)) !==
        String(exactNumericPatientId(patientId)) ||
      typeof row.Name !== 'string' ||
      !row.Name.trim()
    ) {
      return patientScheduleFailure(200);
    }
    const start = calendarDate(String(row.StartDate).slice(0, 10));
    const end = calendarDate(String(row.EndDate).slice(0, 10));
    if (
      end < start ||
      days.some((day) => {
        const value = row[day];
        return (
          !Object.prototype.hasOwnProperty.call(row, day) ||
          (value != null &&
            typeof value !== 'string' &&
            (typeof value !== 'object' || Array.isArray(value)))
        );
      })
    ) {
      return patientScheduleFailure(200);
    }
    // Construct local calendar dates to avoid shifting a date-only week in UTC- zones.
    const scheduleDate = new Date(start + 'T00:00:00');
    const weekly = days.map((day) => {
      const date = new Date(scheduleDate);
      const activities = parseScheduleDay(
        getScheduleDayValue(row, day),
        date,
        row.PatientID,
        row.Name,
      );
      if (
        activities.some(
          (activity) =>
            Number.isNaN(activity.startTime.getTime()) ||
            Number.isNaN(activity.endTime.getTime()),
        )
      ) {
        throw new Error('Invalid schedule times.');
      }
      scheduleDate.setDate(scheduleDate.getDate() + 1);
      return {
        patientID: row.PatientID,
        patientName: row.Name,
        date,
        activities,
      };
    });
    return { weekly, patientName: row.Name.trim(), error: false, status: 200 };
  } catch {
    return patientScheduleFailure(200);
  }
};
