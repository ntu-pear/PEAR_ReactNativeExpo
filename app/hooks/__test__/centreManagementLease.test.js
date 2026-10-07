import React from 'react';
import { act, create } from 'react-test-renderer';
import AuthContext from 'app/auth/context';
import useCentreManagement from 'app/hooks/useCentreManagement';
import api from 'app/api/centreManagement';
import store from '@react-native-async-storage/async-storage';
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
test.each(['activity', 'centre', 'availability', 'adhoc'])(
  'loaded actual hook denies %s mutations without transport or storage mutation',
  async (kind) => {
    await mount();
    expect((await latest.save({ ...args(), kind })).outcome).toBe('not_sent');
    expect(api.write).not.toHaveBeenCalled();
    expect(store.setItem).not.toHaveBeenCalled();
    expect(store.removeItem).not.toHaveBeenCalled();
  },
);
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
