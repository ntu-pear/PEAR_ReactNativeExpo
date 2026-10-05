jest.mock('expo-constants', () => ({ nativeAppVersion: '1.0.4-qa.20261005' }));
import Constants from 'expo-constants';
import { beginQaTiming, markQaTiming } from 'app/utility/qaProfileTiming';

let output;
beforeEach(() => {
  Constants.nativeAppVersion = '1.0.4-qa.20261005';
  output = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => output.mockRestore());

test('QA timings retain correlation and finite timings without request or clinical content', () => {
  const focus = beginQaTiming('profile');
  const request = beginQaTiming('patient-read', focus);
  markQaTiming(request, 'response', {
    status: 200,
    requestDurationMs: 23.5,
    patientId: 'PRIVATE PATIENT',
    token: 'PRIVATE TOKEN',
    headers: { Authorization: 'PRIVATE HEADER' },
    url: 'PRIVATE URL',
    data: { name: 'PRIVATE NAME' },
    error: 'PRIVATE ERROR',
  });
  const rows = output.mock.calls.map(([tag, json]) => {
    expect(tag).toBe('[PEAR_PERF]');
    return JSON.parse(json);
  });
  expect(rows[2]).toMatchObject({
    operation: 'patient-read',
    phase: 'response',
    status: 200,
    requestDurationMs: 23.5,
    parent: focus.sequence,
  });
  expect(Number.isFinite(rows[2].elapsedMs)).toBe(true);
  expect(JSON.stringify(rows)).not.toContain('PRIVATE');
  expect(Object.keys(rows[2]).sort()).toEqual(
    [
      'clock',
      'elapsedMs',
      'operation',
      'parent',
      'phase',
      'requestDurationMs',
      'span',
      'status',
    ].sort(),
  );
});

test('unknown operations and phases cannot turn identifiers into log labels', () => {
  expect(beginQaTiming('PRIVATE PATIENT')).toBeNull();
  const span = beginQaTiming('profile');
  markQaTiming(span, 'PRIVATE ERROR', {});
  expect(output).toHaveBeenCalledTimes(1);
});

test('a layout event is reported once and non-finite metrics are excluded', () => {
  const span = beginQaTiming('profile');
  markQaTiming(span, 'layout-ready', {
    status: NaN,
    requestDurationMs: Infinity,
  });
  markQaTiming(span, 'layout-ready');
  expect(output).toHaveBeenCalledTimes(2);
  const row = JSON.parse(output.mock.calls[1][1]);
  expect(row).not.toHaveProperty('status');
  expect(row).not.toHaveProperty('requestDurationMs');
});

test('normal native version names disable diagnostic emission', () => {
  Constants.nativeAppVersion = '1.0.4';
  expect(beginQaTiming('profile')).toBeNull();
  markQaTiming(null, 'response', { status: 200 });
  expect(output).not.toHaveBeenCalled();
});
