import { patientAge } from 'app/utility/patientAge';

test.each([
  ['2026-10-18T21:00:00Z', 65],
  ['2026-11-02T15:59:59Z', 65],
  ['2026-11-02T16:00:00Z', 66],
  ['2026-11-03T10:00:00Z', 66],
])('ALICE birthday follows Singapore day at %s', (now, expected) => {
  expect(patientAge('1960-11-03T00:00:00', new Date(now))).toBe(expected);
});
test.each([
  null,
  '',
  'not a date',
  '1960-02-30',
  '1960-11-03junk',
  '2030-01-01',
])('invalid/future birth date %s is not a fabricated age', (dob) => {
  expect(patientAge(dob, new Date('2026-10-18T21:00:00Z'))).toBeNull();
});
test('leap birthday uses complete calendar years', () => {
  expect(patientAge('2000-02-29', new Date('2025-02-27T16:00:00Z'))).toBe(25);
});
