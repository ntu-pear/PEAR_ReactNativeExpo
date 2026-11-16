jest.mock('app/hooks/useCentreManagement', () => jest.fn());
import { readableDateTime } from 'app/screens/PatientAdhocScreen';

test('ad hoc request times are shown as readable dates', () => {
  expect(readableDateTime('2026-04-30T17:46:59.137000')).toBe(
    '30 Apr 2026, 17:46',
  );
  expect(readableDateTime('2026-11-16')).toBe('16 Nov 2026');
  expect(readableDateTime('2026-10-07T09:00:00+08:00')).toBe(
    '7 Oct 2026, 09:00',
  );
});

test('unrecognised values are shown unchanged', () => {
  expect(readableDateTime('not a date')).toBe('not a date');
  expect(readableDateTime('2026-13-01')).toBe('2026-13-01');
  expect(readableDateTime(null)).toBe('');
});
