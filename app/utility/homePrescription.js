import { medicationCourseId } from 'app/utility/medicationCourse';
import { opaqueId } from 'app/utility/patientFieldPolicy';
const chronic = (v) =>
  [true, 1, '1'].includes(v)
    ? true
    : [false, 0, '0'].includes(v)
    ? false
    : null;
const yes = (v) => v === true || v === 1 || v === '1';
const stamp = (value, optional = false) => {
  if (optional && (value == null || value === '')) {
    return null;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const day = value.slice(0, 10);
    if (new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) !== day) {
      throw new Error('Choose valid prescription dates.');
    }
  }
  const parsed = new Date(value);
  if (value == null || Number.isNaN(parsed.getTime())) {
    throw new Error('Choose valid prescription dates.');
  }
  return parsed.toISOString();
};
export const normalizeHomePrescription = (r = {}) => ({
  prescriptionID: r.Id ?? r.prescriptionID ?? r.id,
  patientID: r.PatientId ?? r.patientID,
  prescriptionListID: r.PrescriptionListId ?? r.prescriptionListID,
  dosage: r.Dosage ?? r.dosage ?? '',
  frequencyPerDay: r.FrequencyPerDay ?? r.frequencyPerDay ?? 1,
  instruction: r.Instruction ?? r.instruction ?? '',
  startDate: r.StartDate ?? r.startDate,
  endDate: r.EndDate ?? r.endDate ?? null,
  afterMeal:
    (r.IsAfterMeal ?? r.afterMeal) == null || r.IsAfterMeal === '2'
      ? null
      : yes(r.IsAfterMeal ?? r.afterMeal),
  status: r.Status ?? null,
  isAfterMeal: r.IsAfterMeal ?? (yes(r.afterMeal) ? '1' : '0'),
  isChronic: chronic(r.Status ?? r.isChronic),
  prescriptionRemarks: r.PrescriptionRemarks ?? r.prescriptionRemarks ?? '',
  prescriptionListDesc: r.PrescriptionName ?? r.prescriptionListDesc ?? '',
  date: r.CreatedDateTime ?? r.date ?? null,
  isDeleted: yes(r.IsDeleted ?? r.isDeleted),
});
export const buildHomePrescription = ({
  patientId,
  form,
  actorId,
  existing,
  create = false,
  now = new Date(),
}) => {
  const start = stamp(form.startDate),
    end = stamp(form.endDate, true);
  if (end && end < start) {
    throw new Error('End date must be on or after start date.');
  }
  const frequency = Number(form.frequencyPerDay);
  if (!Number.isSafeInteger(frequency) || frequency < 1) {
    throw new Error('Choose a positive whole frequency per day.');
  }
  const payload = {
    IsDeleted: '0',
    PatientId: medicationCourseId(patientId),
    PrescriptionListId: medicationCourseId(form.prescriptionListID),
    Dosage: String(form.dosage ?? '').trim(),
    FrequencyPerDay: frequency,
    Instruction: String(form.instruction ?? '').trim(),
    StartDate: start,
    EndDate: end,
    IsAfterMeal:
      form.afterMeal == null
        ? existing?.IsAfterMeal ?? '2'
        : yes(form.afterMeal)
        ? '1'
        : '0',
    PrescriptionRemarks: String(form.prescriptionRemarks ?? '').trim(),
    Status:
      form.isChronic == null
        ? existing?.Status ?? null
        : yes(form.isChronic)
        ? '1'
        : '0',
    UpdatedDateTime: now.toISOString(),
    ModifiedById: String(opaqueId(actorId)),
  };
  if (!payload.Dosage || !payload.Instruction || !payload.PrescriptionRemarks) {
    throw new Error('Complete dosage, instructions and remarks.');
  }
  if (create) {
    Object.assign(payload, {
      CreatedDateTime: payload.UpdatedDateTime,
      CreatedById: payload.ModifiedById,
    });
  }
  return payload;
};
