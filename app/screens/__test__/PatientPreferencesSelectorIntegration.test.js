import React from 'react';
import { act, create } from 'react-test-renderer';
import { Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import Screen from 'app/screens/EditPatientPreferencesScreen';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import AuthContext from 'app/auth/context';
import client from 'app/api/client';

const mockNavigation = { replace: jest.fn() };
const mockOptions = [
  { label: 'English', value: 2 },
  { label: 'Spanish', value: 12 },
];
let mockSelection;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('app/hooks/useGetSelectionOptions', () => () => mockSelection);
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
  PATIENT_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('native-base', () => {
  const ReactState = require('react');
  const { View, Text: NativeText } = require('react-native');
  const Actionsheet = ({ isOpen, children }) =>
    isOpen ? <View testID="language-sheet">{children}</View> : null;
  Actionsheet.Content = View;
  return {
    Box: View,
    VStack: View,
    Text: NativeText,
    FlatList: ({ renderItem }) => renderItem(),
    Actionsheet,
    useDisclose: () => {
      const [isOpen, setOpen] = ReactState.useState(false);
      return {
        isOpen,
        onOpen: () => setOpen(true),
        onClose: () => setOpen(false),
      };
    },
  };
});
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));
jest.mock('app/components/ErrorMessage', () => () => null);
jest.mock('app/components/RequiredIndicator', () => () => null);
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/components/input-components/InputField', () => (props) => {
  const { TextInput } = require('react-native');
  return <TextInput {...props} />;
});
jest.mock('app/components/AppButton', () => (props) => {
  const { TouchableOpacity: SaveTouchable } = require('react-native');
  return (
    <SaveTouchable
      testID="save"
      onPress={props.onPress}
      disabled={props.isDisabled}
    />
  );
});

const raw = {
  id: 'Patient-X',
  name: 'TEST PATIENT',
  nric: 'S1234567D',
  gender: 'M',
  dateOfBirth: '1950-01-01',
  isApproved: '1',
  updateBit: '1',
  autoGame: '1',
  startDate: '2020-01-01',
  endDate: null,
  isActive: '1',
  isRespiteCare: '0',
  privacyLevel: 2,
  address: 'TEST ADDRESS',
  preferredName: 'TEST P',
  preferredLanguageId: 12,
  profilePicture: 'https://synthetic.invalid/photo.png',
};
let screen;
const profile = (language = 12) => ({
  patientID: 'Patient-X',
  preferredName: 'TEST P',
  preferredLanguage: language,
});
const element = (patient, actor = 'Actor-X') => (
  <AuthContext.Provider value={{ user: { id: actor, roleName: 'CAREGIVER' } }}>
    <Screen route={{ params: { patientProfile: patient } }} />
  </AuthContext.Provider>
);
const mount = async (patient = profile()) =>
  act(async () => {
    screen = create(element(patient));
  });
const rerender = async (patient = profile(), actor = 'Actor-X') =>
  act(async () => screen.update(element(patient, actor)));
const selector = () => screen.root.findByType(SelectionInputField);
const save = () => screen.root.findByProps({ testID: 'save' });
const openPicker = () =>
  act(() => selector().findAllByType(TouchableOpacity)[0].props.onPress());
const choice = (label) =>
  selector()
    .findByType(FlatList)
    .findAllByType(TouchableOpacity)
    .find((row) =>
      row.findAllByType(Text).some((text) => text.props.children === label),
    );
const choose = (label) => {
  openPicker();
  expect(
    screen.root.findAllByProps({ testID: 'language-sheet' }).length,
  ).toBeGreaterThan(0);
  act(() => choice(label).props.onPress());
  expect(screen.root.findAllByProps({ testID: 'language-sheet' })).toHaveLength(
    0,
  );
};
const submit = async () => act(async () => save().props.onPress());
beforeEach(() => {
  jest.clearAllMocks();
  mockSelection = { data: mockOptions, isLoading: false, isError: false };
  client.get.mockResolvedValue({ ok: true, data: { data: raw } });
  client.put.mockResolvedValue({ ok: true, status: 200 });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  if (screen) {
    act(() => screen.unmount());
  }
  screen = null;
  jest.restoreAllMocks();
});

