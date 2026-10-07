jest.mock('@react-native-async-storage/async-storage', () => ({}));
import {
  createPrimaryGuardianWriter,
  primaryGuardianAttemptKey,
} from 'app/utility/guardianPrimaryWrite';
const user = { id: 'TEST-SUPERVISOR', roleName: 'SUPERVISOR' };
const guardian = (id) => ({ id, active: 'Y', isDeleted: '0' });
const environment = () => {
  const values = new Map();
  const storage = {
    getItem: jest.fn(async (k) => values.get(k) || null),
    setItem: jest.fn(async (k, v) => values.set(k, v)),
    removeItem: jest.fn(async (k) => values.delete(k)),
  };
  const state = {
    guardians: [guardian(1), guardian(2)],
    allocation: {
      id: 3,
      patientId: 7,
      active: 'Y',
      isDeleted: false,
      guardianId: 1,
      guardian2Id: 2,
      ModifiedById: 'OLD-ACTOR',
      caregiverId: 'STAFF-KEEP',
    },
  };
  const api = {
    getPatientGuardian: jest.fn(async () => ({
      ok: true,
      data: {
        patient: { id: 7 },
        patient_guardians: state.guardians.map((record) => ({
          patient_guardian: record,
          relationshipName: 'Child',
        })),
      },
    })),
    getPatientAllocation: jest.fn(async () => ({
      ok: true,
      data: { ...state.allocation },
    })),
    updatePrimaryAllocation: jest.fn(async (id, payload) => {
      Object.assign(state.allocation, payload);
      return { ok: true };
    }),
  };
  const writer = createPrimaryGuardianWriter({ api, storage, timeoutMs: 15 });
  return {
    values,
    storage,
    state,
    api,
    writer,
    args: { patientId: 7, guardianId: 2, expectedAllocationId: 3, user },
  };
};
test('one narrow PUT swaps both already-linked slots and omits every staff field', async () => {
  const e = environment();
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'verified',
  });
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledWith(3, {
    patientId: 7,
    guardianId: 2,
    guardian2Id: 1,
    ModifiedById: user.id,
  });
  expect(e.state.allocation.caregiverId).toBe('STAFF-KEEP');
  expect(e.values.size).toBe(0);
});
test.each([
  'stale allocation',
  'guardian2 only',
  'slot disagreement',
  'inactive',
  'unsafe ID',
])('%s blocks the write', async (kind) => {
  const e = environment();
  if (kind === 'stale allocation') {
    e.args.expectedAllocationId = 4;
  }
  if (kind === 'guardian2 only') {
    e.state.guardians = [guardian(2)];
  }
  if (kind === 'slot disagreement') {
    e.state.allocation.guardian2Id = null;
  }
  if (kind === 'inactive') {
    e.state.allocation.active = 'N';
  }
  if (kind === 'unsafe ID') {
    e.state.allocation.id = 9007199254740992;
  }
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'not_sent',
  });
  expect(e.api.updatePrimaryAllocation).not.toHaveBeenCalled();
});
test('an account/selection change during preparation sends no PUT', async () => {
  const e = environment();
  let current = true;
  e.api.getPatientAllocation.mockImplementation(async () => {
    current = false;
    return { ok: true, data: e.state.allocation };
  });
  expect(
    await e.writer.switchPrimary({ ...e.args, isCurrent: () => current }),
  ).toMatchObject({ outcome: 'not_sent' });
  expect(e.api.updatePrimaryAllocation).not.toHaveBeenCalled();
});
test('simultaneous taps share a synchronous lock and send at most one PUT', async () => {
  const e = environment();
  const first = e.writer.switchPrimary(e.args);
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(await first).toMatchObject({ outcome: 'verified' });
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
});
test('post-commit error is resolved only by a matching persisted actor and both slots', async () => {
  const e = environment();
  e.api.updatePrimaryAllocation.mockImplementation(async (id, payload) => {
    Object.assign(e.state.allocation, payload);
    return { ok: false, status: 500 };
  });
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'verified',
  });
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
});
test('contradictory success and a negative read retain intent and block replay after restart', async () => {
  const e = environment();
  e.api.updatePrimaryAllocation.mockResolvedValue({ ok: true });
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  const restarted = createPrimaryGuardianWriter({
    api: e.api,
    storage: e.storage,
  });
  expect(await restarted.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(await restarted.reconcile(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(e.values.size).toBe(1);
  const marker = JSON.parse(e.values.get(primaryGuardianAttemptKey(7)));
  expect(Object.keys(marker).sort()).toEqual([
    'actorId',
    'allocationId',
    'guardian2Id',
    'guardianId',
    'version',
  ]);
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
});
test('timeout followed by a negative read cannot replay; late success can later be checked read-only', async () => {
  const e = environment();
  let release;
  e.api.updatePrimaryAllocation.mockImplementation(
    (id, payload) =>
      new Promise((resolve) => {
        release = () => {
          Object.assign(e.state.allocation, payload);
          resolve({ ok: true });
        };
      }),
  );
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(await e.writer.reconcile(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(e.values.size).toBe(1);
  release();
  expect(await e.writer.reconcile(e.args)).toMatchObject({
    outcome: 'verified',
  });
  expect(e.values.size).toBe(0);
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
});
test('a failed post-write read or mismatched actor never announces verified persistence', async () => {
  const e = environment();
  e.api.updatePrimaryAllocation.mockImplementation(async (id, payload) => {
    Object.assign(e.state.allocation, payload, { ModifiedById: 'OTHER-ACTOR' });
    return { ok: true };
  });
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  e.api.getPatientAllocation.mockResolvedValue({ ok: false, status: 503 });
  expect(await e.writer.reconcile(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(e.values.size).toBe(1);
});
test('caregiver role cannot read or change primary allocation through the coordinator', async () => {
  const e = environment();
  expect(
    await e.writer.switchPrimary({
      ...e.args,
      user: { ...user, roleName: 'CAREGIVER' },
    }),
  ).toMatchObject({ outcome: 'not_sent' });
  expect(e.api.getPatientGuardian).not.toHaveBeenCalled();
  expect(e.api.updatePrimaryAllocation).not.toHaveBeenCalled();
});

test('timed-out deletion is fenced: duplicate checks cannot clear a newer intent or permit restart replay', async () => {
  const e = environment();
  let release;
  e.storage.removeItem.mockImplementationOnce(
    (key) =>
      new Promise((resolve) => {
        release = () => {
          e.values.delete(key);
          resolve();
        };
      }),
  );
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  const restarted = createPrimaryGuardianWriter({
    api: e.api,
    storage: e.storage,
    timeoutMs: 15,
  });
  expect(await restarted.reconcile(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(
    await restarted.switchPrimary({ ...e.args, guardianId: 1 }),
  ).toMatchObject({ outcome: 'unknown' });
  expect(e.storage.removeItem).toHaveBeenCalledTimes(1);
  expect(e.storage.setItem).toHaveBeenCalledTimes(1);
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
  release();
  await Promise.resolve();
  await Promise.resolve();
  // Once the old deletion has actually settled, a distinct explicit switch is
  // allowed. Leave that second HTTP outcome uncertain to test durable replay.
  e.api.updatePrimaryAllocation.mockResolvedValue({ ok: true });
  expect(
    await restarted.switchPrimary({ ...e.args, guardianId: 1 }),
  ).toMatchObject({ outcome: 'unknown' });
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(e.values.get(primaryGuardianAttemptKey(7))).guardianId,
  ).toBe(1);
  const nextSession = createPrimaryGuardianWriter({
    api: e.api,
    storage: e.storage,
    timeoutMs: 15,
  });
  expect(
    await nextSession.switchPrimary({ ...e.args, guardianId: 1 }),
  ).toMatchObject({ outcome: 'unknown' });
  expect(e.api.updatePrimaryAllocation).toHaveBeenCalledTimes(2);
});

test('timed-out setItem remains fenced until its late completion and never sends or replays a PUT', async () => {
  const e = environment();
  let release;
  e.storage.setItem.mockImplementationOnce(
    (key, value) =>
      new Promise((resolve) => {
        release = () => {
          e.values.set(key, value);
          resolve();
        };
      }),
  );
  expect(await e.writer.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  const restarted = createPrimaryGuardianWriter({
    api: e.api,
    storage: e.storage,
    timeoutMs: 15,
  });
  expect(await restarted.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(e.storage.setItem).toHaveBeenCalledTimes(1);
  expect(e.api.updatePrimaryAllocation).not.toHaveBeenCalled();
  release();
  await Promise.resolve();
  await Promise.resolve();
  expect(await restarted.switchPrimary(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(await restarted.reconcile(e.args)).toMatchObject({
    outcome: 'unknown',
  });
  expect(e.storage.setItem).toHaveBeenCalledTimes(1);
  expect(e.storage.removeItem).not.toHaveBeenCalled();
  expect(e.api.updatePrimaryAllocation).not.toHaveBeenCalled();
  expect(e.values.has(primaryGuardianAttemptKey(7))).toBe(true);
});
