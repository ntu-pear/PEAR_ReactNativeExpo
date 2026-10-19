import React from 'react';
import { act, create } from 'react-test-renderer';
import Screen from 'app/screens/PatientScheduleScreen';
import storage from 'app/auth/authStorage';
import patient from 'app/api/patient';
import schedule from 'app/api/schedule';

let mockFocusSetup;
let mockFocusCleanup;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback) =>
    require('react').useEffect(() => {
      mockFocusSetup = callback;
      mockFocusCleanup = callback();
      return mockFocusCleanup;
    }, [callback]),
}));
jest.mock('native-base', () => {
  const MockReact = require('react');
  return {
    FlatList: ({ data, ListEmptyComponent, renderItem }) =>
      data.length ? (
        <>
          {data.map((item, index) => (
            <MockReact.Fragment key={index}>
              {renderItem({ item, index })}
            </MockReact.Fragment>
          ))}
        </>
      ) : (
        <ListEmptyComponent />
      ),
    ScrollView: 'MockScroll',
    View: 'MockView',
    Text: 'MockText',
    Divider: 'MockDivider',
  };
});
jest.mock('app/auth/authStorage', () => ({
  getToken: jest.fn(async () => 'synthetic-private-token-sentinel'),
}));
jest.mock('app/api/patient', () => ({ getPatient: jest.fn() }));
jest.mock('app/api/schedule', () => ({
  getPatientScheduleV1: jest.fn(),
  getPatientWeeklySchedule: jest.fn(),
  getScheduleV1: jest.fn(),
  generateScheduleV1: jest.fn(),
  refreshScheduleV1: jest.fn(),
}));
jest.mock('app/components/ProfileNameButton', () => 'MockProfile');
jest.mock('app/components/ActivityIndicator', () => 'MockLoading');
jest.mock('app/components/AppButton', () => 'MockButton');
jest.mock(
  'app/components/filter-components/SearchFilterBar',
  () => 'MockFilters',
);
jest.mock('app/components/ActivityCard', () => 'MockCard');

const row = (patientID = 7) => ({
  PatientID: patientID,
  Name: `Synthetic patient ${patientID}`,
  StartDate: '2026-10-12',
  EndDate: '2026-10-18',
  Monday: { '09:00-10:00': 'Synthetic activity' },
  Tuesday: '',
  Wednesday: '',
  Thursday: '',
  Friday: '',
  Saturday: '',
  Sunday: '',
});
const success = (patientID = 7) => ({
  ok: true,
  status: 200,
  data: { Status: '200', Data: [row(patientID)] },
});
const empty = () => ({
  ok: true,
  status: 200,
  data: { Status: '404', Data: '' },
});
let tree;
const render = async (params = { patientID: '7' }) => {
  await act(async () => {
    tree = create(<Screen route={{ params }} />);
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  schedule.getPatientScheduleV1.mockResolvedValue(success());
});
afterEach(() => {
  if (tree) act(() => tree.unmount());
  tree = null;
});
const retry = async () => {
  const button = tree.root
    .findAllByProps({ testID: 'patient_schedule_retry' })
    .find((node) => typeof node.props.onPress === 'function');
  await act(async () => button.props.onPress());
};

test('real Schedule screen reads one patient endpoint without patient header reads, generation, token access or logging', async () => {
  const logger = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    await render({ patientID: '7', date: '2026-10-12' });
    expect(schedule.getPatientScheduleV1).toHaveBeenCalledWith(
      '7',
      '2026-10-12',
    );
    expect(schedule.getPatientScheduleV1).toHaveBeenCalledTimes(1);
    expect(patient.getPatient).not.toHaveBeenCalled();
    expect(schedule.getPatientWeeklySchedule).not.toHaveBeenCalled();
    expect(schedule.getScheduleV1).not.toHaveBeenCalled();
    expect(schedule.generateScheduleV1).not.toHaveBeenCalled();
    expect(schedule.refreshScheduleV1).not.toHaveBeenCalled();
    expect(storage.getToken).not.toHaveBeenCalled();
    expect(logger.mock.calls.flat().join(' ')).not.toMatch(
      /synthetic-private-token-sentinel|JWT Token/,
    );
    expect(tree.root.findByType('MockProfile').props.profileLineOne).toBe(
      'Synthetic patient 7',
    );
    expect(tree.root.findAllByType('MockCard')).toHaveLength(1);
  } finally {
    logger.mockRestore();
  }
});

