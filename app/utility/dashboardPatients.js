import { readAllPages } from 'app/utility/pagedRead';
import { currentUserId } from 'app/utility/medicationAdminister';

export const loadDashboardPatients = async ({ api, mode, user }) => {
  const actor = currentUserId(user);
  const role = String(user?.roleName || user?.role || '').toUpperCase();
  if (
    !actor ||
    !['SUPERVISOR', 'CAREGIVER', 'DOCTOR', 'GUARDIAN'].includes(role)
  ) {
    throw new Error('A supported signed-in user is required.');
  }
  const readPage =
    mode === 'myPatients'
      ? (page) => api.listMyPatientsV1(actor, role, { ...page, isActive: '1' })
      : mode === 'allPatients'
      ? (page) =>
          api.listPatientsV1({
            ...page,
            isActive: '1',
            require_auth: true,
            mask: true,
          })
      : null;
  if (!readPage) {
    throw new Error('Choose a supported patient scope.');
  }
  const rows = await readAllPages(readPage, {
    idOf: (r) => r.id ?? r.patientID ?? r.patientId,
  });
  return rows.map(api.normalizePatientV1);
};
