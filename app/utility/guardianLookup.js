import requestDeadline from 'app/utility/requestDeadline';
import { medicationCourseId } from 'app/utility/medicationCourse';
import { nricValid } from 'app/utility/inputValidation';

export const normalizeGuardianNric = (value) =>
  String(value || '')
    .trim()
    .toUpperCase();

export const guardianLookupResult = (response, query) => {
  const nric = normalizeGuardianNric(query);
  if (!response?.ok) {
    if (
      response?.status === 404 &&
      response.data?.detail === 'Guardian not found'
    ) {
      return { status: 'not_found', nric };
    }
    throw new Error('Guardian search failed. Check your connection and retry.');
  }
  const data = response.data?.data ?? response.data;
  const guardian = data?.patient_guardian;
  if (
    !guardian ||
    normalizeGuardianNric(guardian.nric) !== nric ||
    guardian.active !== 'Y' ||
    guardian.isDeleted !== '0' ||
    !Array.isArray(data.patients)
  ) {
    throw new Error('The guardian search result could not be verified.');
  }
  const id = medicationCourseId(guardian.id);
  const patientIds = data.patients.map((entry) =>
    medicationCourseId(entry.patient?.id),
  );
  if (new Set(patientIds.map(String)).size !== patientIds.length) {
    throw new Error('The guardian memberships are ambiguous.');
  }
  return {
    status: 'found',
    nric,
    id,
    patientIds,
    name: [guardian.firstName, guardian.lastName].filter(Boolean).join(' '),
  };
};

// Query changes and cancellation invalidate a read immediately, even before
// React commits. A late result cannot select a guardian for a different query.
export const createGuardianLookup = ({ lookup, timeoutMs = 30000 }) => {
  let query = '';
  let generation = 0;
  return {
    setQuery(value) {
      query = normalizeGuardianNric(value);
      generation += 1;
    },
    cancel() {
      generation += 1;
    },
    async search() {
      const expected = query;
      const attempt = ++generation;
      if (!/^[STFGM]\d{7}[A-Z]$/.test(expected) || nricValid(expected)) {
        return { status: 'error', message: 'Enter a complete valid NRIC.' };
      }
      try {
        const response = await requestDeadline(lookup(expected), timeoutMs);
        if (generation !== attempt) {
          return { status: 'stale' };
        }
        return guardianLookupResult(response, expected);
      } catch (error) {
        return generation !== attempt
          ? { status: 'stale' }
          : {
              status: 'error',
              message: error.message || 'Guardian search failed.',
            };
      }
    },
  };
};
