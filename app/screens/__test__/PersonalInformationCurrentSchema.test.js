import React from 'react';
import { act, create } from 'react-test-renderer';
import AccountViewScreen from 'app/screens/AccountViewScreen';
import AuthContext from 'app/auth/context';
import userApi from 'app/api/user';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('native-base', () => {
  const View = require('react-native').View;
  return {
    Image: View,
    AspectRatio: View,
    ScrollView: View,
    Box: View,
    Pressable: View,
    Icon: View,
    Badge: View,
  };
});
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));
jest.mock('app/components/InformationCard', () => 'InformationCard');
jest.mock('app/components/AppButton', () => 'AppButton');
jest.mock('app/components/ActivityIndicator', () => 'ActivityIndicator');
jest.mock('app/api/user', () => ({
  getUser: jest.fn(),
  getProfilePicV1: jest.fn(),
}));
const profile = {
  id: 'actor1',
  roleName: 'SUPERVISOR',
  preferredName: 'QA',
  nric_FullName: 'QA Person',
  nric_DateOfBirth: '1980-01-01',
  nric_Gender: 'F',
  nric_Address: 'QA address',
  contactNo: '87654321',
};
let tree;
const navigation = { push: jest.fn(), navigate: jest.fn() };
const mount = async () => {
  await act(async () => {
    tree = create(
      <AuthContext.Provider value={{ user: { id: 'actor1' } }}>
        <AccountViewScreen navigation={navigation} />
      </AuthContext.Provider>,
    );
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  userApi.getUser.mockResolvedValue({ ok: true, status: 200, data: profile });
  userApi.getProfilePicV1.mockResolvedValue({ ok: false, status: 404 });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test('current v1 fields are displayed and original editable values reach editor', async () => {
  await mount();
  const c = tree.root.findByType('InformationCard');
  expect(c.props.displayData).toEqual(
    expect.arrayContaining([
      { label: 'Role', value: 'SUPERVISOR' },
      { label: 'Full Name', value: 'QA Person' },
      { label: 'DOB', value: '1980-01-01' },
      { label: 'Address', value: 'QA address' },
    ]),
  );
  act(() => c.props.handleOnPress());
  expect(navigation.push).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      id: 'actor1',
      preferredName: 'QA',
      contactNo: '87654321',
    }),
  );
});
test('profile failure settles loading and offers an explicit retry', async () => {
  userApi.getUser.mockResolvedValue({ ok: false, status: 503 });
  await mount();
  expect(tree.root.findAllByType('ActivityIndicator')).toHaveLength(0);
  expect(tree.root.findByType('AppButton').props.title).toBe(
    'Retry personal information',
  );
  expect(userApi.getProfilePicV1).not.toHaveBeenCalled();
});
test('another account response cannot populate the screen', async () => {
  userApi.getUser.mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...profile, id: 'other' },
  });
  await mount();
  expect(tree.root.findAllByType('InformationCard')).toHaveLength(0);
  expect(userApi.getProfilePicV1).not.toHaveBeenCalled();
});
test('late response after unmount is discarded', async () => {
  let resolve;
  userApi.getUser.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  await mount();
  act(() => tree.unmount());
  tree = null;
  await act(async () => resolve({ ok: true, status: 200, data: profile }));
});
