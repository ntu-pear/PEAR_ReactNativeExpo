import React, { useState } from 'react';
import { act, create } from 'react-test-renderer';
import guardianApi from 'app/api/guardian';
import ExistingPrimaryGuardian from 'app/components/ExistingPrimaryGuardian';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
import AuthContext from 'app/auth/context';
import PatientAddScreen from 'app/screens/PatientAddScreen';
import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import patientApi from 'app/api/patient';
const mockStorageValues = new Map();
const mockNavigation = {
  addListener: jest.fn(() => () => {}),
  navigate: jest.fn(),
  dispatch: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (key) => mockStorageValues.get(key) || null,
  setItem: async (key, value) => mockStorageValues.set(key, value),
  removeItem: async (key) => mockStorageValues.delete(key),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('expo-image-picker', () => ({}));
jest.mock('app/utility/patientDraft', () => ({
  loadDraft: async () => null,
  saveDraft: jest.fn(),
  clearDraft: jest.fn(),
}));
jest.mock('app/api/patient', () => ({
  addPatient: jest.fn(),
  addGuardian: jest.fn(),
}));
jest.mock('app/api/privacyLevel', () => ({}));
jest.mock('app/screens/PatientAddPatientInfoScreen', () => () => null);
jest.mock('app/screens/PatientAddAllergyScreen', () => () => null);
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/api/guardian', () => ({
  getGuardianByNRIC: jest.fn(),
  getPatientGuardian: jest.fn(),
  getPatientAllocation: jest.fn(),
}));
jest.mock('native-base', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    View,
    Center: View,
    SectionList: ({ sections, renderItem, ListFooterComponent }) =>
      mockReact.createElement(
        View,
        null,
        sections[0].data.map((item, index) =>
          mockReact.createElement(
            View,
            { key: index },
            renderItem({ item, index }),
          ),
        ),
        mockReact.createElement(ListFooterComponent),
      ),
  };
});
jest.mock('app/components/AddPatientGuardian', () => () => null);
jest.mock('app/components/AddPatientProgress', () => () => null);
jest.mock('app/components/AddPatientBottomButtons', () => () => null);
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        testID="select-existing-relationship"
        onPress={() => props.onDataChange(3)}
      >
        <Text>Child</Text>
      </TouchableOpacity>
    );
  },
);
jest.mock('app/components/AppButton', () => (props) => {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity
      testID={props.testID}
      disabled={props.isDisabled}
      onPress={props.onPress}
    >
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
});
let currentGuardian;
const error = jest.fn();
function Form() {
  const [guardian, setGuardian] = useState({
    Mode: 'existing',
    ExistingGuardianId: null,
    NRIC: '',
    SelectedNric: '',
    RelationshipName: 'Child',
    RelationshipID: 3,
  });
  currentGuardian = guardian;
  return (
    <ExistingPrimaryGuardian
      guardian={guardian}
      onField={(field) => (value) =>
        setGuardian((old) => ({
          ...old,
          [field]: value,
          ...(field === 'RelationshipID'
            ? { RelationshipName: value === 3 ? 'Child' : '' }
            : {}),
        }))}
      onError={error}
    />
  );
}
const found = (nric = 'S0000000J') => ({
  ok: true,
  data: {
    patient_guardian: {
      id: '9007199254740993',
      nric,
      active: 'Y',
      isDeleted: '0',
      firstName: 'SYNTHETIC',
      lastName: 'GUARDIAN',
    },
    patients: [],
  },
});
beforeEach(() => {
  jest.clearAllMocks();
  mockStorageValues.clear();
  guardianApi.getGuardianByNRIC.mockResolvedValue(found());
});
test('actual form selects exact identity, then immediately invalidates it when the query changes', async () => {
  let tree;
  await act(async () => {
    tree = create(<Form />);
  });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'existing-primary-nric' })
      .props.onChangeText('S0000000J'),
  );
  await act(async () =>
    tree.root
      .findByProps({ testID: 'existing-primary-search', disabled: false })
      .props.onPress(),
  );
  expect(currentGuardian.ExistingGuardianId).toBe('9007199254740993');
  expect(error).toHaveBeenLastCalledWith(true);
  await act(async () =>
    tree.root
      .findByProps({ testID: 'select-existing-relationship' })
      .props.onPress(),
  );
  expect(error).toHaveBeenLastCalledWith(false);
  await act(async () =>
    tree.root
      .findByProps({ testID: 'existing-primary-nric' })
      .props.onChangeText('S0000001I'),
  );
  expect(currentGuardian.ExistingGuardianId).toBeNull();
  expect(error).toHaveBeenLastCalledWith(true);
  tree.unmount();
});
test('cancelled or query-changed deferred results cannot repopulate a selection', async () => {
  let release;
  guardianApi.getGuardianByNRIC.mockImplementation(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  let tree;
  await act(async () => {
    tree = create(<Form />);
  });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'existing-primary-nric' })
      .props.onChangeText('S0000000J'),
  );
  let pending;
  act(() => {
    pending = tree.root
      .findByProps({ testID: 'existing-primary-search', disabled: false })
      .props.onPress();
  });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'existing-primary-cancel', disabled: undefined })
      .props.onPress(),
  );
  await act(async () => {
    release(found());
    await pending;
  });
  expect(currentGuardian.ExistingGuardianId).toBeNull();
  expect(
    tree.root.findAllByProps({ testID: 'existing-primary-name' }),
  ).toHaveLength(0);
  tree.unmount();
});
test.each(['SUPERVISOR', 'CAREGIVER', 'DOCTOR'])(
  'existing-primary controls are Supervisor-only: %s',
  async (roleName) => {
    let tree;
    await act(async () => {
      tree = create(
        <AuthContext.Provider value={{ user: { id: 'TEST-ACTOR', roleName } }}>
          <PatientAddGuardianScreen
            formData={{ guardianInfo: [{}] }}
            componentList={{ guardian: [{}] }}
            handleFormData={() => () => {}}
            concatFormData={() => {}}
            removeFormData={() => {}}
          />
        </AuthContext.Provider>,
      );
    });
    expect(
      tree.root.findAllByProps({
        testID: 'primary-mode-existing',
        disabled: undefined,
      }).length > 0,
    ).toBe(roleName === 'SUPERVISOR');
    expect(guardianApi.getGuardianByNRIC).not.toHaveBeenCalled();
    tree.unmount();
  },
);

