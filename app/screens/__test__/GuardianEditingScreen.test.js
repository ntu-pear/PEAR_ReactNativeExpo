import React from 'react';
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
