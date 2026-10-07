import React from 'react';
import { act, create } from 'react-test-renderer';
import { Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import CentreActivitiesScreen from 'app/screens/CentreActivitiesScreen';
import PatientAdhocScreen from 'app/screens/PatientAdhocScreen';
import AuthContext from 'app/auth/context';
import api from 'app/api/centreManagement';
import activityApi from 'app/api/activity';
import scheduleApi from 'app/api/schedule';
let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocused,
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));
jest.mock('app/api/centreManagement', () => ({
  list: jest.fn(),
  workingHours: jest.fn(),
  get: jest.fn(),
  write: jest.fn(),
}));
jest.mock('app/api/activity', () => ({
  getPatientActivityAggregate: jest.fn(),
}));
jest.mock('app/api/schedule', () => ({
  getScheduleV1: jest.fn(),
  adhocScheduleV1: jest.fn(),
  generateScheduleV1: jest.fn(),
}));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => require('react').createElement('MockSelection', props),
);
let tree;
const user = (role) => ({ id: 'SyntheticActor', roleName: role });
const render = (role = 'SUPERVISOR', patient = false) => (
  <AuthContext.Provider value={{ user: user(role) }}>
    {patient ? (
      <PatientAdhocScreen route={{ params: { patientID: '7' } }} />
    ) : (
      <CentreActivitiesScreen />
    )}
  </AuthContext.Provider>
);
const mount = async (role, patient) => {
  await act(async () => {
    tree = create(render(role, patient));
  });
};
const text = () =>
  tree.root
    .findAllByType(Text)
    .map((n) => [n.props.children].flat(Infinity).join(''))
    .join(' ');
