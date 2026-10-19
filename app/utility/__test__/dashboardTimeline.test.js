import {
  calendarDate,
  calendarDay,
  dashboardTimeline,
  dashboardScrollOffset,
} from 'app/utility/dashboardTimeline';
const activity = (start, end) => ({
  startTime: new Date(`2026-10-19T${start}:00`),
  endTime: new Date(`2026-10-19T${end}:00`),
});
const rows = [
  activity('08:00', '09:00'),
  activity('09:00', '09:30'),
  activity('12:00', '13:00'),
  activity('16:00', '17:00'),
];
test.each([
  ['2026-10-19T00:30:00Z', 91],
  ['2026-10-19T01:15:00Z', 273],
  ['2026-10-19T04:30:00Z', 455],
  ['2026-10-19T08:55:00Z', (3 + 55 / 60) * 182],
])(
  'the Singapore clock maps %s to its actual card and duration',
  (now, expected) => {
    expect(dashboardTimeline(rows, '2026-10-19', new Date(now))).toBeCloseTo(
      expected,
    );
  },
);
test.each([
  '2026-10-18T23:59:59Z', // before the first displayed slot
  '2026-10-19T01:45:00Z', // an unscheduled gap
  '2026-10-19T09:00:00Z', // exactly the end of the final slot
  '2026-10-19T16:53:00Z', // next centre day, although a GMT device is still on Oct 19
])(
  'no current marker is invented outside a saved current-day slot: %s',
  (now) => {
    expect(dashboardTimeline(rows, '2026-10-19', new Date(now))).toBeNull();
  },
);
test('an older selected date and an empty schedule have no current marker', () => {
  const now = new Date('2026-10-19T04:30:00Z');
  expect(dashboardTimeline(rows, '2026-10-18', now)).toBeNull();
  expect(dashboardTimeline([], '2026-10-19', now)).toBeNull();
});
test('malformed/reversed slot durations cannot place a marker', () => {
  expect(
    dashboardTimeline(
      [activity('10:00', '09:00')],
      '2026-10-19',
      new Date('2026-10-19T01:30:00Z'),
    ),
  ).toBeNull();
});
test.each([
  [100, 10, 500, 0],
  [900, 10, 600, 700],
  [1810, 10, 600, 1220],
  [null, 10, 600, 0],
  [100, 1, 600, 0],
  [100, 10, 0, 0],
])(
  'row scroll clamps position %s against its measured viewport',
  (position, count, width, expected) => {
    expect(dashboardScrollOffset(position, count, width)).toBe(expected);
  },
);
test('centre midnight selects the centre calendar day without an ISO/device-day round trip', () => {
  const selected = calendarDate('2026-10-20');
  expect(calendarDay(selected)).toBe('2026-10-20');
  expect(selected.getHours()).toBe(12);
});
