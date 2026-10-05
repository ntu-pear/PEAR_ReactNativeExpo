import {
  activityEntityId,
  exclusionBlockedIds,
  validateExclusionDates,
} from 'app/utility/exclusionEligibility';
import { exclusionLifecycle } from 'app/utility/exclusionLifecycle';
const now = new Date('2026-10-05T16:01:00Z');
test('Singapore midnight advances exclusion lifecycle independently of host timezone', () => {
  expect(
    exclusionLifecycle({ startDate: '2026-10-05', endDate: '2026-10-05' }, now),
  ).toBe('Expired');
  expect(
    exclusionLifecycle({ startDate: '2026-10-06', endDate: null }, now),
  ).toBe('Active (indefinite)');
});
test('dislikes, doctor negatives and non-expired exclusions combine without rounding IDs', () => {
  expect(
    exclusionBlockedIds(
      {
        preferences: [
          { centreActivityID: '9007199254740993', isLike: -1 },
          { centreActivityID: 2, isLike: 0 },
          { centreActivityID: 3, isLike: 1 },
        ],
        recommendations: [
          { centre_activity_id: 4, doctor_recommendation: -1 },
          { centre_activity_id: 5, doctor_recommendation: 1 },
        ],
        exclusions: [
          { centreActivityID: 6, startDate: '2026-10-06', endDate: null },
          { centreActivityID: 7, startDate: '2026-10-07', endDate: null },
          {
            centreActivityID: 8,
            startDate: '2026-10-01',
            endDate: '2026-10-05',
          },
          { centreActivityID: 9, startDate: 'bad', endDate: null },
        ],
      },
      now,
    ),
  ).toEqual(['9007199254740993', '4', '6', '7', '9']);
});
test('deleted negative preferences/recommendations/exclusions do not block', () => {
  expect(
    exclusionBlockedIds(
      {
        preferences: [{ centreActivityID: 1, isLike: -1, is_deleted: true }],
        recommendations: [
          { centreActivityID: 2, doctorRecommendation: -1, isDeleted: '1' },
        ],
        exclusions: [{ centreActivityID: 3, isDeleted: 1 }],
      },
      now,
    ),
  ).toEqual([]);
});
test('expiry does not override a remaining dislike', () => {
  expect(
    exclusionBlockedIds(
      {
        preferences: [{ centreActivityID: 1, isLike: -1 }],
        exclusions: [
          {
            centreActivityID: 1,
            startDate: '2026-10-01',
            endDate: '2026-10-05',
          },
        ],
      },
      now,
    ),
  ).toEqual(['1']);
});
test.each([Number('9007199254740993'), null, 0, -1, 'abc'])(
  'unsafe or malformed id %s is rejected',
  (id) => expect(() => activityEntityId(id)).toThrow(),
);
test('unknown identifier on a negative row fails eligibility instead of allowing all', () =>
  expect(() =>
    exclusionBlockedIds({ preferences: [{ isLike: -1 }] }),
  ).toThrow());
test('dates include both endpoints and support explicit indefinite', () => {
  expect(validateExclusionDates('2026-10-06', '2026-10-06', false)).toEqual({
    startDate: '2026-10-06',
    endDate: '2026-10-06',
  });
  expect(validateExclusionDates('2026-10-06', '', true).endDate).toBeNull();
});
test.each([
  ['2026-02-30', '2026-03-01'],
  ['2026-10-06', '2026-10-05'],
  ['2026-10-06', '2026-02-30'],
  ['2026-10-06', ''],
])('invalid range %s to %s is rejected', (start, end) =>
  expect(() => validateExclusionDates(start, end, false)).toThrow(),
);
