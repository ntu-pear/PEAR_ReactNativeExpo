import React from 'react';
import { act, create } from 'react-test-renderer';
import { Alert } from 'react-native';
import Screen from 'app/screens/EditPatientPreferencesScreen';
import AuthContext from 'app/auth/context';
import client from 'app/api/client';
import {
  resolvePreferredLanguage,
  buildPatientPreferencesUpdate,
} from 'app/utility/patientFieldPolicy';
const mockNavigation = { replace: jest.fn() };
const mockOptions = [
  { label: 'English', value: 2 },
  { label: 'Spanish', value: 12 },
];
let mockSelection = { data: mockOptions, isLoading: false, isError: false };
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
  const { View, Text } = require('react-native');
  return {
    Box: View,
    VStack: View,
    Text,
    FlatList: ({ renderItem }) => renderItem(),
  };
});
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/components/input-components/InputField', () => (props) => {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      testID={props.testID}
      onChangeText={props.onChangeText}
      onEndEditing={props.onEndEditing}
      value={props.value}
    />
  );
});
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
);
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
const mount = async (language = 12, actor = 'Actor-X') =>
  act(async () => {
    screen = create(
      <AuthContext.Provider
        value={{ user: { id: actor, roleName: 'CAREGIVER' } }}
      >
        <Screen
          route={{
            params: {
              patientProfile: {
                patientID: 'Patient-X',
                preferredName: 'TEST P',
                preferredLanguage: language,
                nric: 'SXXXX567D',
                address: 'Stale display',
              },
            },
          }}
        />
      </AuthContext.Provider>,
    );
  });
const save = () => screen.root.findByProps({ testID: 'save' });
const displayProfile = (id = 'Patient-X', name = 'TEST P', language = 12) => ({
  patientID: id,
  preferredName: name,
  preferredLanguage: language,
  nric: 'SXXXX567D',
  address: 'Stale display',
});
const element = (
  profile = displayProfile(),
  actor = 'Actor-X',
  role = 'CAREGIVER',
) => (
  <AuthContext.Provider value={{ user: { id: actor, roleName: role } }}>
    <Screen route={{ params: { patientProfile: profile } }} />
  </AuthContext.Provider>
);
const update = async (profile, actor = 'Actor-X', role = 'CAREGIVER') =>
  act(async () => screen.update(element(profile, actor, role)));
