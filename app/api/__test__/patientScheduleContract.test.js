/** @jest-environment node */
const mockClient = {
  get: jest.fn(),
  put: jest.fn(),
  addAsyncRequestTransform: jest.fn(),
};
jest.mock('apisauce', () => ({ create: jest.fn(() => mockClient) }));
jest.mock('app/api/client', () => ({
  SCHEDULER_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('app/auth/authStorage', () => ({ getToken: jest.fn() }));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
const api = require('app/api/schedule').default;
const authStorage = require('app/auth/authStorage');
const transform = mockClient.addAsyncRequestTransform.mock.calls[0][0];
beforeEach(() => {
  mockClient.get.mockReset();
  mockClient.put.mockReset();
  authStorage.getToken.mockReset();
});

test('patient endpoint preserves lossless ID and optional date, without centre read or generation', async () => {
  const response = { ok: true, status: 200, data: { Status: '404', Data: '' } };
  mockClient.get.mockResolvedValue(response);
  expect(await api.getPatientScheduleV1('9007199254740993', '2026-10-12')).toBe(
    response,
  );
  expect(mockClient.get).toHaveBeenCalledTimes(1);
  expect(mockClient.get).toHaveBeenCalledWith(
    '/schedule/patient/9007199254740993/',
    { date: '2026-10-12' },
  );
  expect(mockClient.put).not.toHaveBeenCalled();
});

test('optional date is omitted and HTTP failure remains intact', async () => {
  const response = { ok: false, status: 403 };
  mockClient.get.mockResolvedValue(response);
  expect(await api.getPatientScheduleV1(7)).toBe(response);
  expect(mockClient.get).toHaveBeenCalledWith('/schedule/patient/7/', {});
});

test.each([
  ['../7', undefined],
  ['', undefined],
  [Number.MAX_SAFE_INTEGER + 1, undefined],
  ['7', '2026-02-30'],
  ['7', 'wrong'],
])('invalid ID/date fails before sending a request (%s)', async (id, date) => {
  await expect(api.getPatientScheduleV1(id, date)).rejects.toThrow();
  expect(mockClient.get).not.toHaveBeenCalled();
});

test('scheduler client attaches bearer from storage without logging the token', async () => {
  const logger = jest.spyOn(console, 'log').mockImplementation(() => {});
  authStorage.getToken.mockResolvedValue('synthetic-private-token');
  const request = { headers: {} };
  try {
    await transform(request);
    expect(request.headers.Authorization).toBe(
      'Bearer synthetic-private-token',
    );
    expect(logger.mock.calls.flat().join(' ')).not.toContain(
      'synthetic-private-token',
    );
  } finally {
    logger.mockRestore();
  }
});

test('existing Dashboard centre-wide wrapper remains unchanged', async () => {
  await api.getPatientWeeklySchedule();
  expect(mockClient.get).toHaveBeenCalledWith('/schedule/getSchedule/');
});

test('administration pins its bearer and request transform cannot substitute another account', async () => {
  authStorage.getToken.mockResolvedValue('synthetic-session-A');
  await api.updateMedicationScheduleV1({ Status: '1' }, () => true);
  const config = mockClient.put.mock.calls[0][2];
  expect(config.headers.Authorization).toBe('Bearer synthetic-session-A');
  authStorage.getToken.mockResolvedValue('synthetic-session-B');
  await transform(config);
  expect(config.headers.Authorization).toBe('Bearer synthetic-session-A');
});
test('account/page change while bearer is loading prevents the administration request', async () => {
  let finish;
  let active = true;
  authStorage.getToken.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const pending = api.updateMedicationScheduleV1({ Status: '1' }, () => active);
  active = false;
  finish('synthetic-session-B');
  expect(await pending).toMatchObject({ ok: false, notSent: true });
  expect(mockClient.put).not.toHaveBeenCalled();
});
