import { exclusionLifecycle, dateKey } from 'app/utility/exclusionLifecycle';
import { opaqueId } from 'app/utility/patientFieldPolicy';

export const activityEntityId = (value) => {
  const id = opaqueId(value);
  if (!/^[1-9]\d*$/.test(String(id))) {
    throw new Error('A valid activity or patient identifier is required.');
  }
  return id;
};
const deleted = (row) =>
  [true, 1, '1', 'true'].includes(
    row.isDeleted ?? row.is_deleted ?? row.IsDeleted,
  );
const idOf = (row) =>
  row.centreActivityID ??
  row.CentreActivityID ??
  row.centre_activity_id ??
  row.centreActivityId;
export const exclusionBlockedIds = (
  { preferences = [], recommendations = [], exclusions = [] },
  now = new Date(),
) => {
  const rows = [
    ...preferences.filter(
      (row) =>
        !deleted(row) && Number(row.isLike ?? row.IsLike ?? row.is_like) === -1,
    ),
    ...recommendations.filter(
      (row) =>
        !deleted(row) &&
        Number(
          row.doctorRecommendation ??
            row.doctor_recommendation ??
            row.DoctorRecommendation,
        ) === -1,
    ),
    // Pending and uncertain existing dates remain blocked, matching the current web's non-expired exclusions.
    ...exclusions.filter(
      (row) => !deleted(row) && exclusionLifecycle(row, now) !== 'Expired',
    ),
  ];
  return [...new Set(rows.map((row) => String(activityEntityId(idOf(row)))))];
};
export const validateExclusionDates = (startDate, endDate, indefinite) => {
  const start = String(startDate).trim();
  const end = indefinite ? null : String(endDate).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !dateKey(start)) {
    throw new Error('Enter a valid start date as YYYY-MM-DD.');
  }
  if (!indefinite && (!/^\d{4}-\d{2}-\d{2}$/.test(end) || !dateKey(end))) {
    throw new Error(
      'Enter a valid end date as YYYY-MM-DD, or tick Indefinite.',
    );
  }
  if (end && end < start) {
    throw new Error('End date must be on or after start date.');
  }
  return { startDate: start, endDate: end };
};
