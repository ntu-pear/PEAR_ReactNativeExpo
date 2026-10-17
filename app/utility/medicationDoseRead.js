import {
  exactNumericPatientId,
  listMedicationScheduleRows,
} from 'app/utility/medicationAdminister';

export const medicationDoseKey = (row) =>
  JSON.stringify([
    String(row.PatientID),
    row.PrescriptionName.trim().toLowerCase(),
    row.AdministerDate,
    row.AdministerTime,
  ]);

// Preserve the server's authorized scope. A bad/ambiguous slot cannot be acted on.
export const medicationDoseRows = (payload) => {
  const keys = new Set();
  return listMedicationScheduleRows(payload).map((row) => {
    if (
      !row ||
      typeof row.PrescriptionName !== 'string' ||
      !row.PrescriptionName.trim() ||
      typeof row.AdministerTime !== 'string' ||
      typeof row.AdministerDate !== 'string' ||
      ['AssignedTo', 'AdministeredBy', 'ActualAdministerTime'].some(
        (field) =>
          row[field] != null &&
          !['string', 'number'].includes(typeof row[field]),
      ) ||
      !['0', '1'].includes(String(row.Status)) ||
      !/^\d{4}$/.test(String(row.AdministerTime)) ||
      Number(String(row.AdministerTime).slice(0, 2)) > 23 ||
      Number(String(row.AdministerTime).slice(2)) > 59 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.AdministerDate || '') ||
      !Number.isFinite(Date.parse(row.AdministerDate + 'T00:00:00Z')) ||
      new Date(row.AdministerDate + 'T00:00:00Z').toISOString().slice(0, 10) !==
        row.AdministerDate
    ) {
      throw new Error('The medication schedule contains an invalid dose.');
    }
    exactNumericPatientId(row.PatientID);
    const key = medicationDoseKey(row);
    if (keys.has(key))
      throw new Error('The medication schedule contains an ambiguous dose.');
    keys.add(key);
    return row;
  });
};

export const medicationReadMessage = (status) => {
  if (status === 401)
    return 'Your login has expired. Sign in again to view today’s medication.';
  if (status === 403)
    return 'You do not have access to this medication schedule.';
  if (status === 503)
    return 'A required service is unavailable. Retry shortly.';
  return 'Today’s medication could not be loaded. Check the VPN connection and retry.';
};