const click = async (label) => {
  const button = tree.root
    .findAllByType(TouchableOpacity)
    .find((n) =>
      n
        .findAllByType(Text)
        .some((t) =>
          [t.props.children].flat(Infinity).join('').startsWith(label),
        ),
    );
  expect(button).toBeTruthy();
  await act(async () => button.props.onPress());
};
beforeEach(() => {
  jest.clearAllMocks();
  mockFocused = true;
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-07T03:00:00Z'));
  api.list.mockImplementation(async (kind) =>
    kind === 'activity'
      ? [
          { id: 1, title: 'Art', is_deleted: false },
          { id: 2, title: 'Music', is_deleted: false },
        ]
      : kind === 'centre'
      ? [
          {
            id: 11,
            activity_id: 1,
            start_date: '2026-10-01',
            end_date: '2999-01-01',
            is_deleted: false,
          },
          {
            id: 12,
            activity_id: 2,
            start_date: '2026-10-01',
            end_date: '2999-01-01',
            is_deleted: false,
          },
        ]
      : [],
  );
  api.workingHours.mockResolvedValue({
    ok: true,
    data: {
      id: 1,
      working_hours: Object.fromEntries(
        [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ].map((d, i) => [
          d,
          i === 6 ? {} : { open: '09:00', close: i === 5 ? '13:00' : '17:00' },
        ]),
      ),
    },
  });
  activityApi.getPatientActivityAggregate.mockResolvedValue({
    ok: true,
    data: {
      patientID: '7',
      eligibility: { preferences: [], recommendations: [], exclusions: [] },
    },
  });
  scheduleApi.getScheduleV1.mockResolvedValue({
    ok: true,
    data: {
      Status: '200',
      Data: [
        {
          PatientID: '7',
          StartDate: '2026-10-05',
          EndDate: '2026-10-11',
          Wednesday: '{"09:00-10:00":"Art"}',
        },
      ],
    },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
  jest.useRealTimers();
  jest.restoreAllMocks();
});
test.each(['CAREGIVER', 'DOCTOR', 'GUARDIAN', 'ADMIN'])(
  '%s has no activity management reads or writes',
  async (role) => {
    await mount(role);
    expect(text()).toContain('requires Supervisor');
    expect(api.list).not.toHaveBeenCalled();
    expect(api.write).not.toHaveBeenCalled();
  },
);
test('configured Saturday hours and closed Sunday are visible; page is not hardcoded', async () => {
  await mount('SUPERVISOR');
  expect(text()).toContain('Saturday: 09:00');
  expect(text()).toContain('13:00');
  expect(text()).toContain('Sunday: Closed');
});
test('cancelled editor invalidates an already-open Save confirmation', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await mount('SUPERVISOR');
  await click('Catalogue');
  await click('Add Catalogue');
  const name = tree.root
    .findAllByType(TextInput)
    .find((n) => n.props.accessibilityLabel === 'Activity name');
  await act(async () => name.props.onChangeText('Synthetic New'));
  await click('Review and save');
  const save = alert.mock.calls[0][2].find((b) => b.text === 'Save');
  await click('Cancel');
  await act(async () => save.onPress());
  expect(api.write).not.toHaveBeenCalled();
});
test('actor/role switch hides loaded rows immediately and ignores late previous reads', async () => {
  let finish;
  api.workingHours.mockReturnValue(
    new Promise((r) => {
      finish = r;
    }),
  );
  await mount('SUPERVISOR');
  await act(async () => tree.update(render('CAREGIVER')));
  expect(text()).toContain('requires Supervisor');
  await act(async () =>
    finish({ ok: true, data: { id: 1, working_hours: {} } }),
  );
  expect(text()).toContain('requires Supervisor');
  expect(api.write).not.toHaveBeenCalled();
});
test('single-patient ad hoc reads only selected patient records and never generates a schedule', async () => {
  await mount('SUPERVISOR', true);
  expect(api.list).toHaveBeenCalledWith(
    'adhoc',
    expect.objectContaining({ patientId: '7' }),
  );
  expect(text()).toContain('No active ad hoc requests');
  expect(scheduleApi.generateScheduleV1).not.toHaveBeenCalled();
  expect(scheduleApi.adhocScheduleV1).not.toHaveBeenCalled();
});
test('failed patient rule read is an error rather than a successful empty request list', async () => {
  activityApi.getPatientActivityAggregate.mockResolvedValue({
    ok: false,
    status: 403,
  });
  await mount('SUPERVISOR', true);
  expect(text()).toContain('could not be loaded');
  expect(text()).not.toContain('No active ad hoc requests');
  expect(api.write).not.toHaveBeenCalled();
});

test('focus round trip invalidates a previous Save confirmation and closes its editor', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await mount('SUPERVISOR');
  await click('Catalogue');
  await click('Add Catalogue');
  const name = tree.root
    .findAllByType(TextInput)
    .find((n) => n.props.accessibilityLabel === 'Activity name');
  await act(async () => name.props.onChangeText('Synthetic New'));
  await click('Review and save');
  const save = alert.mock.calls[0][2].find((b) => b.text === 'Save');
  mockFocused = false;
  await act(async () => tree.update(render('SUPERVISOR')));
  mockFocused = true;
  await act(async () => tree.update(render('SUPERVISOR')));
  await act(async () => save.onPress());
  expect(api.write).not.toHaveBeenCalled();
  expect(text()).not.toContain('Review and save');
});
test('Supervisor catalogue Save writes once and requires exact read-back before success', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  api.write.mockResolvedValue({ ok: true, data: { id: 99 } });
  api.get.mockResolvedValue({
    ok: true,
    data: {
      id: 99,
      title: 'Synthetic New',
      description: null,
      is_deleted: false,
    },
  });
  await mount('SUPERVISOR');
  await click('Catalogue');
  await click('Add Catalogue');
  const name = tree.root
    .findAllByType(TextInput)
    .find((n) => n.props.accessibilityLabel === 'Activity name');
  await act(async () => name.props.onChangeText('Synthetic New'));
  await click('Review and save');
  await act(async () =>
    alert.mock.calls[0][2].find((b) => b.text === 'Save').onPress(),
  );
  expect(api.write).toHaveBeenCalledTimes(1);
  expect(api.write).toHaveBeenCalledWith('activity', 'create', {
    title: 'Synthetic New',
    description: null,
  });
  expect(api.get).toHaveBeenCalledWith('activity', 99);
  expect(text()).toContain('Activity saved.');
});
test('Supervisor single-patient Save records Pending without claiming scheduler application', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  api.write.mockImplementation(async (_kind, _action, payload) => ({
    ok: true,
    data: { id: 90, ...payload, is_deleted: false },
  }));
  api.get.mockImplementation(async () => ({
    ok: true,
    data: { id: 90, ...api.write.mock.calls[0][2], is_deleted: false },
  }));
  await mount('SUPERVISOR', true);
  await click('Add patient ad hoc request');
  const selectors = tree.root.findAllByType('MockSelection');
  await act(async () =>
    selectors
      .find((n) => n.props.title === 'Scheduled activity to replace')
      .props.onDataChange('11'),
  );
  await act(async () =>
    tree.root
      .findAllByType('MockSelection')
      .find((n) => n.props.title === 'Replacement centre activity')
      .props.onDataChange('12'),
  );
  await click('Review and save');
  await act(async () =>
    alert.mock.calls[0][2].find((b) => b.text === 'Save').onPress(),
  );
  expect(api.write).toHaveBeenCalledTimes(1);
  expect(api.write).toHaveBeenCalledWith(
    'adhoc',
    'create',
    expect.objectContaining({
      patient_id: '7',
      status: 'PENDING',
      old_centre_activity_id: 11,
      new_centre_activity_id: 12,
    }),
  );
  expect(text()).toContain('saved (PENDING)');
  expect(scheduleApi.generateScheduleV1).not.toHaveBeenCalled();
  expect(scheduleApi.adhocScheduleV1).not.toHaveBeenCalled();
});

test('large single-patient request lists render 50 rows per page without another server fetch', async () => {
  const original = api.list.getMockImplementation();
  api.list.mockImplementation(async (kind, ...args) =>
    kind === 'adhoc'
      ? Array.from({ length: 125 }, (_, i) => ({
          id: i + 1,
          patient_id: '7',
          status: 'PENDING',
          start_date: '2026-10-07T09:00:00+08:00',
          end_date: '2026-10-07T10:00:00+08:00',
          old_centre_activity_id: 11,
          new_centre_activity_id: 12,
        }))
      : original(kind, ...args),
  );
  await mount('SUPERVISOR', true);
  const count = () =>
    tree.root
      .findAllByType(Text)
      .filter((n) =>
        [n.props.children].flat(Infinity).join('').startsWith('Request '),
      ).length;
  expect(count()).toBe(50);
  expect(text()).not.toContain('Request 51:');
  const reads = api.list.mock.calls.length;
  await click('Next requests');
  expect(count()).toBe(50);
  expect(text()).toContain('Request 51:');
  expect(text()).not.toContain('Request 1:');
  expect(api.list).toHaveBeenCalledTimes(reads);
  await click('Next requests');
  expect(count()).toBe(25);
  expect(text()).toContain('Request 125:');
});
