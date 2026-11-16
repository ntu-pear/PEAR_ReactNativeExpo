// Names for Today's Medication. The dose schedule supplies only patient and
// staff IDs, so names are looked up after the doses are shown: one patient
// read per patient in today's doses, and the active staff list (with a
// single-user read for any ID it does not include). An ID that cannot be
// resolved keeps its ID label, so a failed lookup never hides a dose.

export const patientLabel = (row, names) =>
  names?.patients?.[String(row.PatientID)] || `Patient ${row.PatientID}`;

export const staffLabel = (id, names) => {
  if (id == null || String(id).trim() === '') return null;
  return names?.staff?.[String(id)] || String(id);
};

const present = (value) => value != null && String(value).trim() !== '';

export const loadDoseNames = async ({ rows, patientApi, userApi }) => {
  const patientIds = [...new Set(rows.map((row) => String(row.PatientID)))];
  const staffIds = [
    ...new Set(
      rows
        .flatMap((row) => [row.AssignedTo, row.AdministeredBy])
        .filter(present)
        .map(String),
    ),
  ];

  const [patientResults, staffMap] = await Promise.all([
    Promise.allSettled(patientIds.map((id) => patientApi.readPatientV1(id))),
    staffIds.length
      ? userApi.buildStaffNameMap().catch(() => ({}))
      : Promise.resolve({}),
  ]);

  const patients = {};
  patientResults.forEach((result, index) => {
    const patient =
      result.status === 'fulfilled' && result.value?.ok
        ? result.value.data?.data
        : null;
    const name = patient && (patient.fullName || patient.preferredName);
    if (present(name)) patients[patientIds[index]] = String(name).trim();
  });

  const staff = {};
  const missing = [];
  for (const id of staffIds) {
    if (present(staffMap?.[id]) && staffMap[id] !== id)
      staff[id] = staffMap[id];
    else missing.push(id);
  }
  const single = await Promise.allSettled(
    missing.map((id) => userApi.getUsernameById(id)),
  );
  single.forEach((result, index) => {
    const user =
      result.status === 'fulfilled' && result.value?.ok
        ? result.value.data
        : null;
    const name = user && (user.preferredName || user.nric_FullName);
    if (present(name)) staff[missing[index]] = String(name).trim();
  });

  return { patients, staff };
};