test.each([
  [401, /Sign in again/, false],
  [403, /permission/, false],
  [503, /service.*unavailable/, true],
])(
  'schedule HTTP %s has explicit recovery and no stale patient header',
  async (status, text, canRetry) => {
    schedule.getPatientScheduleV1.mockResolvedValue({ ok: false, status });
    await render();
    expect(JSON.stringify(tree.toJSON())).toMatch(text);
    expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
    expect(
      tree.root.findAllByProps({ testID: 'patient_schedule_retry' }).length > 0,
    ).toBe(canRetry);
  },
);

test.each(['', []].map((data) => [data]))(
  'HTTP 200 body 404 empty saved week (%j) clears an earlier dependency error without generating',
  async (data) => {
    schedule.getPatientScheduleV1
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ...empty(),
        data: { Status: '404', Data: data },
      });
    await render();
    await retry();
    expect(
      tree.root.findAllByProps({ testID: 'patient_schedule_read_error' }),
    ).toHaveLength(0);
    expect(
      tree.root.findAllByProps({ testID: 'patient_schedule_empty' }).length,
    ).toBeGreaterThan(0);
    expect(schedule.generateScheduleV1).not.toHaveBeenCalled();
  },
);

test.each([
  { Status: '200', Data: [row(8)] },
  { Status: '503', Data: [row()] },
  { Status: '200', Data: [{ ...row(), Monday: [] }] },
  { Status: '200', Data: [{ ...row(), StartDate: 'invalid' }] },
  { Status: '200', Data: {} },
])('malformed or foreign-patient payload is rejected', async (data) => {
  schedule.getPatientScheduleV1.mockResolvedValue({
    ok: true,
    status: 200,
    data,
  });
  await render();
  expect(tree.root.findAllByType('MockCard')).toHaveLength(0);
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(
    tree.root.findAllByProps({ testID: 'patient_schedule_read_error' }).length,
  ).toBeGreaterThan(0);
});

test('late prior-patient success cannot overwrite new patient forbidden status or disclose a header', async () => {
  let resolveOld;
  schedule.getPatientScheduleV1
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValueOnce({ ok: false, status: 403 });
  await render();
  await act(async () =>
    tree.update(<Screen route={{ params: { patientID: '8' } }} />),
  );
  await act(async () => resolveOld(success(7)));
  expect(schedule.getPatientScheduleV1).toHaveBeenLastCalledWith(
    '8',
    undefined,
  );
  expect(JSON.stringify(tree.toJSON())).toMatch(/permission/);
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(tree.root.findAllByType('MockCard')).toHaveLength(0);
});

test('late prior-patient error cannot overwrite a new valid patient schedule', async () => {
  let resolveOld;
  schedule.getPatientScheduleV1
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValueOnce(success(8));
  await render();
  await act(async () =>
    tree.update(<Screen route={{ params: { patientId: '8' } }} />),
  );
  await act(async () => resolveOld({ ok: false, status: 401 }));
  expect(tree.root.findByType('MockProfile').props.profileLineOne).toBe(
    'Synthetic patient 8',
  );
  expect(
    tree.root.findAllByProps({ testID: 'patient_schedule_read_error' }),
  ).toHaveLength(0);
});

