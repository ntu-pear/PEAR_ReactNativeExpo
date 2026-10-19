import {
  orderActivityPreferences,
  recommendationFor,
} from 'app/utility/activityDisplayOrder';
const rows = [
  { centreActivityID: 1, activityTitle: 'Neutral', isLike: 0 },
  { centreActivityID: 2, activityTitle: 'Liked', isLike: 1 },
  { centreActivityID: 3, activityTitle: 'Recommended', isLike: 0 },
  { centreActivityID: 4, activityTitle: 'Both', isLike: 1 },
];
const recs = [
  { centreActivityID: 3, doctorRecommendation: 1 },
  { centreActivityID: 4, doctorRecommendation: 1 },
];
test('display ranking puts liked/recommended first without altering original data or scheduling inputs', () => {
  expect(
    orderActivityPreferences(rows, recs).map((x) => x.centreActivityID),
  ).toEqual([4, 2, 3, 1]);
  expect(rows.map((x) => x.centreActivityID)).toEqual([1, 2, 3, 4]);
});
test('local name search, filter and alphabetical sort preserve exact rows', () => {
  expect(
    orderActivityPreferences(rows, recs, { filter: 'liked', sort: 'name' }).map(
      (x) => x.activityTitle,
    ),
  ).toEqual(['Both', 'Liked']);
  expect(
    orderActivityPreferences(rows, recs, {
      query: 'RECOMM',
      filter: 'recommended',
    }),
  ).toEqual([rows[2]]);
});

test('missing activity identifiers never match unrelated recommendations', () =>
  expect(recommendationFor({}, [{ doctorRecommendation: 1 }])).toBeUndefined());
