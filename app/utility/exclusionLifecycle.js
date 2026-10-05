export const dateKey = (value) => {
  const raw = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null;
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === raw
    ? raw
    : null;
};

export const exclusionLifecycle = (record, now = new Date()) => {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(now.getDate()).padStart(2, '0')}`;
  const start = dateKey(record.startDate);
  const rawEnd = record.endDate;
  const indefinite = !rawEnd || Number(String(rawEnd).slice(0, 4)) >= 2999;
  const end = indefinite ? null : dateKey(rawEnd);
  if (!start || (!indefinite && !end) || (end && end < start)) {
    return 'Unknown dates';
  }
  if (today < start) {
    return 'Pending';
  }
  if (end && today > end) {
    return 'Expired';
  }
  return indefinite ? 'Active (indefinite)' : 'Active';
};
