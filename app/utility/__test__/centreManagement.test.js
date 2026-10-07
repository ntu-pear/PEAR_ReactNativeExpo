/** @jest-environment node */
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
import {
  buildActivityPayload,
  configuredHours,
  currentWeekDates,
  patientScheduledCentreIds,
} from 'app/utility/centreManagement';
const user = { id: 'SyntheticSupervisor', roleName: 'SUPERVISOR' };
const now = new Date('2026-10-07T03:00:00Z');
const hours = () =>
  [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ].map((day, i) => ({
    day,
    open: i === 6 ? null : '09:00',
    close: i === 6 ? null : i === 5 ? '13:00' : '17:00',
  }));
const data = () => ({
  activities: [
    { id: 1, title: 'Art', is_deleted: false },
    { id: 2, title: 'Music', is_deleted: false },
    { id: 3, title: 'Deleted', is_deleted: true },
  ],
  centres: [
    {
      id: 11,
      activity_id: 1,
      is_fixed: false,
      min_duration: 30,
      max_duration: 30,
      start_date: '2026-10-01',
      end_date: '2999-01-01',
      is_deleted: false,
    },
    {
      id: 12,
      activity_id: 2,
      is_fixed: true,
      min_duration: 60,
      max_duration: 60,
      start_date: '2026-10-01',
      end_date: '2999-01-01',
      is_deleted: false,
    },
  ],
  hours: hours(),
  rules: { preferences: [], recommendations: [], exclusions: [] },
  oldScheduledIds: ['11'],
  schedule: [
    {
      PatientID: '9007199254740993',
      StartDate: '2026-10-05',
      EndDate: '2026-10-11',
      Wednesday: '{"13:00-14:00":"Art"}',
      Thursday: '{"15:00-16:00":"Art"}',
    },
  ],
});
const build = (kind, draft, action = 'create', extra = {}) =>
  buildActivityPayload({
    kind,
    draft,
    action,
    user,
    data: data(),
    patientId: '9007199254740993',
    now,
    ...extra,
  });
const availability = () => ({
  centre_activity_id: '11',
  start_date: '2026-10-10',
  end_date: '2026-10-10',
  start_time: '09:00',
  end_time: '13:00',
  days_of_week: 0,
});
const centre = () => ({
  activity_id: '1',
  start_date: '2026-10-07',
  end_date: '2999-01-01',
  is_fixed: true,
  is_compulsory: false,
  is_group: false,
  min_duration: '30',
  fixed_time_slots: 'Monday 09:00,Monday 11:00',
});
const adhoc = () => ({
  old_centre_activity_id: '11',
  new_centre_activity_id: '12',
  start_date: '2026-10-07',
  end_date: '2026-10-07',
  start_time: '13:00',
  end_time: '17:00',
});
test('configured hours preserve Saturday and closed Sunday without fallback', () => {
  const raw = Object.fromEntries(
    hours().map((r) => [
      r.day.toLowerCase(),
      r.open ? { open: r.open, close: r.close } : {},
    ]),
  );
  expect(
    configuredHours({ ok: true, data: { id: 1, working_hours: raw } }),
  ).toEqual(hours());
  delete raw.saturday;
  expect(() =>
    configuredHours({ ok: true, data: { id: 1, working_hours: raw } }),
  ).toThrow(/incomplete/);
});
test('flexible availability can span a four-hour window but respects Saturday close', () => {
  expect(() => build('availability', availability())).toThrow(
    /Availability changes are unavailable/,
  );
  expect(() =>
    build('availability', { ...availability(), end_time: '14:00' }),
  ).toThrow(/opening hours/);
});
test('Sunday closed and selected recurring closed weekdays cannot be saved', () => {
  expect(() =>
    build('availability', {
      ...availability(),
      start_date: '2026-10-11',
      end_date: '2026-10-11',
    }),
  ).toThrow(/Sunday/);
  expect(() =>
    build('availability', {
      ...availability(),
      start_date: '2026-10-07',
      end_date: '2026-10-11',
      days_of_week: 127,
    }),
  ).toThrow(/Saturday|Sunday/);
});
test('multiple fixed slots on one day remain distinct and each fits duration/hours', () => {
  expect(() => build('centre', centre())).toThrow(
    /safe request reconciliation/,
  );
  expect(() =>
    build('centre', { ...centre(), fixed_time_slots: 'Saturday 12:45' }),
  ).toThrow(/Saturday/);
});
test('documented compulsory-flexible conflict is rejected before transport', () =>
  expect(() =>
    build('centre', { ...centre(), is_compulsory: true, is_fixed: false }),
  ).toThrow(/requires compulsory/));
