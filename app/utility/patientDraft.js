import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'patientDraft';
const DRAFT_STEP_KEY = 'patientDraftStep';
const DRAFT_COMPONENTS_KEY = 'patientDraftComponents';

// Existing guardian identity comes from a fresh authenticated lookup, never a
// persisted draft. Retain only the new mode and non-identity relationship choice.
const sanitizeExistingGuardianDraft = (formData) => {
  if (!Array.isArray(formData?.guardianInfo)) {
    return formData;
  }
  return {
    ...formData,
    guardianInfo: formData.guardianInfo.map((guardian) =>
      guardian?.Mode === 'existing'
        ? {
            Mode: 'existing',
            RelationshipID: guardian.RelationshipID,
            RelationshipName: guardian.RelationshipName,
          }
        : guardian,
    ),
  };
};

/**
 * Save the current add-patient form state to AsyncStorage.
 * Dates are serialized as ISO strings.
 */
const saveDraft = async (formData, step, componentList) => {
  try {
    await AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(sanitizeExistingGuardianDraft(formData)),
    );
    await AsyncStorage.setItem(DRAFT_STEP_KEY, JSON.stringify(step));
    await AsyncStorage.setItem(
      DRAFT_COMPONENTS_KEY,
      JSON.stringify(componentList),
    );
  } catch (error) {
    console.log('Error saving patient draft:', error);
  }
};

/**
 * Load a previously saved draft. Returns null if no draft exists.
 * Dates stored as ISO strings are revived back to Date objects.
 */
const loadDraft = async () => {
  try {
    const [raw, rawStep, rawComponents] = await Promise.all([
      AsyncStorage.getItem(DRAFT_KEY),
      AsyncStorage.getItem(DRAFT_STEP_KEY),
      AsyncStorage.getItem(DRAFT_COMPONENTS_KEY),
    ]);

    if (!raw) return null;

    const formData = sanitizeExistingGuardianDraft(
      JSON.parse(raw, dateReviver),
    );
    const step = rawStep ? JSON.parse(rawStep) : 1;
    const componentList = rawComponents ? JSON.parse(rawComponents) : null;

    return { formData, step, componentList };
  } catch (error) {
    console.log('Error loading patient draft:', error);
    return null;
  }
};

/**
 * Remove the saved draft (e.g. after successful submit, login, or logout).
 */
const clearDraft = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(DRAFT_KEY),
      AsyncStorage.removeItem(DRAFT_STEP_KEY),
      AsyncStorage.removeItem(DRAFT_COMPONENTS_KEY),
    ]);
  } catch (error) {
    console.log('Error clearing patient draft:', error);
  }
};

/**
 * JSON reviver that converts ISO 8601 date strings back to Date objects.
 */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const dateReviver = (_key, value) => {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
};

export default { saveDraft, loadDraft, clearDraft };