const secondProfile = () => displayProfile('Patient-Y', 'SECOND PATIENT', 2);
const secondRaw = () => ({
  ...raw,
  id: 'Patient-Y',
  name: 'SECOND PATIENT',
  preferredName: 'SECOND PATIENT',
  preferredLanguageId: 2,
  nric: 'S7654321D',
  address: 'SECOND ADDRESS',
});
const nameInput = () => screen.root.findByProps({ testID: 'preferences-name' });
const languageInput = () =>
  screen.root.findAllByProps({ testID: 'preferences-language' })[0];
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
test.each([12, '12', 'Spanish', ' spanish '])(
  'recognized language %p opens and selects the actual ID',
  async (value) => {
    await mount(value);
    expect(
      screen.root.findAllByProps({ testID: 'preferences-language' })[0].props
        .value,
    ).toBe(12);
    expect(save().props.disabled).toBe(false);
    expect(client.put).not.toHaveBeenCalled();
  },
);
test.each([null, '', 'Unknown language', 999, {}])(
  'unknown language %p opens safely and cannot save until chosen',
  async (value) => {
    await mount(value);
    expect(save().props.disabled).toBe(true);
    await act(async () => save().props.onPress());
    expect(client.get).not.toHaveBeenCalled();
    expect(client.put).not.toHaveBeenCalled();
    act(() =>
      screen.root
        .findAllByProps({ testID: 'preferences-language' })[0]
        .props.onDataChange(2),
    );
    expect(save().props.disabled).toBe(false);
  },
);
test('failed language loading cannot invent an ID or send a write', async () => {
  mockSelection = { data: [], isLoading: false, isError: true };
  await mount();
  expect(save().props.disabled).toBe(true);
  await act(async () => save().props.onPress());
  expect(client.put).not.toHaveBeenCalled();
});
test('save uses a fresh complete record and actual actor, preserves identity/photo/status and prevents double submission', async () => {
  await mount();
  act(() =>
    screen.root
      .findByProps({ testID: 'preferences-name' })
      .props.onChangeText('New Preferred'),
  );
  const submit = save().props.onPress;
  await act(async () => {
    await Promise.all([submit(), submit()]);
  });
  expect(client.get).toHaveBeenCalledWith(
    '/patients/Patient-X',
    { require_auth: true, mask: false },
    expect.any(Object),
  );
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(client.put.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      nric: raw.nric,
      address: raw.address,
      profilePicture: raw.profilePicture,
      preferredLanguageId: 12,
      preferredName: 'NEW PREFERRED',
      ModifiedById: 'Actor-X',
      isApproved: '1',
      endDate: null,
    }),
  );
  expect(mockNavigation.replace).toHaveBeenCalledWith('PatientProfile', {
    patientId: 'Patient-X',
  });
});
test.each([
  { ok: false, status: 403 },
  { ok: true, data: { data: { ...raw, id: 'Other-X' } } },
  { ok: true, data: { data: { ...raw, nric: 'SXXXX567D' } } },
])('unavailable or wrong patient data never writes', async (response) => {
  client.get.mockResolvedValue(response);
  await mount();
  await act(async () => save().props.onPress());
  expect(client.put).not.toHaveBeenCalled();
});
test('missing actor prevents save without inventing an account', async () => {
  await mount(12, null);
  await act(async () => save().props.onPress());
  expect(client.put).not.toHaveBeenCalled();
});
test('an uncertain dispatched save cannot be replayed', async () => {
  client.put.mockResolvedValue({
    ok: false,
    status: null,
    problem: 'NETWORK_ERROR',
  });
  await mount();
  const submit = save().props.onPress;
  await act(async () => submit());
  expect(save().props.disabled).toBe(true);
  await act(async () => save().props.onPress());
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});
test('resolver does not throw for missing or malformed option collections', () => {
  expect(resolvePreferredLanguage(undefined, mockOptions)).toBe(0);
  expect(resolvePreferredLanguage(12, null)).toBe(0);
  expect(resolvePreferredLanguage(12, [null, {}])).toBe(0);
});

test('leaving while the fresh patient read is pending prevents the write', async () => {
  let resolveRead;
  client.get.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  );
  await mount();
  let pending;
  act(() => {
    pending = save().props.onPress();
  });
  act(() => screen.unmount());
  screen = null;
  await act(async () => {
    resolveRead({ ok: true, data: { data: raw } });
    await pending;
  });
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('an empty preferred name cannot dispatch a read or write', async () => {
  await mount();
  act(() =>
    screen.root
      .findByProps({ testID: 'preferences-name' })
      .props.onChangeText('   '),
  );
  expect(save().props.disabled).toBe(true);
  await act(async () => save().props.onPress());
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
});

test.each([0, '0', false, 'unknown', {}, Number.MAX_SAFE_INTEGER + 1])(
  'invalid language identifier %p cannot enter a patient update',
  (value) => {
    expect(() =>
      buildPatientPreferencesUpdate({
        record: raw,
        patientId: 'Patient-X',
        userId: 'Actor-X',
        preferredName: 'TEST',
        preferredLanguageId: value,
        languageOptions: [{ label: 'Bad', value }],
      }),
    ).toThrow();
  },
);

test('account change while fresh read is pending cancels the old actor write and navigation', async () => {
  let resolveRead;
  client.get.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  );
  await mount(12, 'Actor-A');
  let pending;
  act(() => {
    pending = save().props.onPress();
  });
  await update(displayProfile(), 'Actor-B');
  await act(async () => {
    resolveRead({ ok: true, data: { data: raw } });
    await pending;
  });
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(save().props.disabled).toBe(false);
});

test('retained old-account callback cannot borrow the new actor owner; the new callback uses Actor-B', async () => {
  await mount(12, 'Actor-A');
  const oldSave = save().props.onPress;
  await update(displayProfile(), 'Actor-B');
  await act(async () => oldSave());
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
  await act(async () => save().props.onPress());
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(client.put.mock.calls[0][1].ModifiedById).toBe('Actor-B');
});

