import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { uppercasePersonFields } from 'app/utility/patientFieldPolicy';
import { medicationCourseId } from 'app/utility/medicationCourse';
import {
  canSelectPrimaryGuardian,
  guardianRecords,
} from 'app/utility/guardianEditing';
import {
  guardianLookupResult,
  normalizeGuardianNric,
} from 'app/utility/guardianLookup';
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
export const validateCreationGuardians = (guardians, user) => {
  if (!Array.isArray(guardians) || !guardians.length || guardians.length > 2) {
    throw new Error(
      'Provide one primary guardian and at most one secondary guardian.',
    );
  }
  if (guardians[0].Mode === 'existing') {
    const primary = guardians[0];
    if (!canSelectPrimaryGuardian(user)) {
      throw new Error(
        'Only a supervisor may select an existing primary guardian.',
      );
    }
    medicationCourseId(primary.ExistingGuardianId);
    if (
      !filled(primary.NRIC) ||
      normalizeGuardianNric(primary.NRIC) !== primary.SelectedNric ||
      !filled(primary.RelationshipName)
    ) {
      throw new Error(
        'Search for and select the existing primary guardian again.',
      );
    }
    if (guardians.slice(1).some(hasGuardianInput)) {
      throw new Error(
        'Existing-primary registration supports one guardian. Remove the optional secondary guardian.',
      );
    }
    return;
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

export const withAtomicPrimaryGuardian = (patient, guardians, user) => {
  validateCreationGuardians(guardians, user);
  const result = uppercasePersonFields({
    ...patient,
    nric: creationNric(patient.nric),
    guardianRelationshipName: guardians[0].RelationshipName,
  });
  delete result.guardianId;
  delete result.newGuardian;
  if (guardians[0].Mode === 'existing') {
    result.guardianId = medicationCourseId(guardians[0].ExistingGuardianId);
  } else {
    result.newGuardian = guardianCreationFields(guardians[0]);
  }
  return result;
};
// The patient and primary link succeed together. Optional follow-ups are explicit
// partial outcomes and must never trigger another patient create.
export const createPatientWithPrimary = async ({
  api,
  patient,
  guardians,
  storage = AsyncStorage,
  user,
  guardianApi,
  isSelectionCurrent = () => true,
  timeoutMs = 30000,
}) => {
  const payload = withAtomicPrimaryGuardian(patient, guardians, user);
  const existing = guardians[0].Mode === 'existing';
  const selectedNric = existing ? guardians[0].SelectedNric : null;
  const selectionCurrent = () =>
    isSelectionCurrent() &&
    (!existing ||
      (guardians[0].Mode === 'existing' &&
        String(guardians[0].ExistingGuardianId) ===
          String(payload.guardianId) &&
        normalizeGuardianNric(guardians[0].NRIC) === selectedNric &&
        guardians[0].SelectedNric === selectedNric &&
        guardians[0].RelationshipName === payload.guardianRelationshipName));
  const key =
    '@pear_patient_create_pending:' +
    encodeURIComponent(String(payload.nric).toUpperCase());
  if (activeCreates.has(key)) {
    return { created: false, unknown: true, secondary: 'not_sent' };
  }
  activeCreates.add(key);
  try {
    if (await requestDeadline(storage.getItem(key), timeoutMs)) {
      return { created: false, unknown: true, secondary: 'not_sent' };
    }
    if (existing) {
      if (!guardianApi || !selectionCurrent()) {
        return { created: false, secondary: 'not_sent' };
      }
      const found = guardianLookupResult(
        await requestDeadline(
          guardianApi.getGuardianByNRIC(selectedNric),
          timeoutMs,
        ),
        selectedNric,
      );
      if (
        found.status !== 'found' ||
        String(found.id) !== String(payload.guardianId) ||
        found.patientIds.length >= 2 ||
        !selectionCurrent()
      ) {
        throw new Error(
          'The selected guardian changed or is already linked to two patients. Search again.',
        );
      }
    }
    await requestDeadline(storage.setItem(key, 'pending'), timeoutMs);
    if (!selectionCurrent()) {
      await requestDeadline(storage.removeItem(key), timeoutMs);
      return { created: false, secondary: 'not_sent' };
    }
    let response;
    try {
      response = await requestDeadline(
        Promise.resolve().then(() => api.addPatient(payload)),
        timeoutMs,
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
      // The new existing-primary path never infers rollback from an error
      // after submission. Keep the existing uncertain-create marker.
      if (existing) {
        return {
          response,
          created: false,
          unknown: true,
          secondary: 'not_sent',
        };
      }
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
    if (existing) {
      try {
        const [recordsResponse, allocationResponse] = await Promise.all([
          requestDeadline(guardianApi.getPatientGuardian(id, false), timeoutMs),
          requestDeadline(guardianApi.getPatientAllocation(id), timeoutMs),
        ]);
        const records = guardianRecords(recordsResponse, id);
        const allocation = allocationResponse?.data;
        medicationCourseId(allocation?.id);
        if (
          !selectionCurrent() ||
          !allocationResponse?.ok ||
          allocation?.active !== 'Y' ||
          allocation.isDeleted !== false ||
          String(medicationCourseId(allocation.patientId)) !== String(id) ||
          String(medicationCourseId(allocation.guardianId)) !==
            String(payload.guardianId) ||
          allocation.guardian2Id != null ||
          records.length !== 1 ||
          String(records[0].id) !== String(payload.guardianId) ||
          normalizeGuardianNric(records[0].nric) !== selectedNric ||
          records[0].relationshipName !== payload.guardianRelationshipName
        ) {
          throw new Error(
            'The existing primary guardian outcome is not confirmed.',
          );
        }
      } catch (error) {
        return {
          response,
          created: false,
          unknown: true,
          primaryUnverified: true,
          secondary: 'not_sent',
        };
      }
    }
    await requestDeadline(storage.removeItem(key), timeoutMs);
    const secondary = guardians[1];
    if (existing || !secondary || !hasGuardianInput(secondary)) {
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
