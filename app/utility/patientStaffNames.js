// Adds caregiver, doctor and supervisor names to patients from their active
// allocation, matching the web "All Patients" view. Staff names come from the
// User service; any ID it does not list is resolved individually.
const STAFF_FIELDS = [
  'caregiverId',
  'doctorId',
  'supervisorId',
  'gameTherapistId',
];

export const enrichPatientsWithStaffNames = async ({
  patients,
  patientApi,
  userApi,
}) => {
  const [allocationMap, staffNameMap] = await Promise.all([
    patientApi.getAllocationMap(),
    userApi.buildStaffNameMap(),
  ]);

  const missingIds = new Set();
  for (const alloc of Object.values(allocationMap)) {
    for (const field of STAFF_FIELDS) {
      if (alloc[field] && !staffNameMap[alloc[field]]) {
        missingIds.add(alloc[field]);
      }
    }
  }

  await Promise.all(
    [...missingIds].map(async (uid) => {
      try {
        const r = await userApi.getUsernameById(uid);
        if (r.ok && r.data) {
          staffNameMap[uid] =
            r.data.preferredName || r.data.nric_FullName || uid;
        }
      } catch {
        // Leave the name unresolved; the row shows "No Caregiver".
      }
    }),
  );

  return patients.map((p) => {
    const alloc = allocationMap[String(p.patientID)];
    if (!alloc) {
      return p;
    }
    return {
      ...p,
      caregiverName: p.caregiverName || staffNameMap[alloc.caregiverId] || null,
      doctorName: p.doctorName || staffNameMap[alloc.doctorId] || null,
      supervisorName:
        p.supervisorName || staffNameMap[alloc.supervisorId] || null,
    };
  });
};