test('real selector accepts a valid choice after a missing required language', async () => {
  await mount({ ...profile(), preferredLanguage: undefined });
  expect(save().props.disabled).toBe(true);
  choose('English');
  expect(selector().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
  await submit();
  expect(client.put).toHaveBeenCalledWith(
    '/patients/update/Patient-X',
    expect.objectContaining({
      preferredLanguageId: 2,
      ModifiedById: 'Actor-X',
    }),
    expect.anything(),
  );
});

test('late options enable an existing prefill without remounting the real selector', async () => {
  mockSelection = { data: [], isLoading: false, isError: false };
  await mount();
  const initialSelector = selector();
  expect(save().props.disabled).toBe(true);
  mockSelection = { data: mockOptions, isLoading: false, isError: false };
  await rerender();
  expect(selector()).toBe(initialSelector);
  expect(selector().props.value).toBe(12);
  expect(save().props.disabled).toBe(false);
  await submit();
  expect(client.put.mock.calls[0][1].preferredLanguageId).toBe(12);
});

test('a valid real-selector prefill saves once and retains fresh protected fields', async () => {
  await mount();
  expect(save().props.disabled).toBe(false);
  await submit();
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(client.put.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      preferredLanguageId: 12,
      preferredName: 'TEST P',
      ModifiedById: 'Actor-X',
      nric: raw.nric,
      profilePicture: raw.profilePicture,
    }),
  );
});

test.each([99, {}, 'unknown'])(
  'unresolved prefill %p stays disabled until a real valid choice',
  async (language) => {
    await mount(profile(language));
    expect(selector().props.value).toBe(0);
    expect(save().props.disabled).toBe(true);
    await submit();
    expect(client.get).not.toHaveBeenCalled();
    expect(client.put).not.toHaveBeenCalled();
    choose('English');
    expect(save().props.disabled).toBe(false);
  },
);

test('removing a chosen option disables Save, restoring it enables the same owned draft', async () => {
  const patient = { ...profile(), preferredLanguage: undefined };
  await mount(patient);
  choose('English');
  const initialSelector = selector();
  mockSelection = { data: [mockOptions[1]], isLoading: false, isError: false };
  await rerender(patient);
  expect(selector()).toBe(initialSelector);
  expect(selector().props.value).toBe(0);
  expect(save().props.disabled).toBe(true);
  await submit();
  expect(client.get).not.toHaveBeenCalled();
  mockSelection = { data: mockOptions, isLoading: false, isError: false };
  await rerender(patient);
  expect(selector().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
  await submit();
  expect(client.put.mock.calls[0][1].preferredLanguageId).toBe(2);
});

test('malformed catalog entries never become real-selector choices or valid prefills', async () => {
  mockSelection = {
    data: [
      { label: 'Zero', value: 0 },
      { label: {}, value: 12 },
      { label: 'Malformed', value: 'x' },
      mockOptions[0],
    ],
    isLoading: false,
    isError: false,
  };
  await mount();
  expect(selector().props.dataArray).toEqual([mockOptions[0]]);
  expect(save().props.disabled).toBe(true);
  choose('English');
  expect(save().props.disabled).toBe(false);
});

test('selection-load errors still block saving a valid real-selector choice', async () => {
  mockSelection = { data: mockOptions, isLoading: false, isError: true };
  await mount();
  choose('English');
  expect(save().props.disabled).toBe(true);
  await submit();
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
  mockSelection = { data: mockOptions, isLoading: false, isError: false };
  await rerender();
  expect(save().props.disabled).toBe(false);
});

test('a retained real-selector item callback cannot put A language into B draft', async () => {
  await mount();
  openPicker();
  const oldChoice = choice('Spanish').props.onPress;
  const second = {
    patientID: 'Patient-Y',
    preferredName: 'SECOND PATIENT',
    preferredLanguage: 2,
  };
  await rerender(second, 'Actor-Y');
  act(() => oldChoice());
  expect(selector().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
});
