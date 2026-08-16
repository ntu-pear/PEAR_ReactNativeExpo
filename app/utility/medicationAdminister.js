export const currentUserId = (user) =>
  user?.id || user?.userID || user?.userId || user?.user_id || '';

export const idsEqual = (a, b) => {
  if (a == null || b == null) return false;
  const left = String(a).trim().toLowerCase();
  const right = String(b).trim().toLowerCase();
  if (!left || !right || left === 'unassigned' || right === 'unassigned') {
    return false;
  }
  return left === right;
};

export const isAssignedCaregiver = ({
  userId,
  assignedTo,
  caregiverId,
  tempCaregiverId,
} = {}) =>
  idsEqual(userId, assignedTo) ||
  idsEqual(userId, caregiverId) ||
  idsEqual(userId, tempCaregiverId);

export const normalizeAdministerTime = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`;
  }
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('T')) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return normalizeAdministerTime(parsed);
  }
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length >= 4) return digits.slice(0, 4);
  return digits;
};

export const todayAdministerDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const listMedicationScheduleRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const matchMedicationScheduleRow = (
  rows,
  { patientID, prescriptionName, administerTime } = {},
) => {
  const pid = String(patientID ?? '');
  const name = String(prescriptionName || '').trim().toLowerCase();
  const time = normalizeAdministerTime(administerTime);
  if (!pid || !name || !time) return null;
  return (
    (rows || []).find((row) => {
      const rowPid = String(row.PatientID ?? row.patientId ?? '');
      const rowName = String(
        row.PrescriptionName ?? row.prescriptionName ?? '',
      )
        .trim()
        .toLowerCase();
      const rowTime = normalizeAdministerTime(
        row.AdministerTime ?? row.administerTime,
      );
      return rowPid === pid && rowName === name && rowTime === time;
    }) || null
  );
};

export const assignedCaregiverIdFrom = ({ row, allocation } = {}) =>
  row?.AssignedTo ??
  row?.assignedTo ??
  allocation?.caregiverId ??
  allocation?.tempCaregiverId ??
  null;

export const buildMedicationScheduleUpdate = ({
  row,
  userId,
  patientID,
  prescriptionName,
  administerTime,
} = {}) => ({
  PatientID: Number(row?.PatientID ?? row?.patientId ?? patientID),
  PrescriptionName:
    row?.PrescriptionName ?? row?.prescriptionName ?? prescriptionName,
  AdministerDate:
    row?.AdministerDate ?? row?.administerDate ?? todayAdministerDate(),
  AdministerTime:
    row?.AdministerTime ??
    row?.administerTime ??
    normalizeAdministerTime(administerTime),
  Status: '1',
  AdministeredBy: String(userId || ''),
});

export const logMedicationAdministration = async ({
  getSchedule,
  updateSchedule,
  patientID,
  prescriptionName,
  administerTime,
  userId,
} = {}) => {
  if (!getSchedule || !updateSchedule) {
    return { ok: false, reason: 'missing_client' };
  }
  if (!userId) {
    return { ok: false, reason: 'missing_user' };
  }

  const listRes = await getSchedule();
  if (!listRes?.ok) {
    return {
      ok: false,
      status: listRes?.status,
      reason: 'schedule_unavailable',
      data: listRes?.data,
    };
  }

  const rows = listMedicationScheduleRows(listRes.data);
  const row = matchMedicationScheduleRow(rows, {
    patientID,
    prescriptionName,
    administerTime,
  });
  if (!row) {
    return {
      ok: false,
      status: 404,
      reason: 'slot_not_found',
      assignedTo: assignedCaregiverIdFrom({ row: null }),
      data: listRes.data,
    };
  }

  if (String(row.Status ?? row.status) === '1') {
    return {
      ok: false,
      status: 400,
      reason: 'already_administered',
      assignedTo: assignedCaregiverIdFrom({ row }),
      data: row,
    };
  }

  const payload = buildMedicationScheduleUpdate({
    row,
    userId,
    patientID,
    prescriptionName,
    administerTime,
  });
  const updateRes = await updateSchedule(payload);
  if (!updateRes?.ok) {
    return {
      ok: false,
      status: updateRes?.status,
      reason: 'update_failed',
      assignedTo: assignedCaregiverIdFrom({ row }),
      data: updateRes?.data,
    };
  }

  return {
    ok: true,
    status: updateRes.status,
    assignedTo: assignedCaregiverIdFrom({ row }),
    data: updateRes.data,
  };
};

export const administrationFailureMessage = (reason) => {
  switch (reason) {
    case 'schedule_unavailable':
      return 'Today’s medication schedule could not be loaded from the scheduler. Administration was not recorded.';
    case 'slot_not_found':
      return 'No matching medication slot was found for today. Administration was not recorded.';
    case 'already_administered':
      return 'This medication has already been marked as administered.';
    case 'update_failed':
      return 'The scheduler rejected the administration update. Administration was not recorded.';
    case 'missing_user':
      return 'Your user id is missing, so administration cannot be recorded.';
    default:
      return 'Administration was not recorded. The scheduler endpoint is pending or unavailable.';
  }
};
