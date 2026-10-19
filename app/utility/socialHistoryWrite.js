import requestDeadline from 'app/utility/requestDeadline';
import { socialHistoryCanEdit } from 'app/utility/socialHistoryFields';

const expectedFields = (form) => ({
  patientId: form.PatientID,
  liveWithListId: form.LiveWithListId,
  educationListId: form.EducationListId,
  occupationListId: form.OccupationListId,
  religionListId: form.ReligionListId,
  petListId: form.PetListId,
  dietListId: form.DietListId,
  exercise: form.ExerciseDisplay ?? form.Exercise,
  sexuallyActive: form.SexuallyActiveDisplay ?? form.SexuallyActive,
  drugUse: form.DrugUseDisplay ?? form.DrugUse,
  caffeineUse: form.CaffeineUseDisplay ?? form.CaffeineUse,
  alcoholUse: form.AlcoholUseDisplay ?? form.AlcoholUse,
  tobaccoUse: form.TobaccoUseDisplay ?? form.TobaccoUse,
  secondHandSmoker: form.SecondhandSmokerDisplay ?? form.SecondhandSmoker,
});

export const socialHistoryMatches = (form, record) => {
  if (
    !record ||
    !Number.isInteger(Number(record.id)) ||
    Number(record.id) < 1
  ) {
    return false;
  }
  const existingId = form.SocialHistoryId ?? form.id;
  if (existingId != null && String(existingId) !== String(record.id)) {
    return false;
  }
  return Object.entries(expectedFields(form)).every(
    ([key, value]) => value != null && String(record[key]) === String(value),
  );
};

// An accepted write followed by a failed read must never invite another create.
export const writeSocialHistory = async ({
  form,
  api,
  sourceRecord,
  isCurrent = () => true,
}) => {
  if (!isCurrent()) {
    return { outcome: 'stale' };
  }
  if (
    sourceRecord &&
    Object.keys(sourceRecord).length > 0 &&
    !socialHistoryCanEdit(sourceRecord)
  ) {
    return {
      outcome: 'rejected',
      message: 'This privacy-limited record cannot be safely updated.',
    };
  }
  const patientId = Number(form.PatientID);
  if (!Number.isInteger(patientId) || patientId < 1) {
    return {
      outcome: 'rejected',
      message: 'The patient could not be identified.',
    };
  }
  let accepted = false;
  try {
    const add = !form.SocialHistoryId && !form.id;
    const response = await requestDeadline(
      add ? api.addSocialHistory(form) : api.updateSocialHistory(form),
    );
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    if (!response?.ok) {
      const rejected = response?.status >= 400 && response?.status < 500;
      return {
        outcome: rejected ? 'rejected' : 'uncertain',
        accepted: false,
        message:
          rejected && typeof response.data?.detail === 'string'
            ? response.data.detail
            : 'The save could not be confirmed. Return to the profile and check before saving again.',
      };
    }
    accepted = true;
    const read = await requestDeadline(api.getSocialHistory(patientId));
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    const record = read?.data?.data ?? read?.data;
    if (!read?.ok || !socialHistoryMatches(form, record)) {
      return {
        outcome: 'uncertain',
        accepted: true,
        message:
          'The save was accepted, but the saved record could not be reloaded and verified. Return to the profile to check it before making another change.',
      };
    }
    return { outcome: 'verified', record };
  } catch {
    return {
      outcome: isCurrent() ? 'uncertain' : 'stale',
      accepted,
      message:
        'The save could not be confirmed. Return to the profile and check before saving again.',
    };
  }
};
