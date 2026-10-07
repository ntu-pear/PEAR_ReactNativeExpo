import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map();
  return {
    getItem: jest.fn(async (key) => values.get(key) || null),
    setItem: jest.fn(async (key, value) => values.set(key, value)),
    removeItem: jest.fn(async (key) => values.delete(key)),
    clear: () => values.clear(),
  };
});
import { act, create } from 'react-test-renderer';
import { Alert } from 'react-native';
import AuthContext from 'app/auth/context';
import guardianApi from 'app/api/guardian';
import EditPatientGuardianScreen from 'app/screens/EditPatientGuardianScreen';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('app/api/guardian', () => ({
  getPatientGuardian: jest.fn(),
  updateGuardian: jest.fn(),
  getPatientAllocation: jest.fn(),
  updatePrimaryAllocation: jest.fn(),
}));
jest.mock('app/components/AppText', () => ({ children, ...props }) => {
  const { Text } = require('react-native');
  return <Text {...props}>{children}</Text>;
});
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
jest.mock('app/components/input-components/InputField', () => (props) => {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      testID={props.testID}
      value={props.value}
      onChangeText={props.onChangeText}
      {...props.otherProps}
    />
  );
});
const guardian = {
  id: 2,
  firstName: 'TEST',
  lastName: 'GUARDIAN',
  preferredName: 'TEST',
  nric: 'TEST ID',
  dateOfBirth: '1970-01-01T00:00:00Z',
  active: 'Y',
  isDeleted: '0',
  guardianApplicationUserId: 'TEST-LINK',
  contactNo: '12345678',
  gender: 'F',
};
const response = (relationshipName = 'Child') => ({
  ok: true,
  data: {
    patient: { id: 7 },
    patient_guardians: [{ patient_guardian: guardian, relationshipName }],
  },
});
const render = async (roleName = 'SUPERVISOR') => {
  let tree;
  await act(async () => {
    tree = create(
      <AuthContext.Provider value={{ user: { id: 'TEST-ACTOR', roleName } }}>
        <EditPatientGuardianScreen
          route={{
            params: { guardianProfile: { guardianID: 2 }, patientID: 7 },
          }}
        />
      </AuthContext.Provider>,
    );
  });
  return tree;
};
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  guardianApi.getPatientGuardian.mockResolvedValue(response());
  guardianApi.getPatientAllocation.mockResolvedValue({
    ok: true,
    data: {
      id: 3,
      patientId: 7,
      active: 'Y',
      isDeleted: false,
      guardianId: 1,
      guardian2Id: 2,
      caregiverId: 'TEST-CG',
    },
  });
  guardianApi.updateGuardian.mockResolvedValue({ ok: true });
  guardianApi.updatePrimaryAllocation.mockResolvedValue({ ok: true });
});
afterEach(() => jest.restoreAllMocks());

test.each(['route', 'account'])(
  'a deferred guardian load cannot populate a changed %s session',
  async (kind) => {
    const initialUser = { id: 'TEST-ACTOR', roleName: 'SUPERVISOR' };
    let release;
    guardianApi.getPatientGuardian.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const screen = (patientID, guardianID, account) => (
      <AuthContext.Provider value={{ user: account }}>
        <EditPatientGuardianScreen
          route={{ params: { patientID, guardianProfile: { guardianID } } }}
        />
      </AuthContext.Provider>
    );
    let tree;
    await act(async () => {
      tree = create(screen(7, 2, initialUser));
    });
    const nextPatient = kind === 'route' ? 8 : 7;
    const nextGuardian = kind === 'route' ? 4 : 2;
    const nextUser =
      kind === 'account' ? { ...initialUser, id: 'NEXT-ACTOR' } : initialUser;
    const nextResponse = {
      ok: true,
      data: {
        patient: { id: nextPatient },
        patient_guardians: [
          {
            patient_guardian: {
              ...guardian,
              id: nextGuardian,
              firstName: 'NEXT',
            },
            relationshipName: 'Child',
          },
        ],
      },
    };
    guardianApi.getPatientGuardian.mockResolvedValue(nextResponse);
    guardianApi.getPatientAllocation.mockResolvedValue({
      ok: true,
      data: {
        id: 5,
        patientId: nextPatient,
        guardianId: nextGuardian,
        guardian2Id: null,
        active: 'Y',
        isDeleted: false,
      },
    });
    await act(async () => {
      tree.update(screen(nextPatient, nextGuardian, nextUser));
    });
    expect(guardianApi.getPatientGuardian).toHaveBeenCalledTimes(2);
    expect(tree.toJSON()).toEqual(expect.anything());
    expect(JSON.stringify(tree.toJSON())).toContain('NEXT GUARDIAN');
    await act(async () => {
      release(response());
    });
    expect(JSON.stringify(tree.toJSON())).toContain('NEXT GUARDIAN');
    expect(JSON.stringify(tree.toJSON())).not.toContain('TEST GUARDIAN');
    expect(guardianApi.updateGuardian).not.toHaveBeenCalled();
    expect(guardianApi.updatePrimaryAllocation).not.toHaveBeenCalled();
    act(() => tree.unmount());
  },
);