test.each(['replace form', 'leave screen'])(
  'registration screen prevents a patient POST after an async selection race: %s',
  async (action) => {
    let tree;
    await act(async () => {
      tree = create(
        <AuthContext.Provider
          value={{ user: { id: 'TEST-ACTOR', roleName: 'SUPERVISOR' } }}
        >
          <PatientAddScreen />
        </AuthContext.Provider>,
      );
    });
    const patientForm = tree.root.findByType(PatientAddPatientInfoScreen).props;
    await act(async () => patientForm.handleFormData('NRIC')('SYNTHETIC_PAT'));
    await act(async () => patientForm.nextQuestionHandler());
    const guardianForm = tree.root.findByType(PatientAddGuardianScreen).props;
    await act(async () => {
      const change = guardianForm.handleFormData;
      change('Mode', 0)('existing');
      change('ExistingGuardianId', 0)('9007199254740993');
      change('NRIC', 0)('S0000000J');
      change('SelectedNric', 0)('S0000000J');
      change('RelationshipName', 0)('Child');
    });
    // Mounting the lookup requires a fresh selection. Set the verified choice
    // through the screen's actual adapter after that mount effect has run.
    await act(async () => {
      const change = tree.root.findByType(PatientAddGuardianScreen).props
        .handleFormData;
      change('ExistingGuardianId', 0)('9007199254740993');
      change('SelectedNric', 0)('S0000000J');
    });
    let release;
    guardianApi.getGuardianByNRIC.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    let pending;
    act(() => {
      pending = tree.root.findByType(PatientAddGuardianScreen).props.onSubmit();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(guardianApi.getGuardianByNRIC).toHaveBeenCalledTimes(1);
    if (action === 'replace form') {
      await act(async () =>
        patientForm.handleFormData('NRIC')('CHANGED_SYNTHETIC_PAT'),
      );
    } else {
      act(() => tree.unmount());
    }
    await act(async () => {
      release(found());
      await pending;
    });
    expect(patientApi.addPatient).not.toHaveBeenCalled();
    expect(patientApi.addGuardian).not.toHaveBeenCalled();
    expect(mockStorageValues.size).toBe(0);
    if (action === 'replace form') {
      act(() => tree.unmount());
    }
  },
);
