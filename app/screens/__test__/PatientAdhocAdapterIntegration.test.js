import React from 'react';
import { act, create } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import AuthContext from 'app/auth/context';
import PatientAdhocScreen from 'app/screens/PatientAdhocScreen';
import centreApi from 'app/api/centreManagement';
import mockClient from 'app/api/client';
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
  ACTIVITY_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('app/api/centreManagement', () => ({
  list: jest.fn(),
  workingHours: jest.fn(),
  get: jest.fn(),
  write: jest.fn(),
}));
jest.mock('app/api/schedule', () => ({
  getScheduleV1: jest.fn(async () => ({
    ok: true,
    data: { Status: '200', Data: [] },
  })),
}));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => () => null,
);
let tree;
const payload = () => ({
  patients: [{ id: '7' }],
  activities: [],
  centre_activities: [],
  preferences: [],
  recommendations: [],
  exclusions: [],
});
beforeEach(() => {
  jest.clearAllMocks();
  centreApi.list.mockResolvedValue([]);
  centreApi.workingHours.mockResolvedValue({
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
        ].map((day) => [day, { open: '09:00', close: '17:00' }]),
      ),
    },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test.each(['valid', 'missing-patient', 'unsafe-patient'])(
  'actual activity adapter through patient ad hoc hook: %s',
  async (kind) => {
    const data = payload();
    if (kind === 'missing-patient') {
      delete data.patients;
    }
    if (kind === 'unsafe-patient') {
      data.patients = [{ id: 9007199254740993 }];
    }
    mockClient.get.mockResolvedValue({ ok: true, data });
    await act(async () => {
      tree = create(
        <AuthContext.Provider
          value={{ user: { id: 'SyntheticActor', roleName: 'SUPERVISOR' } }}
        >
          <PatientAdhocScreen route={{ params: { patientID: '7' } }} />
        </AuthContext.Provider>,
      );
    });
    const text = tree.root
      .findAllByType(Text)
      .map((n) => [n.props.children].flat(Infinity).join(''))
      .join(' ');
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith(
      '/aggregated/activity-preference-table/patient/7',
      { include_deleted: false },
      expect.anything(),
    );
    const add = tree.root
      .findAllByType(TouchableOpacity)
      .find((n) =>
        n
          .findAllByType(Text)
          .some((t) => t.props.children === 'Add patient ad hoc request'),
      );
    expect(add.props.disabled).toBe(kind !== 'valid');
    expect(text.includes('No active ad hoc requests')).toBe(kind === 'valid');
    expect(centreApi.write).not.toHaveBeenCalled();
  },
);
