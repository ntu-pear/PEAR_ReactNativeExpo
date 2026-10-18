import moment from 'moment';
import { centreDay } from 'app/utility/centreClock';

// Birth dates are civil dates, not instants in the device timezone.
export const patientAge = (dob, now = new Date()) => {
  const value =
    dob instanceof Date && Number.isFinite(dob.getTime())
      ? dob.toISOString()
      : dob;
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}(?:T[\d:.+Z-]+)?$/.test(value)
  ) {
    return null;
  }
  const birth = moment.utc(value.slice(0, 10), 'YYYY-MM-DD', true);
  const today = moment.utc(centreDay(now), 'YYYY-MM-DD', true);
  if (!birth.isValid() || birth.isAfter(today)) {
    return null;
  }
  return today.diff(birth, 'years');
};
