export const responseRows = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  throw new Error('The server returned an invalid list.');
};
const dateOnly = (value) => {
  if (!value) return null;
  const date = String(value).slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  )
    throw new Error('Enter a valid date as YYYY-MM-DD.');
  return date;
};
export const filterMedicationHistory = (records, from, to) => {
  const start = dateOnly(from);
  const end = dateOnly(to);
  if (start && end && start > end)
    throw new Error('The end date must be on or after the start date.');
  return records.filter((record) => {
    if (record.isDeleted) return false;
    if (!start && !end) return true;
    const recordStart = dateOnly(record.startDateTime);
    const recordEnd = dateOnly(record.endDateTime);
    if (!recordStart) return false;
    return (
      (!end || recordStart <= end) &&
      (!start || !recordEnd || recordEnd >= start)
    );
  });
};
export const joinMedicationNames = (records, catalogue, patientId) => {
  const names = new Map(
    catalogue.map((row) => [String(row.Id ?? row.id), row.Value ?? row.value]),
  );
  return records
    .filter((row) => String(row.patientID) === String(patientId))
    .map((row) => ({
      ...row,
      drugName:
        names.get(String(row.prescriptionListID)) || 'Drug name unavailable',
    }));
};
