import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { uppercasePersonFields } from 'app/utility/patientFieldPolicy';
import { medicationCourseId } from 'app/utility/medicationCourse';
const activeCreates = new Set();
const filled = (v) => typeof v === 'string' && Boolean(v.trim());
export const hasGuardianInput = (g = {}) =>
  [
    'FirstName',
    'LastName',
    'NRIC',
    'ContactNo',
    'Address',
    'Email',
    'PreferredName',
    'TempAddress',
  ].some((k) => filled(g[k]));
export const validateCreationGuardians = (guardians) => {
  if (!Array.isArray(guardians) || !guardians.length || guardians.length > 2) {
    throw new Error(
      'Provide one primary guardian and at most one secondary guardian.',
    );
  }
  guardians.forEach((g, i) => {
    if (i && !hasGuardianInput(g)) {
      return;
    }
    if (
      ![
        'FirstName',
        'LastName',
        'NRIC',
        'ContactNo',
        'Address',
        'RelationshipName',
      ].every((k) => filled(g[k])) ||
      !g.DOB ||
      Number.isNaN(new Date(g.DOB).getTime()) ||
      (g.IsChecked && !filled(g.Email))
    ) {
      throw new Error(
        `Complete guardian ${i + 1} or remove the optional secondary guardian.`,
      );
    }
  });
};
export const guardianCreationFields = (g) =>
  uppercasePersonFields({
    active: 'Y',
    firstName: g.FirstName.trim(),
    lastName: g.LastName.trim(),
    preferredName: g.PreferredName || '',
    gender: g.Gender || 'M',
    contactNo: g.ContactNo,
    nric: g.NRIC.trim().toUpperCase(),
    dateOfBirth: new Date(g.DOB).toISOString(),
    address: g.Address,
    tempAddress: g.TempAddress || '',
    status: 'active',
    ...(g.IsChecked ? { email: g.Email.trim() } : {}),
  });
export const withAtomicPrimaryGuardian = (patient, guardians) => {
  validateCreationGuardians(guardians);
  return uppercasePersonFields({
    ...patient,
    newGuardian: guardianCreationFields(guardians[0]),
    guardianRelationshipName: guardians[0].RelationshipName,
  });
};
// The patient and primary link succeed together. Optional follow-ups are explicit
// partial outcomes and must never trigger another patient create.
export const createPatientWithPrimary = async ({
  api,
  patient,
  guardians,
  storage = AsyncStorage,
}) => {
  const payload = withAtomicPrimaryGuardian(patient, guardians);
  const key =
    '@pear_patient_create_pending:' +
    encodeURIComponent(String(payload.nric).toUpperCase());
  if (activeCreates.has(key)) {
    return { created: false, unknown: true, secondary: 'not_sent' };
  }
  activeCreates.add(key);
  try {
    if (await requestDeadline(storage.getItem(key))) {
      return { created: false, unknown: true, secondary: 'not_sent' };
    }
    await requestDeadline(storage.setItem(key, 'pending'));
    let response;
    try {
      response = await requestDeadline(
        Promise.resolve().then(() => api.addPatient(payload)),
      );
    } catch (error) {
      return { created: false, unknown: true, secondary: 'not_sent' };
    }
    if (
      !response?.ok &&
      ![400, 401, 403, 404, 409, 422].includes(response?.status)
    ) {
      return { response, created: false, unknown: true, secondary: 'not_sent' };
    }
    if (!response?.ok) {
      await storage.removeItem(key);
      return { response, created: false, secondary: 'not_sent' };
    }
    const row = response.data?.data ?? response.data;
    let id;
    try {
      id = medicationCourseId(row?.id ?? row?.patientId);
    } catch (error) {
      return { response, created: false, unknown: true, invalidIdentity: true };
    }
    if (!id || [1, '1', true].includes(row?.isDeleted)) {
      return {
        response,
        created: false,
        unknown: true,
        patientId: id,
        secondary: 'unknown',
        invalidIdentity: true,
      };
    }
    await storage.removeItem(key);
    const secondary = guardians[1];
    if (!secondary || !hasGuardianInput(secondary)) {
      return {
        response,
        created: true,
        patientId: id,
        secondary: 'not_requested',
      };
    }
    try {
      const result = await requestDeadline(
        api.addGuardian({
          ...guardianCreationFields(secondary),
          isDeleted: '0',
          patientId: id,
          relationshipName: secondary.RelationshipName,
        }),
      );
      return {
        response,
        created: true,
        patientId: id,
        secondary: result?.ok
          ? 'added'
          : [400, 401, 403, 404, 409, 422].includes(result?.status)
          ? 'failed'
          : 'unknown',
      };
    } catch (error) {
      return { response, created: true, patientId: id, secondary: 'unknown' };
    }
  } finally {
    activeCreates.delete(key);
  }
};
