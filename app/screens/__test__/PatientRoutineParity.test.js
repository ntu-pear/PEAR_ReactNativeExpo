import React from 'react';
import { act, create } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import PatientRoutineScreen from 'app/screens/PatientRoutineScreen';
import patientApi from 'app/api/patient';
import activityApi from 'app/api/activity';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: () => true,
}));
jest.mock('app/api/patient', () => ({
  __esModule: true,
  ...jest.requireActual('app/api/patient'),
  default: { readPatientV1: jest.fn() },
}));
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: {},
  PATIENT_V1_BASE: 'http://synthetic.invalid',
}));
jest.mock('app/api/activity', () => ({ getPatientRoutine: jest.fn() }));
jest.mock(
  'app/components/DynamicTable',
  () => (props) => require('react').createElement('MockTable', props),
);
jest.mock(
  'app/components/ProfileNameButton',
  () => (props) => require('react').createElement('MockProfile', props),
);
jest.mock(
  'app/components/ActivityIndicator',
  () => (props) => require('react').createElement('MockLoading', props),
);
jest.mock('app/utility/miscFunctions', () => ({
  noDataMessage: () => 'Synthetic empty state',
}));
let tree;
const mount = async (params) => {
  await act(async () => {
    tree = create(<PatientRoutineScreen route={{ params }} />);
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  patientApi.readPatientV1.mockResolvedValue({
    ok: true,
    data: {
      data: {
        id: '9007199254740993',
        preferredName: 'Synthetic Patient',
        profilePicture: 'https://synthetic.invalid/profile.png',
      },
    },
  });
  activityApi.getPatientRoutine.mockResolvedValue({
    ok: true,
    data: { data: [] },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test.each([
  { patientId: '9007199254740993' },
  { patientID: '9007199254740993' },
  { patientProfile: { patientID: '9007199254740993' } },
])(
  'actual card and legacy routes preserve patient identity %#',
  async (params) => {
    await mount(params);
    expect(activityApi.getPatientRoutine).toHaveBeenCalledWith(
      '9007199254740993',
    );
    expect(patientApi.readPatientV1).toHaveBeenCalledWith('9007199254740993');
    const h = tree.root.findByType('MockProfile').props;
    expect(h.profileLineOne).toBe('Synthetic Patient');
    expect(h.profilePicture).toBe('https://synthetic.invalid/profile.png');
    expect(h.testID).toContain('9007199254740993');
    expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
  },
);
test('failed routine read is an error with retry, not successful empty data', async () => {
  activityApi.getPatientRoutine.mockResolvedValueOnce({
    ok: false,
    status: 500,
  });
  await mount({ patientId: '9007199254740993' });
  expect(tree.root.findByProps({ testID: 'routine_read_error' })).toBeDefined();
  expect(tree.root.findByType('MockTable').props.noDataMessage).toBeNull();
  await act(async () => tree.root.findByType(TouchableOpacity).props.onPress());
  expect(activityApi.getPatientRoutine).toHaveBeenCalledTimes(2);
  expect(
    tree.root.findAllByProps({ testID: 'routine_read_error' }),
  ).toHaveLength(0);
});
test('cross-patient header cannot be displayed', async () => {
  patientApi.readPatientV1.mockResolvedValue({
    ok: true,
    data: { id: 8, preferredName: 'Other synthetic patient' },
  });
  await mount({ patientId: '9007199254740993' });
  expect(tree.root.findAllByType('MockProfile')).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'routine_read_error' })).toBeDefined();
});
test('missing patient makes no request and loading settles', async () => {
  await mount({});
  expect(activityApi.getPatientRoutine).not.toHaveBeenCalled();
  expect(patientApi.readPatientV1).not.toHaveBeenCalled();
  expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
});
test('thrown routine adapter settles loading and remains an error', async () => {
  activityApi.getPatientRoutine.mockRejectedValue(
    new Error('Synthetic failure'),
  );
  await mount({ patientId: '9007199254740993' });
  expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
  expect(tree.root.findByProps({ testID: 'routine_read_error' })).toBeDefined();
});
test('late response after leaving cannot revive the old patient header', async () => {
  let resolve;
  patientApi.readPatientV1.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  await mount({ patientId: '9007199254740993' });
  act(() => tree.unmount());
  tree = null;
  await act(async () =>
    resolve({ ok: true, data: { id: '9007199254740993' } }),
  );
});
