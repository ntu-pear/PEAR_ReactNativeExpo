/** @jest-environment node */
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
import {
  previewDates,
  previewActivities,
  affectedPatients,
} from 'app/utility/adhocPreview';
const now = new Date('2026-10-05T03:00:00Z');
const row = (extra = {}) => ({
  PatientID: '9007199254740993',
  Name: 'Synthetic One',
  StartDate: '2026-10-05',
  EndDate: '2026-10-11',
  Monday: '{"09:00-10:00":"Art", "10:00-11:00":"Art"}',
  Tuesday: '{"09:00-10:00":"Music"}',
  ...extra,
});
test('Singapore midnight and tomorrow cross month correctly', () =>
  expect(previewDates(new Date('2026-10-31T16:01:00Z'))).toEqual([
    '2026-11-01',
    '2026-11-02',
  ]));
test('preview derives all affected patients from existing date-covered schedule and deduplicates patients/slots', () => {
  const preview = previewActivities(
    [
      row(),
      row(),
      row({ PatientID: 8, Name: 'Synthetic Two', Monday: 'Music' }),
    ],
    '2026-10-05',
    now,
  );
  expect(preview.activities).toEqual(['Art', 'Music']);
  expect(affectedPatients(preview, 'Art')).toEqual([
    { id: '9007199254740993', name: 'Synthetic One' },
  ]);
});
test('tomorrow uses its own day; stale weeks do not leak', () => {
  const preview = previewActivities(
    [
      row(),
      row({
        PatientID: 9,
        Name: 'Old',
        StartDate: '2026-09-28',
        EndDate: '2026-10-04',
      }),
    ],
    '2026-10-06',
    now,
  );
  expect(preview.activities).toEqual(['Music']);
  expect(affectedPatients(preview, 'Music')).toHaveLength(1);
});
test.each(['2026-10-04', '2026-10-07'])(
  'only today/tomorrow allowed: %s',
  (date) => expect(() => previewActivities([row()], date, now)).toThrow(),
);
test('tomorrow without an existing covering week stays unavailable, not empty success', () =>
  expect(() =>
    previewActivities([row({ EndDate: '2026-10-05' })], '2026-10-06', now),
  ).toThrow('No existing weekly schedule'));
test('rounded ID and conflicting names are rejected', () => {
  expect(() =>
    previewActivities(
      [row({ PatientID: Number.MAX_SAFE_INTEGER + 1 })],
      '2026-10-05',
      now,
    ),
  ).toThrow();
  const p = previewActivities(
    [row(), row({ Name: 'Conflicting' })],
    '2026-10-05',
    now,
  );
  expect(() => affectedPatients(p, 'Art')).toThrow();
});
test('unknown activity cannot be substituted', () =>
  expect(() =>
    affectedPatients(previewActivities([row()], '2026-10-05', now), 'Exercise'),
  ).toThrow());

test.each(['{bad}', '{"25:99-26:00":"Art"}', '["Art"]'])(
  'invalid day data never masquerades as a valid activity: %s',
  (day) =>
    expect(() =>
      previewActivities([row({ Monday: day })], '2026-10-05', now),
    ).toThrow(),
);
