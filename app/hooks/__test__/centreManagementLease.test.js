import React from 'react';
import { act, create } from 'react-test-renderer';
import AuthContext from 'app/auth/context';
import useCentreManagement from 'app/hooks/useCentreManagement';
import api from 'app/api/centreManagement';
import store from '@react-native-async-storage/async-storage';
import { activityPendingKey } from 'app/utility/activityManagementWrite';
let mockValues = new Map();
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k) => mockValues.get(k) || null),
  setItem: jest.fn(async (k, v) => mockValues.set(k, v)),
  removeItem: jest.fn(async (k) => mockValues.delete(k)),
}));
jest.mock('app/api/centreManagement', () => ({
  list: jest.fn(),
  availabilitySnapshot: jest.fn(),
  workingHours: jest.fn(),
  get: jest.fn(),
  write: jest.fn(),
}));
jest.mock('app/api/activity', () => ({
  getPatientActivityAggregate: jest.fn(),
}));
jest.mock('app/api/schedule', () => ({ getScheduleV1: jest.fn() }));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
const user = { id: 'LeaseActor', roleName: 'SUPERVISOR' };
let latest, tree;
const Probe = () => {
  latest = useCentreManagement();
  return null;
};
const view = (actor = user) => (
  <AuthContext.Provider value={{ user: actor }}>
    <Probe />
  </AuthContext.Provider>
);
const args = () => ({
  kind: 'activity',
  action: 'create',
  payload: { title: 'Synthetic', description: null },
});
const flush = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};
const mount = async () => {
  await act(async () => {
    tree = create(view());
    await flush();
  });
  expect(latest.current()).toBe(true);
};
const cleanup = async () => {
  await act(async () => {
    tree.unmount();
  });
  tree = null;
};
beforeEach(() => {
  jest.clearAllMocks();
  mockValues = new Map();
  latest = null;
  store.getItem.mockImplementation(async (k) => mockValues.get(k) || null);
  store.setItem.mockImplementation(async (k, v) => mockValues.set(k, v));
  store.removeItem.mockImplementation(async (k) => mockValues.delete(k));
  api.list.mockResolvedValue([]);
  api.availabilitySnapshot.mockResolvedValue({
    rows: [],
    complete: false,
    sourceLimit: 100,
  });
  api.workingHours.mockResolvedValue({
    ok: true,
    data: {
      id: 1,
      working_hours: Object.fromEntries(
        [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ].map((d) => [d, { open: '09:00', close: '17:00' }]),
      ),
    },
  });
  api.write.mockResolvedValue({ ok: true, data: { id: 1 } });
  api.get.mockResolvedValue({
    ok: true,
    data: { id: 1, title: 'Synthetic', description: null, is_deleted: false },
  });
});
afterEach(async () => {
  if (tree) {
    await cleanup();
  }
});
test('retained actual hook Save after unmount cannot write or persist a marker', async () => {
  await mount();
  const save = latest.save;
  await cleanup();
  expect(await save(args())).toEqual({ outcome: 'not_sent' });
  expect(api.write).not.toHaveBeenCalled();
  expect(store.setItem).not.toHaveBeenCalled();
});
test.each(['refresh', 'session replacement'])(
  'retained callback is invalid after same-identity effect %s',
  async (mode) => {
    await mount();
    const oldSave = latest.save,
      oldLease = latest.identity;
    await act(async () => {
      if (mode === 'refresh') {
        latest.refresh();
      } else {
        tree.update(view({ ...user }));
      }
      await flush();
    });
    expect(latest.current()).toBe(true);
    expect(latest.identity).not.toBe(oldLease);
    expect((await oldSave(args())).outcome).toBe('not_sent');
    expect(api.write).not.toHaveBeenCalled();
  },
);
test('cleanup during durable marker persistence stops dispatch and clears only the unsent marker', async () => {
  await mount();
  let release;
  store.setItem.mockImplementation(
    (k, v) =>
      new Promise((resolve) => {
        release = () => {
          mockValues.set(k, v);
          resolve();
        };
      }),
  );
  let result;
  await act(async () => {
    result = latest.save(args());
    await flush();
  });
  expect(release).toEqual(expect.any(Function));
  await cleanup();
  release();
  expect((await result).outcome).toBe('not_sent');
  expect(api.write).not.toHaveBeenCalled();
  expect(mockValues.size).toBe(0);
});
test('cleanup during dispatched POST retains exact receipt uncertainty and prevents later retry', async () => {
  await mount();
  let release;
  api.write.mockReturnValue(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  let result;
  await act(async () => {
    result = latest.save(args());
    await flush();
  });
  expect(api.write).toHaveBeenCalledTimes(1);
  await cleanup();
  release({ ok: true, data: { id: 1 } });
  expect((await result).outcome).toBe('unknown');
  expect(JSON.parse(mockValues.get(activityPendingKey(user.id)))).toMatchObject(
    { receiptId: 1, action: 'create' },
  );
  expect(api.get).not.toHaveBeenCalled();
  await mount();
  expect(latest.pending).toBe(true);
  await act(async () => {
    expect((await latest.save(args())).outcome).toBe('unknown');
  });
  expect(api.write).toHaveBeenCalledTimes(1);
});
test('cleanup during exact receipt GET retains marker and publishes no success', async () => {
  await mount();
  let release;
  api.get.mockReturnValue(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  let result;
  await act(async () => {
    result = latest.save(args());
    await flush();
  });
  expect(api.get).toHaveBeenCalledWith('activity', 1);
  await cleanup();
  release({
    ok: true,
    data: { id: 1, title: 'Synthetic', description: null, is_deleted: false },
  });
  expect((await result).outcome).toBe('unknown');
  expect(mockValues.has(activityPendingKey(user.id))).toBe(true);
  expect(store.removeItem).not.toHaveBeenCalled();
});
test('cleanup during update preflight cannot reach storage or write even for a matching version', async () => {
  await mount();
  let release;
  api.get.mockReturnValue(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  let result;
  await act(async () => {
    result = latest.save({
      kind: 'activity',
      action: 'update',
      payload: { id: 1, title: 'New' },
      expectedModifiedDate: null,
    });
    await flush();
  });
  await cleanup();
  release({
    ok: true,
    data: { id: 1, title: 'Old', is_deleted: false, modified_date: null },
  });
  expect((await result).outcome).toBe('not_sent');
  expect(api.write).not.toHaveBeenCalled();
  expect(store.setItem).not.toHaveBeenCalled();
});
test.each(['availability', 'adhoc'])(
  'hook denies %s independently of transport/UI mocks',
  async (kind) => {
    await mount();
    expect(latest.data.availabilityListComplete).toBe(false);
    expect((await latest.save({ ...args(), kind })).outcome).toBe('not_sent');
    expect(api.write).not.toHaveBeenCalled();
    expect(store.setItem).not.toHaveBeenCalled();
  },
);
