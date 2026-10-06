import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import {
  buildMedicationScheduleUpdate,
  listMedicationScheduleRows,
  matchMedicationScheduleRow,
  normalizeAdministerTime,
  todayAdministerDate,
} from 'app/utility/medicationAdminister';

const definitiveRejection = (response) =>
  response?.ok === false &&
  [400, 401, 403, 404, 409, 422].includes(response.status);

// A marker survives navigation, logout and app restart. It is removed only after
// an accepted write, an administered status, or rejected-write + untaken status.
export const medicationAttemptKey = (args) =>
  `@pear_staging_med_write:${JSON.stringify([
    String(args.patientID),
    String(args.prescriptionName).trim().toLowerCase(),
    args.administerDate,
    normalizeAdministerTime(args.administerTime),
  ])}`;

export const createMedicationRecorder = ({
  getSchedule,
  updateSchedule,
  storage = AsyncStorage,
  timeoutMs = 30000,
}) => {
  const attempts = new Map();
  const readSlot = async (args) => {
    const response = await requestDeadline(getSchedule(), timeoutMs);
    if (!response?.ok) {
      return { response, row: null };
    }
    return {
      response,
      row: matchMedicationScheduleRow(
        listMedicationScheduleRows(response.data),
        args,
      ),
    };
  };
  const clear = async (key) => {
    await requestDeadline(storage.removeItem(key), timeoutMs);
    attempts.delete(key);
  };
  const reconcile = async (args) => {
    const key = medicationAttemptKey(args);
    try {
      const marker = JSON.parse(
        (await requestDeadline(storage.getItem(key), timeoutMs)) || 'null',
      );
      const { response, row } = await readSlot(args);
      if (!response?.ok || !row) {
        return { outcome: 'unknown', reason: 'status_unavailable' };
      }
      if (String(row.Status ?? row.status) === '1') {
        await clear(key);
        return { outcome: 'recorded', row };
      }
      const attempt = attempts.get(key);
      if (
        marker?.phase === 'rejected' ||
        definitiveRejection(attempt?.response)
      ) {
        await clear(key);
        return { outcome: 'not_recorded_verified', row };
      }
      // Untaken status alone cannot rule out a request still executing on the
      // server, including after transport timeout or process restart.
      return { outcome: 'unknown', reason: 'awaiting_confirmation', row };
    } catch (error) {
      return { outcome: 'unknown', reason: 'status_unavailable' };
    }
  };
  const record = async (input) => {
    const args = {
      ...input,
      administerDate: input.administerDate || todayAdministerDate(),
    };
    if (args.administerDate !== todayAdministerDate()) {
      return { outcome: 'not_sent', reason: 'wrong_day' };
    }
    const key = medicationAttemptKey(args);
    if (attempts.has(key)) {
      return { outcome: 'unknown', reason: 'existing_attempt' };
    }
    const attempt = { response: null };
    attempts.set(key, attempt);
    let sent = false;
    try {
      if (await requestDeadline(storage.getItem(key), timeoutMs)) {
        attempts.delete(key);
        return { outcome: 'unknown', reason: 'existing_attempt' };
      }
      const { response, row } = await readSlot(args);
      if (!response?.ok || !row) {
        attempts.delete(key);
        return {
          outcome: 'not_sent',
          reason: !response?.ok ? 'schedule_unavailable' : 'slot_not_found',
        };
      }
      if (String(row.Status ?? row.status) === '1') {
        attempts.delete(key);
        return { outcome: 'recorded', row };
      }
      const payload = buildMedicationScheduleUpdate({ row, ...args });
      await requestDeadline(
        storage.setItem(key, JSON.stringify({ phase: 'pending' })),
        timeoutMs,
      );
      if (args.administerDate !== todayAdministerDate()) {
        await clear(key);
        return { outcome: 'not_sent', reason: 'wrong_day' };
      }
      sent = true;
      // Retain the actual write's late result. Never start a replacement write
      // because the UI deadline expired.
      const write = Promise.resolve()
        .then(() => updateSchedule(payload))
        .then(async (result) => {
          attempt.response = result;
          if (definitiveRejection(result)) {
            try {
              await storage.setItem(key, JSON.stringify({ phase: 'rejected' }));
            } catch (error) {
              /* retain pending marker */
            }
          }
          return result;
        });
      const result = await requestDeadline(write, timeoutMs);
      if (result?.ok) {
        await clear(key);
        return { outcome: 'accepted', row };
      }
      return {
        outcome: 'unknown',
        reason: definitiveRejection(result)
          ? 'rejected_needs_status'
          : 'write_uncertain',
      };
    } catch (error) {
      if (!sent) {
        attempts.delete(key);
        return { outcome: 'not_sent', reason: 'preparation_failed' };
      }
      return { outcome: 'unknown', reason: 'write_uncertain' };
    }
  };
  return { record, reconcile };
};
