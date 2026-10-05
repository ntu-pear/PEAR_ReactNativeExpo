import React from 'react';
import { act, create } from 'react-test-renderer';
import WelcomeScreen from 'app/screens/WelcomeScreen';
import userApi from 'app/api/user';
import AuthContext from 'app/auth/context';

jest.mock('native-base', () => {
  const { View } = require('react-native');
  return { Center: View, Icon: View, Box: View };
});
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));
jest.mock('app/hooks/useApiHandler', () => () => ({}));
jest.mock('app/api/user', () => ({ loginUser: jest.fn(), getUser: jest.fn() }));
jest.mock('app/utility/patientDraft', () => ({
  clearDraft: jest.fn().mockResolvedValue(),
}));
jest.mock('app/components/input-components/InputField', () => 'InputField');
jest.mock(
  'app/components/input-components/SensitiveInputField',
  () => 'SensitiveInputField',
);
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => 'SelectionInputField',
);
jest.mock('app/components/AppButton', () => 'AppButton');
jest.mock('app/components/ErrorMessage', () => 'ErrorMessage');
jest.mock('app/components/LoadingWheel', () => 'LoadingWheel');

const mounted = [];
const setUser = jest.fn();
const mount = async (filled = true) => {
  let screen;
  await act(async () => {
    screen = create(
      <AuthContext.Provider value={{ setUser }}>
        <WelcomeScreen navigation={{ navigate: jest.fn() }} />
      </AuthContext.Provider>,
    );
  });
  mounted.push(screen);
  if (filled) {
    act(() => {
      screen.root
        .findByType('InputField')
        .props.onChangeText('test-user@example.invalid');
      screen.root
        .findByType('SensitiveInputField')
        .props.onChangeText('MOCK TEST VALUE');
    });
  }
  return screen;
};
const press = (screen) => screen.root.findByType('AppButton').props.onPress();
beforeEach(() => {
  jest.clearAllMocks();
  userApi.loginUser.mockReset().mockResolvedValue({ ok: true, status: 200 });
  userApi.getUser
    .mockReset()
    .mockResolvedValue({ ok: true, data: { id: 'TEST-CG-1' } });
});
afterEach(() => {
  mounted.splice(0).forEach((s) => act(() => s.unmount()));
  jest.useRealTimers();
});
test('empty fields are rejected locally without contacting the login service', async () => {
  const screen = await mount(false);
  await act(async () => press(screen));
  expect(userApi.loginUser).not.toHaveBeenCalled();
  expect(screen.root.findAllByType('ErrorMessage')).toHaveLength(1);
  expect(screen.root.findAllByType('LoadingWheel')).toHaveLength(0);
});
test('thrown login request settles the spinner and shows retry guidance', async () => {
  userApi.loginUser.mockRejectedValue(new Error('offline'));
  const screen = await mount();
  await act(async () => press(screen));
  expect(screen.root.findByType('ErrorMessage').props.message).toContain(
    'Check the VPN',
  );
  expect(screen.root.findAllByType('LoadingWheel')).toHaveLength(0);
  expect(setUser).not.toHaveBeenCalled();
});
test('an unsettled login request stops loading after the overall deadline', async () => {
  jest.useFakeTimers();
  userApi.loginUser.mockReturnValue(new Promise(() => {}));
  const screen = await mount();
  let pending;
  act(() => {
    pending = press(screen);
  });
  await act(async () => {
    jest.advanceTimersByTime(30000);
    await pending;
  });
  expect(screen.root.findAllByType('LoadingWheel')).toHaveLength(0);
  expect(screen.root.findAllByType('ErrorMessage')).toHaveLength(1);
});
test('profile failure cannot enter an authenticated session, and retry can succeed', async () => {
  userApi.getUser.mockResolvedValueOnce({ ok: false, status: 403 });
  const screen = await mount();
  await act(async () => press(screen));
  expect(setUser).not.toHaveBeenCalled();
  expect(screen.root.findAllByType('LoadingWheel')).toHaveLength(0);
  await act(async () => press(screen));
  expect(setUser).toHaveBeenCalledWith({ id: 'TEST-CG-1' });
  expect(screen.root.findAllByType('ErrorMessage')).toHaveLength(0);
});
