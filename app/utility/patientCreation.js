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
// NRIC identity is case-insensitive; only outer whitespace is normalized.
const creationNric = (value) => {
  if (!filled(value)) {
    throw new Error('A complete patient identity is required.');
  }
  return value.trim().toUpperCase();
};

export const withAtomicPrimaryGuardian = (patient, guardians) => {
  validateCreationGuardians(guardians);
  return uppercasePersonFields({
    ...patient,
    nric: creationNric(patient.nric),
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
    // The canonical endpoint returns SingleResponse[Patient]. A valid ID alone
    // cannot authorize writes to a possibly different patient. Missing/mismatched
    // response identity is unconfirmed success, never evidence of rollback.
    const row = response.data?.data;
    let id;
    try {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new Error('The canonical patient response is unavailable.');
      }
      id = medicationCourseId(row.id);
      if (
        creationNric(row.nric) !== payload.nric ||
        [1, '1', true].includes(row.isDeleted)
      ) {
        throw new Error('The returned patient identity could not be verified.');
      }
    } catch (error) {
      return {
        response,
        created: false,
        unknown: true,
        invalidIdentity: true,
        secondary: 'not_sent',
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
