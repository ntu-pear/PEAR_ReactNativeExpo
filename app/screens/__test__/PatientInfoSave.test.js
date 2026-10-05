import React from 'react';
import { act, create } from 'react-test-renderer';
import { Alert } from 'react-native';
import EditPatientInfoScreen from 'app/screens/EditPatientInfoScreen';
import AuthContext from 'app/auth/context';
import client from 'app/api/client';
const mockNavigation = { replace: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
  PATIENT_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('native-base', () => {
  const { View, Text } = require('react-native');
  return {
    Box: View,
    VStack: View,
    Text,
    FlatList: ({ renderItem }) => renderItem(),
  };
});
jest.mock(
  'app/components/input-components/RadioButtonsInput',
  () => () => null,
);
jest.mock('app/components/input-components/DateInputField', () => () => null);
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => () => null,
);
jest.mock('app/components/input-components/InputField', () => (props) => {
  const { TextInput } = require('react-native');
  return <TextInput testID={props.title} onChangeText={props.onChangeText} />;
});
jest.mock('app/components/AppButton', () => (props) => {
  const { TouchableOpacity } = require('react-native');
  return (
    <TouchableOpacity
      testID="save"
      onPress={props.onPress}
      disabled={props.isDisabled}
    />
  );
});
const raw = {
  id: 'Patient-X',
  name: 'Test Patient',
  nric: 'S1234567D',
  gender: 'M',
  dateOfBirth: '1950-01-01T00:00:00',
  isApproved: '1',
  updateBit: '1',
  autoGame: '1',
  startDate: '2020-01-01T00:00:00',
  endDate: null,
  isActive: '1',
  isRespiteCare: '0',
  privacyLevel: 2,
  address: 'Old',
  profilePicture: 'https://synthetic.invalid/photo.png',
  preferredLanguageId: 12,
};
let screen;
const mount = () =>
  act(() => {
    screen = create(
      <AuthContext.Provider
        value={{ user: { id: 'Actor-X', roleName: 'SUPERVISOR' } }}
      >
        <EditPatientInfoScreen
          route={{
            params: {
              patientProfile: {
                patientID: 'Patient-X',
                nric: 'SXXXX567D',
                address: 'Display stale',
              },
            },
          }}
        />
      </AuthContext.Provider>,
    );
  });
beforeEach(() => {
  jest.clearAllMocks();
  client.get.mockResolvedValue({ ok: true, data: { data: raw } });
  client.put.mockResolvedValue({ ok: true, status: 200 });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  if (screen) act(() => screen.unmount());
  screen = null;
  jest.restoreAllMocks();
});
test('saving re-reads the complete record, preserves photo/flags, uppercases only edited text and blocks duplicate submits', async () => {
  mount();
  act(() =>
    screen.root
      .findByProps({ testID: 'Address' })
      .props.onChangeText('new road'),
  );
  const save = screen.root.findByProps({ testID: 'save' }).props.onPress;
  await act(async () => {
    await Promise.all([save(), save()]);
  });
  expect(client.get).toHaveBeenCalledWith(
    '/patients/Patient-X',
    { require_auth: true, mask: false },
    expect.any(Object),
  );
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(client.put.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      address: 'NEW ROAD',
      nric: raw.nric,
      profilePicture: raw.profilePicture,
      isApproved: '1',
      updateBit: '1',
      autoGame: '1',
      preferredLanguageId: 12,
      ModifiedById: 'Actor-X',
    }),
  );
  expect(mockNavigation.replace).toHaveBeenCalledWith('PatientProfile', {
    patientId: 'Patient-X',
  });
});
test('an unavailable complete record cannot trigger a write', async () => {
  client.get.mockResolvedValue({ ok: false, status: 403 });
  mount();
  await act(async () =>
    screen.root.findByProps({ testID: 'save' }).props.onPress(),
  );
  expect(client.put).not.toHaveBeenCalled();
  expect(screen.root.findByProps({ testID: 'save' }).props.disabled).toBe(
    false,
  );
});
test('an uncertain write cannot be blindly retried', async () => {
  client.put.mockResolvedValue({
    ok: false,
    status: null,
    problem: 'NETWORK_ERROR',
  });
  mount();
  const save = screen.root.findByProps({ testID: 'save' }).props.onPress;
  await act(async () => save());
  expect(screen.root.findByProps({ testID: 'save' }).props.disabled).toBe(true);
  await act(async () =>
    screen.root.findByProps({ testID: 'save' }).props.onPress(),
  );
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});
