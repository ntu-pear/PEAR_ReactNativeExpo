export const primaryGuardianId = (response, patientId) => {
  if (!response?.ok) return null;
  let data = response.data?.data ?? response.data;
  if (Array.isArray(data))
    data = data.find(
      (entry) =>
        String(entry.patientId) === String(patientId) &&
        entry.active === 'Y' &&
        ![true, 1, '1', 'true'].includes(entry.isDeleted),
    );
  if (
    String(data?.patientId) !== String(patientId) ||
    data?.active !== 'Y' ||
    [true, 1, '1', 'true'].includes(data?.isDeleted) ||
    data?.guardianId == null
  )
    return null;
  return String(data.guardianId);
};
export const guardianRoleLabel = (guardian) =>
  guardian?.isPrimary === true
    ? 'Primary guardian'
    : guardian?.isPrimary === false
    ? 'Additional guardian'
    : 'Primary status unavailable';