test('invalid route ID never reads any schedule', async () => {
  await render({ patientID: '../7' });
  expect(schedule.getPatientScheduleV1).not.toHaveBeenCalled();
  expect(
    tree.root.findAllByProps({ testID: 'patient_schedule_read_error' }).length,
  ).toBeGreaterThan(0);
});

test('switching from a loaded patient to a forbidden patient removes the prior header and cards', async () => {
  await render();
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(1);
  schedule.getPatientScheduleV1.mockResolvedValueOnce({
    ok: false,
    status: 403,
  });
  await act(async () =>
    tree.update(<Screen route={{ params: { patientID: '8' } }} />),
  );
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(tree.root.findAllByType('MockCard')).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toMatch(/permission/);
});

test('a stalled schedule read reaches a bounded retry state and ignores its late success', async () => {
  jest.useFakeTimers();
  let resolveLate;
  schedule.getPatientScheduleV1.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveLate = resolve;
      }),
  );
  try {
    await render();
    expect(tree.root.findAllByType('MockLoading')).toHaveLength(1);
    await act(async () => jest.advanceTimersByTime(30000));
    expect(tree.root.findAllByType('MockLoading')).toHaveLength(0);
    expect(
      tree.root.findAllByProps({ testID: 'patient_schedule_retry' }).length,
    ).toBeGreaterThan(0);
    await act(async () => resolveLate(success()));
    expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
    expect(
      tree.root.findAllByProps({ testID: 'patient_schedule_read_error' })
        .length,
    ).toBeGreaterThan(0);
  } finally {
    jest.useRealTimers();
  }
});

test('changing the route date triggers a new scoped read', async () => {
  await render({ patientID: '7', date: '2026-10-12' });
  await act(async () =>
    tree.update(
      <Screen route={{ params: { patientID: '7', date: '2026-10-19' } }} />,
    ),
  );
  expect(schedule.getPatientScheduleV1).toHaveBeenLastCalledWith(
    '7',
    '2026-10-19',
  );
});

test('blur invalidates an in-flight read and a later focus loads a fresh schedule', async () => {
  let resolveOld;
  schedule.getPatientScheduleV1
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValueOnce(success());
  await render();
  act(() => mockFocusCleanup());
  await act(async () => resolveOld(success()));
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(tree.root.findAllByType('MockLoading')).toHaveLength(1);
  await act(async () => {
    mockFocusCleanup = mockFocusSetup();
  });
  expect(tree.root.findByType('MockProfile').props.profileLineOne).toBe(
    'Synthetic patient 7',
  );
  expect(schedule.getPatientScheduleV1).toHaveBeenCalledTimes(2);
});

test('unmount safely ignores a late read completion', async () => {
  let resolveLate;
  schedule.getPatientScheduleV1.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveLate = resolve;
      }),
  );
  await render();
  act(() => tree.unmount());
  await act(async () => resolveLate(success()));
  expect(tree.toJSON()).toBeNull();
  expect(schedule.getPatientScheduleV1).toHaveBeenCalledTimes(1);
  tree = null;
});

test('a prior filter callback cannot restore old activities after a fresh read fails', async () => {
  await render();
  const oldFilter = tree.root.findByType('MockFilters').props;
  schedule.getPatientScheduleV1.mockResolvedValueOnce({
    ok: false,
    status: 503,
  });
  act(() => mockFocusCleanup());
  await act(async () => {
    mockFocusCleanup = mockFocusSetup();
  });
  act(() => oldFilter.setList(oldFilter.originalList));
  expect(tree.root.findAllByType('MockCard')).toHaveLength(0);
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toMatch(/service.*unavailable/);
});

test('an invalid route date shows a bounded error and disables previous week without a request', async () => {
  await render({ patientID: '7', date: '2026-02-31' });
  expect(schedule.getPatientScheduleV1).not.toHaveBeenCalled();
  expect(
    tree.root.findByProps({ testID: 'patient_schedule_previous' }).props
      .isDisabled,
  ).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain('Select a valid saved week');
});
