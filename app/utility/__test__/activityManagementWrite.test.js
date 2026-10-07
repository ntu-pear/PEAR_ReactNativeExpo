/** @jest-environment node */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
import {
  createActivityWriter,
  activityPendingKey,
} from 'app/utility/activityManagementWrite';
const user = { id: 'SyntheticActor', roleName: 'SUPERVISOR' };
const create = () => ({
  kind: 'activity',
  action: 'create',
  payload: { title: 'Synthetic', description: null },
  user,
});
const storage = () => {
  const values = new Map();
  return {
    getItem: jest.fn(async (k) => values.get(k) || null),
    setItem: jest.fn(async (k, v) => values.set(k, v)),
    removeItem: jest.fn(async (k) => values.delete(k)),
    values,
  };
};
const api = () => ({
  write: jest.fn(async () => ({ ok: true, data: { id: 1 } })),
  get: jest.fn(async () => ({
    ok: true,
    data: { id: 1, title: 'Synthetic', description: null, is_deleted: false },
  })),
});
test('successful create sends once and reads exact receipt before clearing its marker', async () => {
  const store = storage(),
    transport = api(),
    writer = createActivityWriter({ api: transport, storage: store });
  expect((await writer.run(create())).outcome).toBe('verified');
  expect(transport.write).toHaveBeenCalledTimes(1);
  expect(transport.get).toHaveBeenCalledWith('activity', 1);
  expect(store.values.size).toBe(0);
});
test('timeout/unknown create remains blocked across new writer instances and read-only reconciliation', async () => {
  const store = storage(),
    transport = api();
  transport.write.mockResolvedValue({ ok: false, status: 0 });
  expect(
    (
      await createActivityWriter({ api: transport, storage: store }).run(
        create(),
      )
    ).outcome,
  ).toBe('unknown');
  const second = createActivityWriter({ api: transport, storage: store });
  expect((await second.run(create())).outcome).toBe('unknown');
  expect((await second.reconcile({ user })).outcome).toBe('unknown');
  expect(transport.write).toHaveBeenCalledTimes(1);
});
test('changed actor/route after receipt cannot clear marker or publish success', async () => {
  let current = true;
  const store = storage(),
    transport = api();
  transport.get.mockImplementation(async () => {
    current = false;
    return { ok: true, data: { id: 1, title: 'Synthetic', description: null } };
  });
  expect(
    (
      await createActivityWriter({ api: transport, storage: store }).run({
        ...create(),
        isCurrent: () => current,
      })
    ).outcome,
  ).toBe('unknown');
  expect(store.values.has(activityPendingKey(user.id))).toBe(true);
});
test('a definite rejection permits a corrected later attempt without replay', async () => {
  const store = storage(),
    transport = api();
  transport.write.mockResolvedValue({ ok: false, status: 422 });
  expect(
    (
      await createActivityWriter({ api: transport, storage: store }).run(
        create(),
      )
    ).outcome,
  ).toBe('rejected');
  expect(store.values.size).toBe(0);
});
test('double taps across writer instances dispatch only one request', async () => {
  const store = storage(),
    transport = api();
  let release;
  transport.write.mockReturnValue(
    new Promise((r) => {
      release = r;
    }),
  );
  const first = createActivityWriter({ api: transport, storage: store }).run(
    create(),
  );
  expect(
    (
      await createActivityWriter({ api: transport, storage: store }).run(
        create(),
      )
    ).outcome,
  ).toBe('unknown');
  await Promise.resolve();
  await Promise.resolve();
  release({ ok: true, data: { id: 1 } });
  await first;
  expect(transport.write).toHaveBeenCalledTimes(1);
});
test('stale modified date and cross-patient ad hoc delete stop before any write', async () => {
  const store = storage(),
    transport = api(),
    writer = createActivityWriter({ api: transport, storage: store });
  transport.get.mockResolvedValue({
    ok: true,
    data: { id: 1, is_deleted: false, modified_date: 'new', patient_id: '8' },
  });
  expect(
    (
      await writer.run({
        kind: 'activity',
        action: 'update',
        payload: { id: 1, title: 'New' },
        expectedModifiedDate: 'old',
        user,
      })
    ).outcome,
  ).toBe('not_sent');
  expect(
    (
      await writer.run({
        kind: 'adhoc',
        action: 'delete',
        payload: { id: 1 },
        expectedPatientId: '7',
        user,
      })
    ).outcome,
  ).toBe('not_sent');
  expect(transport.write).not.toHaveBeenCalled();
});
test('a late storage write remains fenced after its deadline across writer instances', async () => {
  jest.useFakeTimers();
  const store = storage(),
    transport = api();
  let release;
  store.setItem.mockImplementation(
    (k, v) =>
      new Promise((r) => {
        release = () => {
          store.values.set(k, v);
          r();
        };
      }),
  );
  const first = createActivityWriter({
    api: transport,
    storage: store,
    timeoutMs: 20,
  }).run(create());
  await jest.advanceTimersByTimeAsync(21);
  expect((await first).outcome).toBe('not_sent');
  const second = createActivityWriter({
    api: transport,
    storage: store,
    timeoutMs: 20,
  }).run(create());
  release();
  expect((await second).outcome).toBe('unknown');
  expect(transport.write).not.toHaveBeenCalled();
  jest.useRealTimers();
});