test('a role change for the same actor retires the retained callback', async () => {
  await mount();
  const oldSave = save().props.onPress;
  await update(displayProfile(), 'Actor-X', 'SUPERVISOR');
  await act(async () => oldSave());
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('retained patient-A callback cannot read or write A after route changes to B', async () => {
  await mount();
  const oldSave = save().props.onPress;
  await update(secondProfile());
  await act(async () => oldSave());
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('patient change while fresh read is pending cancels the old patient write', async () => {
  let resolveRead;
  client.get.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  );
  await mount();
  let pending;
  act(() => {
    pending = save().props.onPress();
  });
  await update(secondProfile());
  await act(async () => {
    resolveRead({ ok: true, data: { data: raw } });
    await pending;
  });
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(nameInput().props.value).toBe('SECOND PATIENT');
  expect(languageInput().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
});

test('reusing A form for B resets edited name, language choice and validation before B save', async () => {
  await mount();
  act(() => {
    nameInput().props.onChangeText('first draft');
    languageInput().props.onDataChange(12);
    nameInput().props.onEndEditing(true);
  });
  expect(save().props.disabled).toBe(true);
  await update(secondProfile());
  expect(nameInput().props.value).toBe('SECOND PATIENT');
  expect(languageInput().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
  client.get.mockResolvedValue({ ok: true, data: { data: secondRaw() } });
  await act(async () => save().props.onPress());
  expect(client.get).toHaveBeenCalledWith(
    '/patients/Patient-Y',
    expect.any(Object),
    expect.any(Object),
  );
  expect(client.put.mock.calls[0][0]).toBe('/patients/update/Patient-Y');
  expect(client.put.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      preferredName: 'SECOND PATIENT',
      preferredLanguageId: 2,
      nric: 'S7654321D',
      address: 'SECOND ADDRESS',
    }),
  );
});

test('retained input callbacks cannot insert A draft or validation into B', async () => {
  await mount();
  const oldName = nameInput().props.onChangeText;
  const oldLanguage = languageInput().props.onDataChange;
  const oldError = nameInput().props.onEndEditing;
  await update(secondProfile());
  act(() => {
    oldName('old draft');
    oldLanguage(12);
    oldError(true);
  });
  expect(nameInput().props.value).toBe('SECOND PATIENT');
  expect(languageInput().props.value).toBe(2);
  expect(save().props.disabled).toBe(false);
});

test('A to B to A does not revive A old save callback', async () => {
  await mount();
  const oldSave = save().props.onPress;
  await update(secondProfile());
  await update(displayProfile());
  await act(async () => oldSave());
  expect(client.get).not.toHaveBeenCalled();
  expect(client.put).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('a save already dispatched cannot publish to a newer patient view', async () => {
  let resolveWrite;
  client.put.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveWrite = resolve;
      }),
  );
  await mount();
  let pending;
  await act(async () => {
    pending = save().props.onPress();
  });
  expect(client.put).toHaveBeenCalledTimes(1);
  await update(secondProfile());
  await act(async () => {
    resolveWrite({ ok: true, status: 200 });
    await pending;
  });
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(nameInput().props.value).toBe('SECOND PATIENT');
});

test('an uncertain dispatched save keeps replay blocked after owner changes', async () => {
  let resolveWrite;
  client.put.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveWrite = resolve;
      }),
  );
  await mount();
  let pending;
  await act(async () => {
    pending = save().props.onPress();
  });
  await update(secondProfile());
  await act(async () => {
    resolveWrite({ ok: false, status: null });
    await pending;
  });
  expect(save().props.disabled).toBe(true);
  await update(displayProfile());
  await act(async () => save().props.onPress());
  expect(client.put).toHaveBeenCalledTimes(1);
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('screen save retains long string patient and actor IDs without rounding', async () => {
  await mount();
  const patient = '90071992547409931';
  const actor = '90071992547409935';
  await update(displayProfile(patient), actor);
  client.get.mockResolvedValue({
    ok: true,
    data: { data: { ...raw, id: patient } },
  });
  await act(async () => save().props.onPress());
  expect(client.get.mock.calls[0][0]).toBe('/patients/' + patient);
  expect(client.put.mock.calls[0][0]).toBe('/patients/update/' + patient);
  expect(client.put.mock.calls[0][1].ModifiedById).toBe(actor);
});
