import {
  previewResult,
  historyResult,
  reportedTime,
  weekMonday,
  requireRead,
} from 'app/utility/careReadResults';
const row = {
  PatientID: 7,
  Name: 'QA',
  Monday: '{"09:00-09:30":"Reading"}',
  Tuesday: '{}',
  Wednesday: '{}',
  Thursday: '{}',
  Friday: '{}',
  Saturday: '{}',
  Sunday: '{}',
  StartDate: '2026-10-26',
  EndDate: '2026-11-01T23:59:59',
};
const response = (Data = [row]) => ({
  ok: true,
  status: 200,
  data: { Status: '200', Preview: true, BuiltAt: '2026-10-19T10:10:50', Data },
});
const now = new Date('2026-10-19T01:00:00Z');
test('preview accepts next SG week and preserves unsaved read-only data', () => {
  expect(previewResult(response(), now)).toMatchObject({
    start: '2026-10-26',
    end: '2026-11-01',
    patients: [{ id: '7', name: 'QA' }],
  });
  expect(weekMonday('2026-10-25')).toBe('2026-10-19');
});
test('preview rejects current week, duplicate IDs and malformed schedules', () => {
  for (const rows of [
    [{ ...row, StartDate: '2026-10-19' }],
    [row, row],
    [{ ...row, Name: '' }],
  ]) {
    expect(() => previewResult(response(rows), now)).toThrow();
  }
});
test('history rejects cross-patient records or wrong page and handles empty page', () => {
  const r = {
    ok: true,
    status: 200,
    data: { data: [], pageNo: 0, totalPages: 0, totalRecords: 0 },
  };
  expect(historyResult(r, 7, 0).rows).toEqual([]);
  expect(() =>
    historyResult(
      { ...r, data: { ...r.data, data: [{ patient_id: 8 }] } },
      7,
      0,
    ),
  ).toThrow();
  expect(() => historyResult(r, 7, 1)).toThrow();
});
test.each([401, 403])('authorization %s is not a retry action', (status) => {
  try {
    requireRead({ status }, 'history');
    throw new Error('missing rejection');
  } catch (error) {
    expect(error.retry).toBe(false);
  }
});
test('naive timestamps never acquire an invented UTC label', () => {
  expect(reportedTime('2026-10-19T10:10:50')).toBe('2026-10-19 10:10:50');
  expect(reportedTime('2026-10-19T02:10:50.123Z')).toBe('2026-10-19 02:10:50Z');
});