test('an old primary confirmation cannot act on a different route or reuse its displayed identity', async () => {
  const account = { id: 'TEST-ACTOR', roleName: 'SUPERVISOR' };
  const both = response();
  both.data.patient_guardians.unshift({
    patient_guardian: { ...guardian, id: 1 },
    relationshipName: 'Child',
  });
  guardianApi.getPatientGuardian.mockResolvedValue(both);
  const screen = (patientID, guardianID) => (
    <AuthContext.Provider value={{ user: account }}>
      <EditPatientGuardianScreen
        route={{ params: { patientID, guardianProfile: { guardianID } } }}
      />
    </AuthContext.Provider>
  );
  let tree;
  await act(async () => {
    tree = create(screen(7, 2));
  });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-primary', disabled: false })
      .props.onPress(),
  );
  const oldConfirm = Alert.alert.mock.calls.find(
    (call) => call[0] === 'Change primary guardian',
  )[2][1].onPress;
  let release;
  guardianApi.getPatientGuardian.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  await act(async () => {
    tree.update(screen(8, 4));
  });
  expect(
    tree.root.findAllByProps({ testID: 'guardian-edit-primary' }),
  ).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).not.toContain('TEST GUARDIAN');
  await act(async () => oldConfirm());
  expect(guardianApi.updatePrimaryAllocation).not.toHaveBeenCalled();
  guardianApi.getPatientAllocation.mockResolvedValue({
    ok: true,
    data: {
      id: 5,
      patientId: 8,
      guardianId: 3,
      guardian2Id: 4,
      active: 'Y',
      isDeleted: false,
    },
  });
  await act(async () =>
    release({
      ok: true,
      data: {
        patient: { id: 8 },
        patient_guardians: [3, 4].map((id) => ({
          patient_guardian: { ...guardian, id, firstName: 'NEXT' },
          relationshipName: 'Child',
        })),
      },
    }),
  );
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-primary', disabled: false })
      .props.onPress(),
  );
  expect(
    Alert.alert.mock.calls
      .filter((call) => call[0] === 'Change primary guardian')
      .pop()[1],
  ).toContain('NEXT GUARDIAN');
  expect(guardianApi.updatePrimaryAllocation).not.toHaveBeenCalled();
  act(() => tree.unmount());
});
test('the actual form edits relationship and verifies the persisted read using the current actor', async () => {
  const tree = await render();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-relationshipName' })
      .props.onChangeText('Sibling'),
  );
  guardianApi.getPatientGuardian
    .mockResolvedValueOnce(response())
    .mockResolvedValueOnce(response('Sibling'));
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: false })
      .props.onPress(),
  );
  expect(guardianApi.updateGuardian).toHaveBeenCalledWith(
    expect.objectContaining({
      relationshipName: 'Sibling',
      ModifiedById: 'TEST-ACTOR',
      guardianApplicationUserId: 'TEST-LINK',
      nric: 'TEST ID',
    }),
    2,
  );
  expect(Alert.alert).toHaveBeenCalledWith(
    'Saved successfully',
    expect.stringContaining('verified'),
    expect.any(Array),
  );
  tree.unmount();
});
test('a failed post-write read cannot display success and prevents blind repeat submission', async () => {
  const tree = await render();
  guardianApi.getPatientGuardian
    .mockResolvedValueOnce(response())
    .mockResolvedValueOnce({ ok: false, status: 500 });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: false })
      .props.onPress(),
  );
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(
    tree.root.findByProps({ testID: 'guardian-edit-error' }).props.children,
  ).toContain('partially completed');
  expect(
    tree.root.findByProps({ testID: 'guardian-edit-save', disabled: true }),
  ).toBeTruthy();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: true })
      .props.onPress(),
  );
  expect(guardianApi.updateGuardian).toHaveBeenCalledTimes(1);
  tree.unmount();
});
test('caregivers can edit relationships but have no primary-guardian allocation control', async () => {
  const tree = await render('CAREGIVER');
  expect(
    tree.root.findAllByProps({ testID: 'guardian-edit-primary' }),
  ).toHaveLength(0);
  expect(guardianApi.getPatientAllocation).not.toHaveBeenCalled();
  tree.unmount();
});
test('doctor role does not load or mutate guardian editing data', async () => {
  const tree = await render('DOCTOR');
  expect(guardianApi.getPatientGuardian).not.toHaveBeenCalled();
  expect(guardianApi.updateGuardian).not.toHaveBeenCalled();
  tree.unmount();
});

