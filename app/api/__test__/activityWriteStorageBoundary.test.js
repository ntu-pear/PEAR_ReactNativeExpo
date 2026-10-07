/** @jest-environment node */
const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  ACTIVITY_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
const api = require('app/api/centreManagement').default;
const {
  createActivityWriter,
  activityPendingKey,
  activityReceiptGuardKey,
} = require('app/utility/activityManagementWrite');
const user = { id: 'ActualAdapterReadonlyActor', roleName: 'SUPERVISOR' };
const environment = () => {
  const values = new Map(),
    storage = {
      getItem: jest.fn(async (k) => values.get(k) || null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
  return { values, storage, reader: createActivityWriter({ api, storage }) };
};
beforeEach(() => jest.clearAllMocks());
test.each(['activity', 'centre', 'availability', 'adhoc'])(
  '%s direct actual adapter and coordinator refuse every mutation',
  async (kind) => {
    const e = environment();
    for (const action of ['create', 'update', 'delete']) {
      expect(() => api.write(kind, action, { id: 1 })).toThrow(/unavailable/);
      expect(
        (await e.reader.run({ kind, action, payload: { id: 1 }, user }))
          .outcome,
      ).toBe('not_sent');
    }
    expect(mockClient.post).not.toHaveBeenCalled();
    expect(mockClient.put).not.toHaveBeenCalled();
    expect(mockClient.delete).not.toHaveBeenCalled();
    expect(e.storage.setItem).not.toHaveBeenCalled();
    expect(e.storage.removeItem).not.toHaveBeenCalled();
  },
);
test('actual receipt GET observes existing data without changing storage or enabling a second create', async () => {
  const e = environment(),
    record = { id: 777, title: 'Synthetic', is_deleted: false },
    marker = {
      version: 1,
      actor: user.id,
      kind: 'activity',
      action: 'create',
      receiptId: 777,
      expected: { title: 'Synthetic' },
    };
  const raw = JSON.stringify(marker);
  e.values.set(activityReceiptGuardKey(user.id), raw);
  mockClient.get.mockResolvedValue({ ok: true, data: record });
  expect((await e.reader.reconcile({ user })).outcome).toBe('observed');
  expect(mockClient.get).toHaveBeenCalledWith(
    '/activities/777',
    { include_deleted: true },
    expect.anything(),
  );
  expect(
    (
      await e.reader.run({
        kind: 'activity',
        action: 'create',
        payload: { title: 'Synthetic' },
        user,
      })
    ).outcome,
  ).toBe('not_sent');
  expect(e.values.get(activityReceiptGuardKey(user.id))).toBe(raw);
  expect(e.storage.removeItem).not.toHaveBeenCalled();
  expect(mockClient.post).not.toHaveBeenCalled();
});
test('old guard/new primary conflict remains unknown across a fresh coordinator', async () => {
  const e = environment(),
    base = {
      version: 1,
      actor: user.id,
      kind: 'activity',
      action: 'create',
      expected: { title: 'Old' },
      receiptId: 777,
      operationId: 'old',
    };
  e.values.set(activityReceiptGuardKey(user.id), JSON.stringify(base));
  e.values.set(
    activityPendingKey(user.id),
    JSON.stringify({
      ...base,
      operationId: 'new',
      receiptId: null,
      expected: { title: 'New unknown' },
    }),
  );
  const fresh = createActivityWriter({ api, storage: e.storage });
  expect((await fresh.reconcile({ user })).outcome).toBe('unknown');
  expect(
    (
      await fresh.run({
        kind: 'activity',
        action: 'create',
        payload: { title: 'New unknown' },
        user,
      })
    ).outcome,
  ).toBe('not_sent');
  expect(mockClient.get).not.toHaveBeenCalled();
  expect(mockClient.post).not.toHaveBeenCalled();
  expect(e.storage.removeItem).not.toHaveBeenCalled();
});
