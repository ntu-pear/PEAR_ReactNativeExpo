import { dateKey, exclusionLifecycle } from 'app/utility/exclusionLifecycle';
const today = new Date(2026, 9, 5, 12);
test.each([
  ['2026-10-06', '2026-10-07', 'Pending'],
  ['2026-10-05', '2026-10-05', 'Active'],
  ['2026-10-04', '2026-10-05', 'Active'],
  ['2026-10-03', '2026-10-04', 'Expired'],
  ['2026-10-05', null, 'Active (indefinite)'],
  ['2026-10-05', '9999-12-31', 'Active (indefinite)'],
  ['2026-10-06', null, 'Pending'],
  ['2026-10-05', '2026-10-04', 'Unknown dates'],
  ['bad-date', null, 'Unknown dates'],
])('exclusion %s through %s is %s', (startDate, endDate, expected) => {
  expect(exclusionLifecycle({ startDate, endDate }, today)).toBe(expected);
});
test('calendar validation rejects nonexistent dates but accepts leap days', () => {
  expect(dateKey('2026-02-30')).toBeNull();
  expect(dateKey('2024-02-29')).toBe('2024-02-29');
});
