export const canUseMobile = (user) =>
  ['SUPERVISOR', 'CAREGIVER', 'DOCTOR'].includes(
    String(user?.roleName || user?.role || '').toUpperCase(),
  );
