import { currentUserId } from 'app/utility/medicationAdminister';
import { medicationCourseId } from 'app/utility/medicationCourse';
import {
  opaqueId,
  uppercasePersonFields,
} from 'app/utility/patientFieldPolicy';

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
    String(medicationCourseId(returnedId)) !==
      String(medicationCourseId(patientId)) ||
    !Array.isArray(data?.patient_guardians)
  ) {
    throw new Error('The guardian response did not match this patient.');
  }
  return data.patient_guardians.map((entry) => ({
    ...entry.patient_guardian,
    id: medicationCourseId(entry.patient_guardian?.id),
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
  return uppercasePersonFields({
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
  });
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
  const id = medicationCourseId(patientId);
  const selected = medicationCourseId(guardianId);
  if (
    !allocation?.id ||
    String(medicationCourseId(allocation.patientId)) !== String(id) ||
    allocation.active !== 'Y' ||
    allocation.isDeleted !== false
  ) {
    throw new Error('An active allocation for this patient is required.');
  }
  medicationCourseId(allocation.id);
  const linked = guardians.map((guardian) => {
    if (guardian.isDeleted !== '0' || guardian.active !== 'Y') {
      throw new Error(
        'Every linked guardian must be active. Reload the profile.',
      );
    }
    return medicationCourseId(guardian.id);
  });
  const slots = [medicationCourseId(allocation.guardianId)];
  if (allocation.guardian2Id != null) {
    slots.push(medicationCourseId(allocation.guardian2Id));
  }
  if (
    linked.length < 1 ||
    linked.length > 2 ||
    new Set(linked.map(String)).size !== linked.length ||
    new Set(slots.map(String)).size !== slots.length ||
    linked.length !== slots.length ||
    linked.some(
      (value) => !slots.some((slot) => String(slot) === String(value)),
    ) ||
    !linked.some((value) => String(value) === String(selected))
  ) {
    throw new Error(
      'Guardian relationships and allocation disagree. Reload before changing the primary guardian.',
    );
  }
  // Current Patient CRUD uses exclude_unset=True. Omit all staff fields so a
  // guardian switch cannot overwrite a concurrent staff allocation change.
  return {
    patientId: id,
    guardianId: selected,
    guardian2Id:
      linked.find((value) => String(value) !== String(selected)) ?? null,
    ModifiedById: String(opaqueId(currentUserId(user))),
  };
};
