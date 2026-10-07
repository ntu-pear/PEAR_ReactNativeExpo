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
  activityReceiptGuardKey,
} from 'app/utility/activityManagementWrite';
const user = { id: 'ReadOnlyActor', roleName: 'SUPERVISOR' };
const environment = () => {
  const values = new Map();
  const storage = {
    getItem: jest.fn(async (k) => values.get(k) || null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  const api = {
    write: jest.fn(),
    get: jest.fn(async () => ({
      ok: true,
      data: { id: 777, title: 'Synthetic', is_deleted: false },
    })),
  };
  return {
    values,
    storage,
    api,
    reader: createActivityWriter({ api, storage, timeoutMs: 25 }),
  };
};
const marker = (overrides = {}) => ({
  version: 1,
  actor: user.id,
  operationId: 'operation-a',
  kind: 'activity',
  action: 'create',
  receiptId: 777,
  expected: { title: 'Synthetic' },
  ...overrides,
});
test.each(['activity', 'centre', 'availability', 'adhoc', 'unknown'])(
  '%s create/update/delete are denied by the coordinator even with a bypass transport',
  async (kind) => {
    const e = environment();
    for (const action of ['create', 'update', 'delete']) {
      expect(
        (await e.reader.run({ kind, action, payload: { id: 1 }, user }))
          .outcome,
      ).toBe('not_sent');
    }
    expect(e.api.write).not.toHaveBeenCalled();
    expect(e.api.get).not.toHaveBeenCalled();
    expect(e.storage.getItem).not.toHaveBeenCalled();
    expect(e.storage.setItem).not.toHaveBeenCalled();
    expect(e.storage.removeItem).not.toHaveBeenCalled();
  },
);
test('legacy receipt observation reads exact identity and never clears its marker', async () => {
  const e = environment(),
    raw = JSON.stringify(marker());
  e.values.set(activityPendingKey(user.id), raw);
  expect((await e.reader.reconcile({ user })).outcome).toBe('observed');
  expect(e.api.get).toHaveBeenCalledWith('activity', 777);
  expect(e.values.get(activityPendingKey(user.id))).toBe(raw);
  expect(e.storage.setItem).not.toHaveBeenCalled();
  expect(e.storage.removeItem).not.toHaveBeenCalled();
});
test('conflicting guard/primary operations are never reconciled by the older receipt', async () => {
  const e = environment();
  e.values.set(activityReceiptGuardKey(user.id), JSON.stringify(marker()));
  e.values.set(
    activityPendingKey(user.id),
    JSON.stringify(
      marker({
        operationId: 'operation-b',
        receiptId: null,
        expected: { title: 'New unknown' },
      }),
    ),
  );
  expect((await e.reader.reconcile({ user })).outcome).toBe('unknown');
  expect(e.api.get).not.toHaveBeenCalled();
  expect(e.storage.removeItem).not.toHaveBeenCalled();
});
test.each([
  'missing receipt',
  'wrong actor',
  'wrong returned ID',
  'wrong fields',
  'failed GET',
  'malformed marker',
])('%s cannot be reported as observed', async (kind) => {
  const e = environment();
  let data = marker();
  if (kind === 'missing receipt') {
    data.receiptId = null;
  }
  if (kind === 'wrong actor') {
    data.actor = 'OtherActor';
  }
  e.values.set(
    activityPendingKey(user.id),
    kind === 'malformed marker' ? 'invalid json' : JSON.stringify(data),
  );
  if (kind === 'wrong returned ID') {
    e.api.get.mockResolvedValue({
      ok: true,
      data: { id: 778, title: 'Synthetic' },
    });
  }
  if (kind === 'wrong fields') {
    e.api.get.mockResolvedValue({
      ok: true,
      data: { id: 777, title: 'Different' },
    });
  }
  if (kind === 'failed GET') {
    e.api.get.mockResolvedValue({ ok: false, status: 404 });
  }
  expect((await e.reader.reconcile({ user })).outcome).toBe('unknown');
  expect(e.storage.setItem).not.toHaveBeenCalled();
  expect(e.storage.removeItem).not.toHaveBeenCalled();
});
test.each(['CAREGIVER', 'DOCTOR', 'GUARDIAN', 'ADMIN'])(
  '%s cannot read confirmation evidence',
  async (role) => {
    const e = environment();
    expect(
      (await e.reader.reconcile({ user: { ...user, roleName: role } })).outcome,
    ).toBe('unknown');
    expect(e.storage.getItem).not.toHaveBeenCalled();
    expect(e.api.get).not.toHaveBeenCalled();
  },
);
test('cleanup during the exact receipt read retains all evidence and publishes no observation', async () => {
  const e = environment();
  let current = true;
  const raw = JSON.stringify(marker());
  e.values.set(activityPendingKey(user.id), raw);
  e.api.get.mockImplementation(async () => {
    current = false;
    return { ok: true, data: { id: 777, title: 'Synthetic' } };
  });
  expect(
    (await e.reader.reconcile({ user, isCurrent: () => current })).outcome,
  ).toBe('unknown');
  expect(e.values.get(activityPendingKey(user.id))).toBe(raw);
  expect(e.storage.removeItem).not.toHaveBeenCalled();
});
