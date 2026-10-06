import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { opaqueId } from 'app/utility/patientFieldPolicy';

const identifier = (value) => {
  const id = opaqueId(value);
  if (!/^[1-9]\d*$/.test(String(id))) {
    throw new Error('A valid record identifier is required.');
  }
  return id;
};
export const medicationCourseId = identifier;
const date = (value, optional = false) => {
  if (optional && (value === null || value === '')) {
    return null;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const calendar = value.slice(0, 10);
    if (
      new Date(calendar + 'T00:00:00Z').toISOString().slice(0, 10) !== calendar
    ) {
      throw new Error('Choose valid course dates.');
    }
  }
  const parsed = new Date(value);
  if (value == null || Number.isNaN(parsed.getTime())) {
    throw new Error('Choose valid course dates.');
  }
  return parsed.toISOString();
};
export const buildMedicationCourse = ({
  patientId,
  form,
  actorId,
  create = false,
  now = new Date(),
}) => {
  const start = date(form.startDateTime);
  const end = date(form.endDateTime, true);
  if (end && end < start) {
    throw new Error('End date must be on or after start date.');
  }
  const times = String(form.administerTime ?? '')
    .split(',')
    .map((s) => s.trim().replace(':', ''));
  if (
    !times.length ||
    times.some((t) => !/^(?:[01]\d|2[0-3])[0-5]\d$/.test(t))
  ) {
    throw new Error('Choose valid administration times.');
  }
  const actor = String(opaqueId(actorId));
  const payload = {
    IsDeleted: '0',
    PatientId: identifier(patientId),
    PrescriptionListId: identifier(form.prescriptionListID),
    AdministerTime: [...new Set(times)].sort().join(','),
    Dosage: String(form.dosage ?? '').trim(),
    Instruction: String(form.instruction ?? '').trim(),
    StartDate: start,
    EndDate: end,
    PrescriptionRemarks: String(form.prescriptionRemarks ?? '').trim(),
    UpdatedDateTime: now.toISOString(),
    ModifiedById: actor,
  };
  if (!payload.Dosage || !payload.Instruction || !payload.PrescriptionRemarks) {
    throw new Error('Complete dosage, instructions and remarks.');
  }
  if (create) {
    Object.assign(payload, {
      CreatedDateTime: payload.UpdatedDateTime,
      CreatedById: actor,
    });
  }
  return payload;
};

// Course writes and dose logging are separate entities. A durable marker prevents
// an uncertain create/update/delete from being replayed after navigation/restart.
export const createCourseWriter = ({
  storage = AsyncStorage,
  timeoutMs = 30000,
} = {}) => {
  const active = new Set();
  const uncertain = () => ({
    ok: false,
    status: 0,
    problem: 'UNCERTAIN_WRITE',
    data: {
      detail:
        'A previous medication change is unconfirmed. Check the records with the staging team before trying another change.',
    },
  });
  return async (patientId, prepare) => {
    let key;
    try {
      key = `@pear_course_pending:${identifier(patientId)}`;
    } catch (error) {
      return { ok: false, status: 400, data: { detail: error.message } };
    }
    if (active.has(key)) {
      return uncertain();
    }
    active.add(key);
    let sent = false;
    try {
      if (await requestDeadline(storage.getItem(key), timeoutMs)) {
        return uncertain();
      }
      const send = await requestDeadline(prepare(), timeoutMs);
      await requestDeadline(storage.setItem(key, 'pending'), timeoutMs);
      sent = true;
      const result = await requestDeadline(
        Promise.resolve().then(send),
        timeoutMs,
      );
      if (
        result?.ok ||
        [400, 401, 403, 404, 409, 422].includes(result?.status)
      ) {
        await requestDeadline(storage.removeItem(key), timeoutMs);
        return result;
      }
      return uncertain();
    } catch (error) {
      return sent
        ? uncertain()
        : {
            ok: false,
            status: 400,
            data: {
              detail: error.message || 'The medication change was not sent.',
            },
          };
    } finally {
      active.delete(key);
    }
  };
};
