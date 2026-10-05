import React from 'react';
import { act, create } from 'react-test-renderer';
import PatientProfileScreen from 'app/screens/PatientProfileScreen';
import patientApi from 'app/api/patient';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';
import AuthContext from 'app/auth/context';
import { View } from 'react-native';

jest.mock('native-base', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Center: View,
    VStack: View,
    HStack: View,
    ScrollView: View,
    View,
    Text,
    Button: TouchableOpacity,
  };
});
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: View,
    MaterialIcons: View,
    FontAwesome5: View,
    Ionicons: View,
  };
});
jest.mock('app/api/patient', () => ({ readPatientV1: jest.fn() }));
jest.mock('app/api/guardian', () => ({ getPatientGuardian: jest.fn() }));
jest.mock('app/api/socialHistory', () => ({ getSocialHistory: jest.fn() }));
jest.mock(
  'app/components/PatientInformationCard',
  () =>
    ({ patientProfile }) => {
      const { Text } = require('react-native');
      return <Text>{patientProfile.preferredName}</Text>;
    },
);
jest.mock('app/components/PatientProfileCard', () => () => null);
jest.mock('app/components/ActivityIndicator', () => () => {
  const { Text } = require('react-native');
  return <Text testID="loading">Loading</Text>;
});
jest.mock('app/components/PatientInformationAccordion', () => (props) => {
  const { Text, View, TouchableOpacity } = require('react-native');
  return (
    <View>
      <Text testID="section-state">
        {JSON.stringify({
          guardianError: props.guardianError,
          socialHistoryError: props.socialHistoryError,
          guardianLoading: props.guardianLoading,
          socialHistoryLoading: props.socialHistoryLoading,
        })}
      </Text>
      <TouchableOpacity
        testID="open-optional-sections"
        onPress={() => {
          props.onLoadGuardian();
          props.onLoadSocialHistory();
        }}
      />
    </View>
  );
});

const response = (id = 1, preferredName = 'TEST PATIENT') => ({
  ok: true,
  data: { data: { patientID: id, preferredName } },
});
const view = (id = 1) => (
  <View>
    <AuthContext.Provider value={{ user: { roleName: 'SUPERVISOR' } }}>
      <PatientProfileScreen
        navigation={{ push: jest.fn() }}
        route={{ params: { id } }}
      />
    </AuthContext.Provider>
  </View>
);

const mounted = [];
const mount = async (id = 1) => {
  let screen;
  await act(async () => {
    screen = create(view(id));
  });
  mounted.push(screen);
  return screen;
};
const byId = (screen, id) => screen.root.findByProps({ testID: id });
const hasText = (screen, value) =>
  screen.root.findAll((node) => node.props.children === value).length > 0;

beforeEach(() => {
  patientApi.readPatientV1.mockReset().mockResolvedValue(response());
  guardianApi.getPatientGuardian
    .mockReset()
    .mockResolvedValue({ ok: true, data: { data: [] } });
  socialHistoryApi.getSocialHistory
    .mockReset()
    .mockResolvedValue({ ok: true, data: { data: null } });
});
afterEach(() => {
  mounted.splice(0).forEach((screen) => act(() => screen.unmount()));
  jest.useRealTimers();
});

test('patient information renders without fetching optional sections or discarding missing optional fields', async () => {
  guardianApi.getPatientGuardian.mockReturnValue(new Promise(() => {}));
  socialHistoryApi.getSocialHistory.mockReturnValue(new Promise(() => {}));
  const screen = await mount();
  expect(hasText(screen, 'TEST PATIENT')).toBe(true);
  expect(screen.root.findAllByProps({ testID: 'loading' })).toHaveLength(0);
  expect(guardianApi.getPatientGuardian).not.toHaveBeenCalled();
  expect(socialHistoryApi.getSocialHistory).not.toHaveBeenCalled();
});

test.each([401, 403, 404, 500])(
  'HTTP %s displays an error and retry succeeds',
  async (status) => {
    patientApi.readPatientV1.mockResolvedValueOnce({ ok: false, status });
    const screen = await mount();
    expect(byId(screen, 'patient-load-error').props.children).toContain(
      String(status),
    );
    await act(async () => byId(screen, 'patient-load-retry').props.onPress());
    expect(hasText(screen, 'TEST PATIENT')).toBe(true);
    expect(patientApi.readPatientV1).toHaveBeenCalledTimes(2);
  },
);

test('a request which never settles stops loading at the deadline', async () => {
  jest.useFakeTimers();
  patientApi.readPatientV1.mockReturnValue(new Promise(() => {}));
  const screen = await mount();
  await act(async () => {
    jest.advanceTimersByTime(30000);
  });
  expect(screen.root.findAllByProps({ testID: 'loading' })).toHaveLength(0);
  expect(byId(screen, 'patient-load-error')).toBeTruthy();
});

test('opened optional sections fail visibly on 403/404 and repeated opening does not repeat requests', async () => {
  guardianApi.getPatientGuardian.mockResolvedValue({ ok: false, status: 403 });
  socialHistoryApi.getSocialHistory.mockResolvedValue({
    ok: false,
    status: 404,
  });
  const screen = await mount();
  await act(async () => byId(screen, 'open-optional-sections').props.onPress());
  const section = JSON.parse(byId(screen, 'section-state').props.children);
  expect(section.guardianError).toContain('403');
  expect(section.socialHistoryError).toContain('404');
  await act(async () => byId(screen, 'open-optional-sections').props.onPress());
  expect(guardianApi.getPatientGuardian).toHaveBeenCalledTimes(1);
  expect(socialHistoryApi.getSocialHistory).toHaveBeenCalledTimes(1);
});

test('an old patient response cannot replace the newly selected patient', async () => {
  let resolveOld;
  patientApi.readPatientV1.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve;
    }),
  );
  const screen = await mount(1);
  patientApi.readPatientV1.mockResolvedValue(
    response(2, 'SECOND TEST PATIENT'),
  );
  await act(async () => screen.update(view(2)));
  expect(hasText(screen, 'SECOND TEST PATIENT')).toBe(true);
  await act(async () => resolveOld(response(1, 'OLD TEST PATIENT')));
  expect(hasText(screen, 'OLD TEST PATIENT')).toBe(false);
  expect(hasText(screen, 'SECOND TEST PATIENT')).toBe(true);
});

test('a response for the wrong patient is rejected visibly', async () => {
  patientApi.readPatientV1.mockResolvedValue(response(2));
  const screen = await mount(1);
  expect(byId(screen, 'patient-load-error').props.children).toContain(
    'unexpected patient',
  );
  expect(hasText(screen, 'TEST PATIENT')).toBe(false);
});

test('unrelated route updates do not repeat the profile request', async () => {
  const screen = await mount();
  await act(async () => screen.update(view()));
  expect(patientApi.readPatientV1).toHaveBeenCalledTimes(1);
});
