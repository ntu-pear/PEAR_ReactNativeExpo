/** @jest-environment node */
const mockClient = { get: jest.fn() };
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  ACTIVITY_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
const api = require('app/api/activity').default;
beforeEach(() => {
  jest.clearAllMocks();
});
test('explicit documented no-routine 404 becomes legitimate empty while retaining original status', async () => {
  mockClient.get.mockResolvedValue({
    ok: false,
    status: 404,
    problem: 'CLIENT_ERROR',
    data: { detail: 'No Routine records for this patient' },
  });
  const result = await api.getPatientRoutine('7');
  expect(result.ok).toBe(true);
  expect(result.status).toBe(404);
  expect(result.data.data).toEqual([]);
  expect(result.emptyReason).toBe('NO_ROUTINE_RECORDS');
  expect(mockClient.get).toHaveBeenCalledWith(
    '/routines/patient/7',
    {},
    expect.objectContaining({ baseURL: 'http://synthetic.invalid/api/v1' }),
  );
});
test.each([
  [404, { detail: 'Patient not found' }],
  [404, { detail: 'Not Found' }],
  [404, {}],
  [404, { detail: 'No Routine records for this patient ' }],
  [404, { detail: 'no routine records for this patient' }],
  [403, { detail: 'You do not have permission to view routines.' }],
  [401, { detail: 'Not authenticated' }],
  [500, { detail: 'No Routine records for this patient' }],
])('does not turn other status/detail into empty: %i', async (status, data) => {
  mockClient.get.mockResolvedValue({ ok: false, status, data });
  expect((await api.getPatientRoutine('7')).ok).toBe(false);
});
test('transport failure remains failed', async () => {
  mockClient.get.mockResolvedValue({
    ok: false,
    status: null,
    problem: 'NETWORK_ERROR',
    data: null,
  });
  expect((await api.getPatientRoutine('7')).ok).toBe(false);
});
