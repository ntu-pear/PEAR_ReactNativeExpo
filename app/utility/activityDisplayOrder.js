const activityId = (row) =>
  String(
    row.centreActivityID ??
      row.CentreActivityID ??
      row.centre_activity_id ??
      '',
  );
export const recommendationFor = (row, recommendations = []) => {
  const id = activityId(row);
  return id
    ? recommendations.find((item) => activityId(item) === id)
    : undefined;
};
export const orderActivityPreferences = (
  rows,
  recommendations,
  { query = '', filter = 'all', sort = 'priority' } = {},
) => {
  const score = (row) =>
    (Number(row.isLike) === 1 ? 2 : Number(row.isLike) === -1 ? -1 : 0) +
    (Number(recommendationFor(row, recommendations)?.doctorRecommendation) === 1
      ? 2
      : 0);
  return rows
    .map((row, index) => ({ row, index }))
    .filter(
      ({ row }) =>
        String(row.activityTitle || '')
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (filter === 'all' ||
          (filter === 'liked'
            ? Number(row.isLike) === 1
            : Number(
                recommendationFor(row, recommendations)?.doctorRecommendation,
              ) === 1)),
    )
    .sort(
      (a, b) =>
        (sort === 'priority' ? score(b.row) - score(a.row) : 0) ||
        String(a.row.activityTitle || '').localeCompare(
          String(b.row.activityTitle || ''),
        ) ||
        a.index - b.index,
    )
    .map(({ row }) => row);
};
