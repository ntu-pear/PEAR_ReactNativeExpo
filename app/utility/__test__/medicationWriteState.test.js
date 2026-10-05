/** @jest-environment node */
import {
  createMedicationRecorder,
  medicationAttemptKey,
} from 'app/utility/medicationWriteState';
import { centreDay, nextCentreDay } from 'app/utility/centreClock';
import { medicationWindow } from 'app/utility/medicationAdminister';
jest.mock('@react-native-async-storage/async-storage', () => ({}));
const args = {
  patientID: 7,
  prescriptionName: 'TEST MED',
  administerDate: '2026-10-05',
  administerTime: '1000',
  userId: 'TEST-SUP',
};
const slot = {
  PatientID: 7,
  PrescriptionName: 'TEST MED',
  AdministerDate: '2026-10-05',
  AdministerTime: '1000',
  Status: '0',
};
const fixture = () => {
  const markers = new Map();
  const storage = {
    getItem: jest.fn(async (key) => markers.get(key) || null),
    setItem: jest.fn(async (key, value) => markers.set(key, value)),
    removeItem: jest.fn(async (key) => markers.delete(key)),
  };
  const getSchedule = jest.fn().mockResolvedValue({ ok: true, data: [slot] });
  const updateSchedule = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  return { storage, markers, getSchedule, updateSchedule };
};
const coordinator = (f) => createMedicationRecorder({ ...f, timeoutMs: 50 });
beforeEach(() =>
  jest.useFakeTimers().setSystemTime(new Date('2026-10-05T10:00:00+08:00')),
);
afterEach(() => jest.useRealTimers());

test('a write deadline reports unknown; repeated recording and status checks never send a second PUT', async () => {
  const f = fixture();
  f.updateSchedule.mockImplementation(() => new Promise(() => {}));
  const recorder = coordinator(f);
  const pending = recorder.record(args);
  await jest.advanceTimersByTimeAsync(51);
  expect(await pending).toMatchObject({
    outcome: 'unknown',
    reason: 'write_uncertain',
  });
  expect(await recorder.record(args)).toMatchObject({
    outcome: 'unknown',
    reason: 'existing_attempt',
  });
  expect(await recorder.reconcile(args)).toMatchObject({
    outcome: 'unknown',
    reason: 'awaiting_confirmation',
  });
  expect(f.updateSchedule).toHaveBeenCalledTimes(1);
  expect(f.markers.has(medicationAttemptKey(args))).toBe(true);
});
test('a late successful PUT is reconciled from administered status and reports the actual administrator', async () => {
  const f = fixture();
  let complete;
  f.updateSchedule.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const recorder = coordinator(f);
  const pending = recorder.record(args);
  await jest.advanceTimersByTimeAsync(51);
  expect((await pending).outcome).toBe('unknown');
  complete({ ok: true, status: 200 });
  f.getSchedule.mockResolvedValue({
    ok: true,
    data: [{ ...slot, Status: '1', AdministeredBy: 'TEST-OTHER-SUP' }],
  });
  expect(await recorder.reconcile(args)).toMatchObject({
    outcome: 'recorded',
    row: { AdministeredBy: 'TEST-OTHER-SUP' },
  });
  expect(f.updateSchedule).toHaveBeenCalledTimes(1);
  expect(f.markers.size).toBe(0);
});
test('a persisted marker blocks a fresh coordinator after app restart even when status remains untaken', async () => {
  const f = fixture();
  f.markers.set(
    medicationAttemptKey(args),
    JSON.stringify({ phase: 'pending' }),
  );
  const restarted = coordinator(f);
  expect((await restarted.record(args)).outcome).toBe('unknown');
  expect((await restarted.reconcile(args)).outcome).toBe('unknown');
  expect(f.updateSchedule).not.toHaveBeenCalled();
});
test('a definitive rejected response plus authoritative untaken status permits an explicit new attempt', async () => {
  const f = fixture();
  f.updateSchedule.mockResolvedValueOnce({ ok: false, status: 403 });
  const recorder = coordinator(f);
  expect((await recorder.record(args)).outcome).toBe('unknown');
  expect(f.markers.size).toBe(1);
  expect((await recorder.reconcile(args)).outcome).toBe(
    'not_recorded_verified',
  );
  expect(f.markers.size).toBe(0);
  expect(f.updateSchedule).toHaveBeenCalledTimes(1);
  expect((await recorder.record(args)).outcome).toBe('accepted');
  expect(f.updateSchedule).toHaveBeenCalledTimes(2);
});
test.each([408, 500, 503])(
  'HTTP %s plus untaken status does not prove a write was rejected',
  async (status) => {
    const f = fixture();
    f.updateSchedule.mockResolvedValue({ ok: false, status });
    const recorder = coordinator(f);
    expect((await recorder.record(args)).outcome).toBe('unknown');
    expect((await recorder.reconcile(args)).outcome).toBe('unknown');
    expect(f.markers.size).toBe(1);
  },
);
test('a rejected storage write prevents any medication PUT', async () => {
  const f = fixture();
  f.storage.setItem.mockRejectedValue(new Error('storage unavailable'));
  expect(await coordinator(f).record(args)).toMatchObject({
    outcome: 'not_sent',
    reason: 'preparation_failed',
  });
  expect(f.updateSchedule).not.toHaveBeenCalled();
});
test('a preflight GET deadline cannot start a PUT when that GET later succeeds', async () => {
  const f = fixture();
  let complete;
  f.getSchedule.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const pending = coordinator(f).record(args);
  await jest.advanceTimersByTimeAsync(51);
  expect((await pending).outcome).toBe('not_sent');
  complete({ ok: true, data: [slot] });
  await jest.advanceTimersByTimeAsync(0);
  expect(f.updateSchedule).not.toHaveBeenCalled();
});
test('midnight follows Singapore rather than a GMT device; the 30-minute window is inclusive', () => {
  expect(centreDay(new Date('2026-10-04T15:59:59Z'))).toBe('2026-10-04');
  const midnight = new Date('2026-10-04T16:00:00Z');
  expect(centreDay(midnight)).toBe('2026-10-05');
  expect(nextCentreDay('2026-12-31')).toBe('2027-01-01');
  expect(medicationWindow('0030', '2026-10-05', midnight)).toEqual({
    allowed: true,
    outsideWindow: false,
  });
  expect(medicationWindow('0031', '2026-10-05', midnight).outsideWindow).toBe(
    true,
  );
  expect(medicationWindow('2330', '2026-10-04', midnight).allowed).toBe(false);
});
test('an old confirmation cannot submit the prior Singapore day after midnight', async () => {
  const f = fixture();
  jest.setSystemTime(new Date('2026-10-05T16:00:00Z'));
  expect(await coordinator(f).record(args)).toMatchObject({
    outcome: 'not_sent',
    reason: 'wrong_day',
  });
  expect(f.getSchedule).not.toHaveBeenCalled();
  expect(f.updateSchedule).not.toHaveBeenCalled();
});
test('a day change during preparation also prevents submitting yesterday', async () => {
  const f = fixture();
  f.storage.setItem.mockImplementation(async (key, value) => {
    f.markers.set(key, value);
    jest.setSystemTime(new Date('2026-10-05T16:00:00Z'));
  });
  expect(await coordinator(f).record(args)).toMatchObject({
    outcome: 'not_sent',
    reason: 'wrong_day',
  });
  expect(f.updateSchedule).not.toHaveBeenCalled();
  expect(f.markers.size).toBe(0);
});