test('catalogue title uniqueness includes deleted records and editing excludes the same ID', () => {
  expect(() => build('activity', { title: ' deleted ' })).toThrow(/unique/);
  expect(() => build('activity', { id: '1', title: 'Art' }, 'update')).toThrow(
    /safe request reconciliation/,
  );
});
test.each(['CAREGIVER', 'DOCTOR', 'GUARDIAN', 'ADMIN'])(
  '%s cannot construct activity or ad hoc writes',
  (role) =>
    expect(() =>
      build('activity', { title: 'Synthetic' }, 'create', {
        user: { id: 'Actor', roleName: role },
      }),
    ).toThrow(/Supervisor/),
);
test('current week uses Singapore Sunday and never tomorrow from Sunday', () => {
  expect(currentWeekDates(now)).toEqual([
    '2026-10-07',
    '2026-10-08',
    '2026-10-09',
    '2026-10-10',
    '2026-10-11',
  ]);
  expect(currentWeekDates(new Date('2026-10-11T15:00:00Z'))).toEqual([
    '2026-10-11',
  ]);
});
test('otherwise valid single-patient replacement stays disabled pending authoritative validation', () => {
  expect(() => build('adhoc', adhoc())).toThrow(
    /Ad hoc changes are unavailable/,
  );
  expect(() => build('adhoc', { ...adhoc(), end_date: '2026-10-12' })).toThrow(
    /current Singapore week/,
  );
  expect(() =>
    build('adhoc', { ...adhoc(), new_centre_activity_id: '11' }),
  ).toThrow(/different/);
});
test('disliked replacement is not bypassed', () => {
  const context = data();
  context.rules.preferences = [{ centreActivityID: '12', isLike: -1 }];
  expect(() => build('adhoc', adhoc(), 'create', { data: context })).toThrow(
    /disliked/,
  );
});
test('UTC/Singapore Monday boundary conflict is explicit rather than silently extending backend week', () => {
  const next = { ...adhoc(), start_date: '2026-10-12', end_date: '2026-10-12' };
  expect(() =>
    build('adhoc', next, 'create', { now: new Date('2026-10-11T17:00:00Z') }),
  ).toThrow(/boundary differs/);
});
test('scheduled-title resolution never picks a first duplicate centre ID', () => {
  const context = data(),
    rows = [
      {
        PatientID: '7',
        StartDate: '2026-10-05',
        EndDate: '2026-10-11',
        Wednesday: '{"09:00-10:00":"Art"}',
      },
    ];
  const args = {
    rows,
    patientId: '7',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    startTime: '09:00',
    endTime: '10:00',
    centres: context.centres,
    activities: context.activities,
  };
  expect(patientScheduledCentreIds(args)).toEqual({
    ids: ['11'],
    ambiguousTitles: [],
  });
  expect(
    patientScheduledCentreIds({
      ...args,
      centres: [...context.centres, { ...context.centres[0], id: 13 }],
    }),
  ).toEqual({ ids: [], ambiguousTitles: ['art'] });
});
test('wrong/unsafe schedule patient ID and missing date coverage cannot identify an old activity', () => {
  const args = {
    rows: [],
    patientId: '9007199254740992',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    startTime: '09:00',
    endTime: '10:00',
    ...data(),
  };
  expect(() => patientScheduledCentreIds(args)).toThrow(/cover every/);
  expect(() =>
    patientScheduledCentreIds({
      ...args,
      rows: [{ PatientID: 9007199254740992 }],
    }),
  ).toThrow(/lossless/);
});

