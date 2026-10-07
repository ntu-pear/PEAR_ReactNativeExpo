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
const user = { id: 'DurableGuardActor', roleName: 'SUPERVISOR' };
const flush = async () => {
  for (let i = 0; i < 60; i++) {
    await Promise.resolve();
  }
};
const environment = (kind = 'activity') => {
  const values = new Map(),
    records = new Map();
  let nextId = 777;
  const storage = {
    getItem: jest.fn(async (k) => values.get(k) || null),
    setItem: jest.fn(async (k, v) => {
      values.set(k, v);
    }),
    removeItem: jest.fn(async (k) => {
      values.delete(k);
    }),
  };
  mockClient.post.mockImplementation(async (_path, payload) => {
    const record = { id: nextId++, ...payload, is_deleted: false };
    records.set(record.id, record);
    return { ok: true, data: record };
  });
  mockClient.get.mockImplementation(async (path) => ({
    ok: true,
    data: records.get(Number(path.split('/').pop())),
  }));
  const args = {
    kind,
    action: 'create',
    payload:
      kind === 'activity'
        ? { title: 'Synthetic first', description: null }
        : {
            activity_id: 11,
            is_fixed: false,
            min_duration: 30,
            max_duration: 30,
          },
    user,
  };
  const writer = createActivityWriter({ api, storage, timeoutMs: 25 });
  return { values, storage, args, writer, records };
};
const restarted = (storage) => {
  let factory;
  // Reset the actual writer module's locks/fences/acknowledgements, retaining
  // only native-storage bytes. This is stronger than a new writer instance.
  jest.isolateModules(() => {
    factory =
      require('app/utility/activityManagementWrite').createActivityWriter;
  });
  return factory({ api, storage, timeoutMs: 25 });
};
const slowClear = (e, { failRestoration = false } = {}) => {
  let release,
    removed = false;
  e.storage.removeItem.mockImplementationOnce(
    (key) =>
      new Promise((resolve) => {
        release = () => {
          removed = true;
          e.values.delete(key);
          resolve();
        };
      }),
  );
  if (failRestoration) {
    e.storage.setItem.mockImplementation(async (key, value) => {
      if (removed && key === activityPendingKey(user.id)) {
        throw new Error('Synthetic primary restoration failure');
      }
      e.values.set(key, value);
    });
  }
  return () => {
    expect(release).toEqual(expect.any(Function));
    release();
  };
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});
test.each([
  ['activity', false],
  ['activity', true],
  ['centre', false],
  ['centre', true],
])(
  '%s timed-out clear with cleanup=%s stays pending after late settlement and writer restart',
  async (kind, cleanup) => {
    const e = environment(kind),
      release = slowClear(e);
    let current = true;
    const result = e.writer.run({ ...e.args, isCurrent: () => current });
    await flush();
    expect(e.storage.removeItem).toHaveBeenCalledTimes(1);
    expect(e.values.has(activityReceiptGuardKey(user.id))).toBe(true);
    if (cleanup) {
      current = false;
    }
    await jest.advanceTimersByTimeAsync(26);
    expect((await result).outcome).toBe('unknown');
    release();
    await flush();
    const fresh = createActivityWriter({
      api,
      storage: e.storage,
      timeoutMs: 25,
    });
    expect(await fresh.pending(user)).toMatchObject({
      receiptId: 777,
      action: 'create',
      kind,
    });
    expect((await fresh.run(e.args)).outcome).toBe('unknown');
    const cold = restarted(e.storage);
    expect(await cold.pending(user)).toMatchObject({ receiptId: 777 });
    expect((await cold.run(e.args)).outcome).toBe('unknown');
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post.mock.calls[0][2].pearNoAuthReplay).toBe(true);
  },
);
test.each([false, true])(
  'durable guard survives late clear, failed restoration and reset JS context; cleanup=%s',
  async (cleanup) => {
    const e = environment(),
      release = slowClear(e, { failRestoration: true });
    let current = true;
    const result = e.writer.run({ ...e.args, isCurrent: () => current });
    await flush();
    if (cleanup) {
      current = false;
    }
    await jest.advanceTimersByTimeAsync(26);
    expect((await result).outcome).toBe('unknown');
    release();
    await flush();
    expect(e.values.has(activityPendingKey(user.id))).toBe(false);
    expect(e.values.has(activityReceiptGuardKey(user.id))).toBe(true);
    const cold = restarted(e.storage);
    expect((await cold.run(e.args)).outcome).toBe('unknown');
    expect(mockClient.post).toHaveBeenCalledTimes(1);
  },
);
test('in-time successful primary clear remains verified and permits a distinct explicit write in the same JS session', async () => {
  const e = environment();
  expect((await e.writer.run(e.args)).outcome).toBe('verified');
  expect(e.values.has(activityPendingKey(user.id))).toBe(false);
  expect(await e.writer.pending(user)).toBeNull();
  expect(
    (
      await createActivityWriter({
        api,
        storage: e.storage,
        timeoutMs: 25,
      }).run({
        ...e.args,
        payload: { title: 'Synthetic distinct', description: null },
      })
    ).outcome,
  ).toBe('verified');
  expect(mockClient.post).toHaveBeenCalledTimes(2);
});
test('successful receipt requires read-only confirmation after JS restart, without replaying the create', async () => {
  const e = environment();
  expect((await e.writer.run(e.args)).outcome).toBe('verified');
  const cold = restarted(e.storage);
  expect(await cold.pending(user)).toMatchObject({ receiptId: 777 });
  expect((await cold.run(e.args)).outcome).toBe('unknown');
  expect((await cold.reconcile({ user })).outcome).toBe('verified');
  expect(await cold.pending(user)).toBeNull();
  expect(mockClient.post).toHaveBeenCalledTimes(1);
});
test('in-time clear during cleanup restores pending and never permits a new create', async () => {
  const e = environment();
  let current = true;
  e.storage.removeItem.mockImplementationOnce(async (key) => {
    e.values.delete(key);
    current = false;
  });
  expect(
    (await e.writer.run({ ...e.args, isCurrent: () => current })).outcome,
  ).toBe('unknown');
  expect(await e.writer.pending(user)).toMatchObject({ receiptId: 777 });
  expect(
    (
      await createActivityWriter({
        api,
        storage: e.storage,
        timeoutMs: 25,
      }).run(e.args)
    ).outcome,
  ).toBe('unknown');
  expect(mockClient.post).toHaveBeenCalledTimes(1);
});
test('legacy receipt is durably guarded before its first destructive clear', async () => {
  const e = environment();
  const marker = {
    version: 1,
    actor: user.id,
    kind: 'activity',
    action: 'create',
    receiptId: 777,
    expected: e.args.payload,
  };
  e.values.set(activityPendingKey(user.id), JSON.stringify(marker));
  e.records.set(777, { id: 777, ...e.args.payload, is_deleted: false });
  const release = slowClear(e, { failRestoration: true }),
    result = e.writer.reconcile({ user });
  await flush();
  expect(e.values.has(activityReceiptGuardKey(user.id))).toBe(true);
  await jest.advanceTimersByTimeAsync(26);
  expect((await result).outcome).toBe('unknown');
  release();
  await flush();
  expect((await restarted(e.storage).run(e.args)).outcome).toBe('unknown');
  expect(mockClient.post).not.toHaveBeenCalled();
});
test('old native clear cannot erase a distinct uncertain intent after explicit receipt reconciliation in a restarted context', async () => {
  const e = environment(),
    release = slowClear(e);
  const first = e.writer.run(e.args);
  await flush();
  await jest.advanceTimersByTimeAsync(26);
  expect((await first).outcome).toBe('unknown');
  const cold = restarted(e.storage);
  expect((await cold.reconcile({ user })).outcome).toBe('verified');
  mockClient.post.mockResolvedValueOnce({ ok: false, status: 0 });
  const distinct = {
    ...e.args,
    payload: { title: 'Synthetic distinct unknown', description: null },
  };
  expect((await cold.run(distinct)).outcome).toBe('unknown');
  release();
  await flush();
  const next = restarted(e.storage);
  expect(await next.pending(user)).toMatchObject({
    receiptId: null,
    expected: distinct.payload,
  });
  expect((await next.run(distinct)).outcome).toBe('unknown');
  expect((await next.reconcile({ user })).outcome).toBe('unknown');
  expect(mockClient.post).toHaveBeenCalledTimes(2); // Two distinct user intents; no third/replayed create.
});