test('uppercase guardian persistence verification accepts the canonical address read back', async () => {
  const tree = await render();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-address' })
      .props.onChangeText('new synthetic road'),
  );
  guardianApi.getPatientGuardian
    .mockResolvedValueOnce(response())
    .mockResolvedValueOnce({
      ...response(),
      data: {
        ...response().data,
        patient_guardians: [
          {
            patient_guardian: { ...guardian, address: 'NEW SYNTHETIC ROAD' },
            relationshipName: 'Child',
          },
        ],
      },
    });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: false })
      .props.onPress(),
  );
  expect(guardianApi.updateGuardian).toHaveBeenCalledWith(
    expect.objectContaining({
      address: 'NEW SYNTHETIC ROAD',
      nric: guardian.nric,
      guardianApplicationUserId: guardian.guardianApplicationUserId,
      ModifiedById: 'TEST-ACTOR',
    }),
    2,
  );
  expect(Alert.alert).toHaveBeenCalledWith(
    'Saved successfully',
    expect.stringContaining('verified'),
    expect.any(Array),
  );
  tree.unmount();
});

test('a successful guardian read with the wrong address remains uncertain and blocks replay', async () => {
  const tree = await render();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-address' })
      .props.onChangeText('expected synthetic street'),
  );
  guardianApi.getPatientGuardian
    .mockResolvedValueOnce(response())
    .mockResolvedValueOnce({
      ...response(),
      data: {
        ...response().data,
        patient_guardians: [
          {
            patient_guardian: {
              ...guardian,
              address: 'GENUINELY DIFFERENT STREET',
            },
            relationshipName: 'Child',
          },
        ],
      },
    });
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: false })
      .props.onPress(),
  );
  expect(guardianApi.updateGuardian).toHaveBeenCalledWith(
    expect.objectContaining({ address: 'EXPECTED SYNTHETIC STREET' }),
    2,
  );
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(
    tree.root.findByProps({ testID: 'guardian-edit-error' }).props.children,
  ).toContain('partially completed');
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-save', disabled: true })
      .props.onPress(),
  );
  expect(guardianApi.updateGuardian).toHaveBeenCalledTimes(1);
  tree.unmount();
});

test('primary confirmation cancellation sends nothing; confirmation sends one narrow PUT and verifies both slots', async () => {
  const both = response();
  both.data.patient_guardians.unshift({
    patient_guardian: { ...guardian, id: 1 },
    relationshipName: 'Child',
  });
  guardianApi.getPatientGuardian.mockResolvedValue(both);
  guardianApi.updatePrimaryAllocation.mockImplementation(
    async (id, payload) => {
      guardianApi.getPatientAllocation.mockResolvedValue({
        ok: true,
        data: { id: 3, active: 'Y', isDeleted: false, ...payload },
      });
      return { ok: true };
    },
  );
  const tree = await render();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-primary', disabled: false })
      .props.onPress(),
  );
  const confirmation = Alert.alert.mock.calls.find(
    (call) => call[0] === 'Change primary guardian',
  )[2];
  expect(confirmation[0].text).toBe('Cancel');
  expect(guardianApi.updatePrimaryAllocation).not.toHaveBeenCalled();
  await act(async () => confirmation[1].onPress());
  expect(guardianApi.updatePrimaryAllocation).toHaveBeenCalledWith(3, {
    patientId: 7,
    guardianId: 2,
    guardian2Id: 1,
    ModifiedById: 'TEST-ACTOR',
  });
  expect(guardianApi.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Saved successfully',
    expect.stringContaining('Both primary and secondary'),
    expect.any(Array),
  );
  tree.unmount();
});

test('unknown primary outcome offers a read-only check and blocks another confirmed write', async () => {
  const both = response();
  both.data.patient_guardians.unshift({
    patient_guardian: { ...guardian, id: 1 },
    relationshipName: 'Child',
  });
  guardianApi.getPatientGuardian.mockResolvedValue(both);
  const tree = await render();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-edit-primary', disabled: false })
      .props.onPress(),
  );
  const confirm = Alert.alert.mock.calls.find(
    (call) => call[0] === 'Change primary guardian',
  )[2][1].onPress;
  await act(async () => confirm());
  expect(
    tree.root.findByProps({
      testID: 'guardian-primary-check',
      disabled: false,
    }),
  ).toBeTruthy();
  await act(async () =>
    tree.root
      .findByProps({ testID: 'guardian-primary-check', disabled: false })
      .props.onPress(),
  );
  await act(async () => confirm());
  expect(guardianApi.updatePrimaryAllocation).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findByProps({ testID: 'guardian-edit-error' }).props.children,
  ).toContain('unknown');
  tree.unmount();
});