test('oversized date ranges and reversed schedule slots are rejected before selection', () => {
  const base = {
    rows: [
      {
        PatientID: '7',
        StartDate: '2026-10-05',
        EndDate: '2026-10-11',
        Wednesday: '{"10:00-09:00":"Art"}',
      },
    ],
    patientId: '7',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    startTime: '09:00',
    endTime: '10:00',
    centres: [],
    activities: [],
  };
  expect(() =>
    patientScheduledCentreIds({ ...base, endDate: '2999-01-01' }),
  ).toThrow('unavailable');
  expect(() => patientScheduledCentreIds(base)).toThrow(
    'invalid activity slots',
  );
});

test.each([
  [
    'closed Sunday',
    {
      start_date: '2026-10-11',
      end_date: '2026-10-11',
      start_time: '09:00',
      end_time: '10:00',
    },
    /Sunday/,
  ],
  [
    'before opening',
    {
      start_date: '2026-10-08',
      end_date: '2026-10-08',
      start_time: '06:00',
      end_time: '07:00',
    },
    /opening hours/,
  ],
  [
    'after closing',
    {
      start_date: '2026-10-08',
      end_date: '2026-10-08',
      start_time: '16:30',
      end_time: '17:30',
    },
    /opening hours/,
  ],
  [
    'earlier today',
    { start_time: '09:00', end_time: '10:00' },
    /later than the current time/,
  ],
  [
    'starts now',
    { start_time: '14:00', end_time: '15:00' },
    /later than the current time/,
  ],
  ['multi-day', { end_date: '2026-10-08' }, /Multi-day/],
  [
    'no selected-time overlap',
    {
      start_date: '2026-10-08',
      end_date: '2026-10-08',
      start_time: '13:00',
      end_time: '14:00',
    },
    /overlaps this interval/,
  ],
])(
  'ad hoc actual builder refuses %s before any payload is returned',
  (_label, change, message) => {
    expect(() =>
      build('adhoc', { ...adhoc(), ...change }, 'create', {
        now: new Date('2026-10-07T06:00:00Z'),
      }),
    ).toThrow(message);
  },
);
test.each([
  ['13:00', '14:00', []],
  ['14:00', '15:00', []],
  ['15:00', '16:00', ['11']],
  ['15:30', '16:30', ['11']],
  ['16:00', '17:00', []],
])(
  'schedule helper intersects actual Singapore wall-clock occurrence %s-%s',
  (startTime, endTime, expected) => {
    const context = data();
    const rows = [
      {
        PatientID: '7',
        StartDate: '2026-10-05',
        EndDate: '2026-10-11',
        Thursday: '{"15:00-16:00":"Art"}',
      },
    ];
    expect(
      patientScheduledCentreIds({
        rows,
        patientId: '7',
        startDate: '2026-10-08',
        endDate: '2026-10-08',
        startTime,
        endTime,
        ...context,
      }).ids,
    ).toEqual(expected);
  },
);
test('helper never invents times for legacy titles or an omitted interval', () => {
  const base = {
    rows: [
      {
        PatientID: '7',
        StartDate: '2026-10-05',
        EndDate: '2026-10-11',
        Thursday: 'Art',
      },
    ],
    patientId: '7',
    startDate: '2026-10-08',
    endDate: '2026-10-08',
    ...data(),
  };
  expect(() => patientScheduledCentreIds(base)).toThrow(/exact single-day/);
  expect(() =>
    patientScheduledCentreIds({
      ...base,
      startTime: '15:00',
      endTime: '16:00',
    }),
  ).toThrow(/explicit activity times/);
});
test.each(['availability', 'adhoc'])('%s delete remains disabled', (kind) =>
  expect(() => build(kind, { id: 1 }, 'delete')).toThrow(/unavailable/),
);
