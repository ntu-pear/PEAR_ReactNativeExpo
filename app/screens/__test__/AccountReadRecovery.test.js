import React from 'react';
import { act, create } from 'react-test-renderer';
import AccountScreen from 'app/screens/AccountScreen';
import AuthContext from 'app/auth/context';
import userApi from 'app/api/user';
jest.mock('native-base', () => ({
  VStack: require('react-native').View,
  Box: require('react-native').View,
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: () => null }));
jest.mock('app/api/user', () => ({
  getUser: jest.fn(),
  logoutUser: jest.fn(),
}));
jest.mock('app/auth/authStorage', () => ({ removeToken: jest.fn() }));
jest.mock('app/utility/patientDraft', () => ({ clearDraft: jest.fn() }));
jest.mock('app/components/AccountCard', () => () => null);
jest.mock(
  'app/components/AppButton',
  () => (props) => require('react').createElement('MockButton', props),
);
jest.mock(
  'app/components/ProfileNameButton',
  () => (props) => require('react').createElement('MockProfile', props),
);
jest.mock(
  'app/components/ActivityIndicator',
  () => (props) => require('react').createElement('MockLoading', props),
);
let tree;
const setter = jest.fn();
const mount = async (
  user = {
    id: 'CaseActor',
    roleName: 'CAREGIVER',
    preferredName: 'Synthetic User',
  },
) => {
  await act(async () => {
    tree = create(
      <AuthContext.Provider value={{ user, setUser: setter }}>
        <AccountScreen navigation={{ push: jest.fn() }} />
      </AuthContext.Provider>,
    );
  });
  return tree;
};
beforeEach(() => {
  jest.clearAllMocks();
  userApi.getUser.mockResolvedValue({
    ok: true,
    data: {
      id: 'CaseActor',
      roleName: 'CAREGIVER',
      preferredName: 'Synthetic User',
    },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test('one focus read retains roleName and updates matched user', async () => {
  await mount();
  expect(userApi.getUser).toHaveBeenCalledTimes(1);
  expect(setter).toHaveBeenCalledTimes(1);
  expect(tree.root.findByType('MockProfile').props.profileLineTwo).toBe(
    'CAREGIVER',
  );
  expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
});
test.each([403, 500])(
  'read failure %s settles loading, retains account and allows one retry',
  async (status) => {
    userApi.getUser.mockResolvedValueOnce({ ok: false, status });
    await mount();
    expect(setter).not.toHaveBeenCalled();
    expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
    expect(tree.root.findByType('MockProfile').props.profileLineOne).toBe(
      'Synthetic User',
    );
    await act(async () =>
      tree.root
        .findAllByType('MockButton')
        .find((n) => n.props.title === 'Retry account')
        .props.onPress(),
    );
    expect(userApi.getUser).toHaveBeenCalledTimes(2);
    expect(setter).toHaveBeenCalledTimes(1);
  },
);
test('cross-user response cannot replace the signed-in identity', async () => {
  userApi.getUser.mockResolvedValue({
    ok: true,
    data: { id: 'OtherActor', roleName: 'SUPERVISOR' },
  });
  await mount();
  expect(setter).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'account_read_error' })).toBeDefined();
});
test('stale late response after blur/unmount cannot update auth state', async () => {
  let resolve;
  userApi.getUser.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  await mount();
  act(() => tree.unmount());
  tree = null;
  await act(async () => resolve({ ok: true, data: { id: 'CaseActor' } }));
  expect(setter).not.toHaveBeenCalled();
});
test('thrown adapter settles loading without clearing signed-in user', async () => {
  userApi.getUser.mockRejectedValue(new Error('Synthetic transport failure'));
  await mount();
  expect(tree.root.findByType('MockLoading').props.visible).toBe(false);
  expect(setter).not.toHaveBeenCalled();
});
