import { currentUserId } from 'app/utility/medicationAdminister';
import { opaqueId } from 'app/utility/patientFieldPolicy';

export const canEditGuardian = (user) =>
  ['SUPERVISOR', 'CAREGIVER'].includes(
    String(user?.roleName || user?.role || '').toUpperCase(),
  );
export const canSelectPrimaryGuardian = (user) =>
  String(user?.roleName || user?.role || '').toUpperCase() === 'SUPERVISOR';

export const guardianRecords = (response, patientId) => {
  if (!response?.ok)
    throw new Error('Guardian information could not be loaded.');
  let data = response.data?.data ?? response.data;
  if (Array.isArray(data)) {
    data = data.find(
      (entry) =>
        String(entry.patient?.id ?? entry.patient?.patientID) ===
        String(patientId),
    );
  }
  const returnedId = data?.patient?.id ?? data?.patient?.patientID;
  if (
    String(returnedId) !== String(patientId) ||
    !Array.isArray(data?.patient_guardians)
  ) {
    throw new Error('The guardian response did not match this patient.');
  }
  return data.patient_guardians.map((entry) => ({
    ...entry.patient_guardian,
    relationshipName: entry.relationshipName,
  }));
};

export const buildGuardianUpdate = ({ guardian, edits, patientId, user }) => {
  if (!canEditGuardian(user) || !currentUserId(user))
    throw new Error('Guardian editing is unavailable for this account.');
  if (
    !guardian?.id ||
    !guardian.firstName ||
    !guardian.lastName ||
    !guardian.nric ||
    /\*|x{2,}/i.test(guardian.nric) ||
    !guardian.dateOfBirth
  ) {
    throw new Error(
      'The complete guardian identity is unavailable. Reload before editing.',
    );
  }
  if (!edits.contactNo?.trim() || !edits.relationshipName?.trim())
    throw new Error('Contact number and relationship are required.');
  // The endpoint is a full update: preserve identity, status and login linkage
  // from a fresh read, not defaults or the profile display projection.
  return {
    active: guardian.active,
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    preferredName: edits.preferredName || null,
    gender: guardian.gender,
    contactNo: edits.contactNo.trim(),
    nric: guardian.nric,
    email: edits.email?.trim() || null,
    dateOfBirth: guardian.dateOfBirth,
    address: edits.address,
    tempAddress: edits.tempAddress || null,
    status: guardian.status,
    isDeleted: guardian.isDeleted,
    guardianApplicationUserId: guardian.guardianApplicationUserId,
    ModifiedById: String(currentUserId(user)),
    patientId: opaqueId(patientId),
    relationshipName: edits.relationshipName.trim(),
  };
};

export const buildPrimaryGuardianUpdate = ({
  allocation,
  guardians,
  guardianId,
  patientId,
  user,
}) => {
  if (!canSelectPrimaryGuardian(user) || !currentUserId(user))
    throw new Error('Only a supervisor may select the primary guardian.');
  if (
    !allocation?.id ||
    String(allocation.patientId) !== String(patientId) ||
    allocation.active !== 'Y' ||
    allocation.isDeleted
  ) {
    throw new Error('An active allocation for this patient is required.');
  }
  if (
    !guardians.some(
      (guardian) =>
        String(guardian.id) === String(guardianId) &&
        guardian.isDeleted === '0' &&
        guardian.active === 'Y',
    )
  ) {
    throw new Error('The selected guardian must still be linked and active.');
  }
  const payload = {};
  [
    'active',
    'patientId',
    'guardianId',
    'guardian2Id',
    'doctorId',
    'tempDoctorId',
    'gameTherapistId',
    'supervisorId',
    'caregiverId',
    'tempCaregiverId',
  ].forEach((key) => {
    payload[key] = allocation[key] ?? null;
  });
  if (String(allocation.guardianId) !== String(guardianId)) {
    payload.guardian2Id = allocation.guardianId;
  }
  payload.guardianId = opaqueId(guardianId);
  payload.ModifiedById = String(currentUserId(user));
  return payload;
};
