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
const api = require('app/api/centreManagement').default;
const rows = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, is_deleted: false }));
beforeEach(() => jest.clearAllMocks());
test('catalogue traverses real skip/limit pages and rejects malformed success', async () => {
  mockClient.get
    .mockResolvedValueOnce({ ok: true, data: rows(100) })
    .mockResolvedValueOnce({
      ok: true,
      data: [{ id: 101, is_deleted: false }],
    });
  expect(await api.list('activity')).toHaveLength(101);
  expect(mockClient.get).toHaveBeenNthCalledWith(
    2,
    '/activities/',
    expect.objectContaining({ skip: 100, limit: 100 }),
    expect.anything(),
  );
  mockClient.get.mockResolvedValue({ ok: true, data: { message: 'bad' } });
  await expect(api.list('activity')).rejects.toThrow();
});
test('availability retains returned rows without claiming backend completeness', async () => {
  mockClient.get.mockResolvedValue({ ok: true, data: rows(125) });
  const snapshot = await api.availabilitySnapshot();
  expect(snapshot.rows).toHaveLength(125);
  expect(snapshot.complete).toBe(false);
  expect(snapshot.sourceLimit).toBe(100);
  expect(mockClient.get).toHaveBeenCalledTimes(1);
});
test('documented empty patient ad hoc 404 differs from unrelated 404 and network failure', async () => {
  mockClient.get.mockResolvedValue({
    ok: false,
    status: 404,
    data: { detail: 'No Adhoc records for this patient' },
  });
  expect(await api.list('adhoc', { patientId: '7' })).toEqual([]);
  mockClient.get.mockResolvedValue({
    ok: false,
    status: 404,
    data: { detail: 'Not Found' },
  });
  await expect(api.list('adhoc', { patientId: '7' })).rejects.toThrow();
});
test('CRUD uses current endpoint shapes and opt-out of automatic mutation replay', async () => {
  await api.write('activity', 'update', { id: '7', title: 'Synthetic' });
  expect(mockClient.put).toHaveBeenCalledWith(
    '/activities/7',
    expect.anything(),
    expect.objectContaining({ pearNoAuthReplay: true }),
  );
  await api.write('centre', 'update', { id: '8' });
  expect(mockClient.put).toHaveBeenLastCalledWith(
    '/centre_activities/',
    expect.anything(),
    expect.objectContaining({ pearNoAuthReplay: true }),
  );
  await api.workingHours();
  expect(mockClient.get).toHaveBeenLastCalledWith(
    '/care_centres/1/working_hours',
    {},
    expect.objectContaining({ baseURL: 'http://synthetic.invalid/api/v1' }),
  );
});

test.each(['availability', 'adhoc'])(
  '%s create/update/delete refuse before actual HTTP transport',
  (kind) => {
    ['create', 'update', 'delete'].forEach((action) =>
      expect(() => api.write(kind, action, { id: 1, patient_id: 7 })).toThrow(
        /unavailable/,
      ),
    );
    expect(mockClient.post).not.toHaveBeenCalled();
    expect(mockClient.put).not.toHaveBeenCalled();
    expect(mockClient.delete).not.toHaveBeenCalled();
  },
);
test('100 returned availability rows expose an incomplete snapshot and do not invent pagination', async () => {
  mockClient.get.mockResolvedValue({ ok: true, data: rows(100) });
  const snapshot = await api.availabilitySnapshot({ includeDeleted: true });
  expect(snapshot.rows).toHaveLength(100);
  expect(snapshot.complete).toBe(false);
  expect(mockClient.get).toHaveBeenCalledTimes(1);
  expect(mockClient.get).toHaveBeenCalledWith(
    '/centre_activity_availabilities/',
    { include_deleted: true },
    expect.anything(),
  );
});
