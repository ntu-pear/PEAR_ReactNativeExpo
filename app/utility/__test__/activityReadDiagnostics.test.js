/** @jest-environment node */
import { observeActivityRead } from 'app/utility/activityReadDiagnostics';
let spy;
beforeEach(() => {
  spy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  spy.mockRestore();
});
const config = () => ({
  method: 'get',
  baseURL: 'http://10.96.188.186:5681/api/v1',
  url: '/routines/patient/900000123',
  params: { include_deleted: false, search: 'private-query-marker' },
  headers: { Authorization: 'credential-sentinel' },
});
test('exports exactly route/status/error class/shape and no credentials or patient values', () => {
  const result = observeActivityRead({
    status: 404,
    config: config(),
    data: {
      detail: 'No Routine records for this patient',
      name: 'private-person-name',
      password: 'private-value',
    },
  });
  expect(Object.keys(result).sort()).toEqual([
    'error_class',
    'http_status',
    'response_shape',
    'route_template',
  ]);
  expect(result.http_status).toBe(404);
  expect(result.error_class).toBe('NO_ROUTINE_RECORDS');
  expect(result.response_shape.fields.name).toEqual({ type: 'string' });
  const text = JSON.stringify(spy.mock.calls);
  [
    'credential-sentinel',
    'private-person-name',
    'private-value',
    '900000123',
    'Authorization',
    'password',
    'private-query-marker',
    'include_deleted',
    'search',
  ].forEach((value) => expect(text).not.toContain(value));
});
test('strips URL query/fragment without retaining their names or values', () => {
  const result = observeActivityRead({
    status: 200,
    config: {
      ...config(),
      url: '/routines/patient/900000123?privateQuery=private-query-marker#private-fragment',
    },
    data: [],
  });
  expect(result.route_template).toBe(
    'GET http://10.96.188.186:5681/api/v1/routines/patient/{patient_id}',
  );
  [
    'privateQuery',
    'private-query-marker',
    'private-fragment',
    '900000123',
  ].forEach((value) =>
    expect(JSON.stringify(spy.mock.calls)).not.toContain(value),
  );
});
test.each(['/login/', '/refresh/', '/Medication/add'])(
  'ignores authentication/write route %s',
  (url) => {
    expect(
      observeActivityRead({
        status: 200,
        config: { ...config(), url },
        data: { access_token: 'credential-sentinel' },
      }),
    ).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  },
);
test('ignores a write using the read URL', () => {
  expect(
    observeActivityRead({
      config: { ...config(), method: 'put' },
      status: 200,
    }),
  ).toBeNull();
});
test('unknown base and detail values are redacted', () => {
  const result = observeActivityRead({
    status: 500,
    config: {
      ...config(),
      baseURL: 'https://private:credential-sentinel@invalid.example',
    },
    data: { detail: 'private-person-name' },
  });
  expect(result.route_template).toContain('UNRECOGNISED_BASE_REDACTED');
  expect(result.error_class).toBe('OTHER_DETAIL_REDACTED');
  ['credential-sentinel', 'private-person-name'].forEach((value) =>
    expect(JSON.stringify(spy.mock.calls)).not.toContain(value),
  );
});
test('transport failure is classified without retaining exception text', () => {
  const result = observeActivityRead(undefined, config(), 'ERR_NETWORK');
  expect(result.http_status).toBeNull();
  expect(result.error_class).toBe('NETWORK_ERROR');
  expect(result.response_shape.type).toBe('undefined');
});
test('aggregate exports field types only, with no patient identity/count/values', () => {
  const result = observeActivityRead({
    status: 200,
    config: {
      ...config(),
      url: '/aggregated/activity-preference-table/patient/900000123',
    },
    data: {
      patients: [{ id: '900000123', name: 'private-person-name' }],
      activities: [],
      centre_activities: [],
      preferences: [],
      recommendations: [],
      exclusions: [],
    },
  });
  expect(result.response_shape.fields.patients.item_shape.fields.id).toEqual({
    type: 'string',
  });
  [
    '900000123',
    'private-person-name',
    'selected_patient_present',
    'count',
  ].forEach((value) =>
    expect(JSON.stringify(spy.mock.calls)).not.toContain(value),
  );
});
test.each([401, 403])('preserves exact permission/auth status %i', (status) => {
  expect(
    observeActivityRead({
      status,
      config: config(),
      data: { detail: 'You do not have permission to view routines.' },
    }).http_status,
  ).toBe(status);
});
