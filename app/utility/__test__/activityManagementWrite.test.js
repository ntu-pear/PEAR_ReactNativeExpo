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
test('a failed dispatched response remains uncertain without an authoritative non-commit contract', async () => {
  const store = storage(),
    transport = api();
  transport.write.mockResolvedValue({ ok: false, status: 422 });
  expect(
    (
      await createActivityWriter({ api: transport, storage: store }).run(
        create(),
      )
    ).outcome,
  ).toBe('unknown');
  expect(store.values.size).toBe(1);
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

test.each([400, 401, 403, 404, 409, 422, 500, 0])(
  'dispatched status %s cannot clear uncertainty or permit a second create',
  async (status) => {
    const store = storage(),
      transport = api();
    let commits = 0;
    transport.write.mockImplementation(async () => {
      commits++;
      return { ok: false, status };
    });
    const first = createActivityWriter({ api: transport, storage: store });
    expect((await first.run(create())).outcome).toBe('unknown');
    expect(await first.pending(user)).toMatchObject({
      receiptId: null,
      action: 'create',
    });
    const second = createActivityWriter({ api: transport, storage: store });
    expect((await second.run(create())).outcome).toBe('unknown');
    expect((await second.reconcile({ user })).outcome).toBe('unknown');
    expect(commits).toBe(1);
    expect(transport.write).toHaveBeenCalledTimes(1);
    expect(store.removeItem).not.toHaveBeenCalled();
  },
);
test('post-commit availability 404 retains a durable marker and prevents a duplicate generic dispatch', async () => {
  const store = storage(),
    transport = api();
  const committed = [];
  transport.write.mockImplementation(async () => {
    committed.push({ id: 777 });
    return {
      ok: false,
      status: 404,
      data: { detail: 'Centre activity not found' },
    };
  });
  // Transport double reproduces the inspected backend: real production adapter separately refuses this kind.
  const args = {
    ...create(),
    kind: 'availability',
    payload: { centre_activity_id: 11, days_of_week: 0 },
  };
  expect(
    (await createActivityWriter({ api: transport, storage: store }).run(args))
      .outcome,
  ).toBe('unknown');
  const reloaded = createActivityWriter({ api: transport, storage: store });
  expect((await reloaded.run(args)).outcome).toBe('unknown');
  expect((await reloaded.reconcile({ user })).outcome).toBe('unknown');
  expect(committed).toEqual([{ id: 777 }]);
  expect(store.values.size).toBe(1);
});
test.each([
  [null, '2026-10-07T06:00:00Z'],
  ['old', null],
  ['old', 'new'],
  [undefined, null],
  ['', null],
])(
  'version mismatch/missing expected version %s versus fresh %s never dispatches',
  async (expected, actual) => {
    const store = storage(),
      transport = api();
    transport.get.mockResolvedValue({
      ok: true,
      data: {
        id: 1,
        title: 'Other editor',
        is_deleted: false,
        modified_date: actual,
      },
    });
    expect(
      (
        await createActivityWriter({ api: transport, storage: store }).run({
          kind: 'activity',
          action: 'update',
          payload: { id: 1, title: 'New' },
          user,
          expectedModifiedDate: expected,
        })
      ).outcome,
    ).toBe('not_sent');
    expect(transport.write).not.toHaveBeenCalled();
    expect(store.setItem).not.toHaveBeenCalled();
  },
);
test('known null matches only an explicit fresh null; missing fresh version is refused', async () => {
  const store = storage(),
    transport = api();
  transport.get
    .mockResolvedValueOnce({
      ok: true,
      data: { id: 1, title: 'Before', is_deleted: false, modified_date: null },
    })
    .mockResolvedValueOnce({
      ok: true,
      data: { id: 1, title: 'New', is_deleted: false, modified_date: 'new' },
    });
  const args = {
    kind: 'activity',
    action: 'update',
    payload: { id: 1, title: 'New' },
    user,
    expectedModifiedDate: null,
  };
  expect(
    (await createActivityWriter({ api: transport, storage: store }).run(args))
      .outcome,
  ).toBe('verified');
  expect(transport.write).toHaveBeenCalledTimes(1);
  transport.write.mockClear();
  transport.get.mockResolvedValue({
    ok: true,
    data: { id: 1, title: 'Before', is_deleted: false },
  });
  expect(
    (await createActivityWriter({ api: transport, storage: store }).run(args))
      .outcome,
  ).toBe('not_sent');
  expect(transport.write).not.toHaveBeenCalled();
});

test('cleanup during verified marker removal restores the exact durable receipt instead of publishing success', async () => {
  const store = storage(),
    transport = api();
  let current = true;
  store.removeItem.mockImplementation(async (key) => {
    store.values.delete(key);
    current = false;
  });
  const writer = createActivityWriter({ api: transport, storage: store });
  expect(
    (await writer.run({ ...create(), isCurrent: () => current })).outcome,
  ).toBe('unknown');
  expect(
    JSON.parse(store.values.get(activityPendingKey(user.id))),
  ).toMatchObject({
    receiptId: 1,
    action: 'create',
    expected: { title: 'Synthetic', description: null },
  });
  expect(transport.write).toHaveBeenCalledTimes(1);
});
