import React from 'react';
import { act, create } from 'react-test-renderer';
import App from '../../../App';
const mockProtectedLoad = jest.fn();
let mockSetUser;
jest.mock('native-base', () => ({
  NativeBaseProvider: ({ children }) => children,
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  DefaultTheme: { colors: {} },
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ component, getComponent }) => {
      const Screen = component || getComponent();
      return <Screen />;
    },
  }),
}));
jest.mock('app/api/client', () => ({ setSessionExpiredHandler: jest.fn() }));
jest.mock('app/auth/authStorage', () => ({ removeToken: jest.fn() }));
jest.mock('app/utility/patientDraft', () => ({ clearDraft: jest.fn() }));
jest.mock('app/components/OfflineNotice', () => () => null);
jest.mock('app/navigation/AuthNavigator', () => () => {
  mockSetUser = require('react').useContext(
    require('app/auth/context').default,
  ).setUser;
  return null;
});
jest.mock('app/navigation/AppNavigator', () => {
  mockProtectedLoad();
  return { __esModule: true, default: () => null };
});
test('cold unauthenticated startup does not load protected screens; login loads the protected navigator on demand', async () => {
  let tree;
  await act(async () => {
    tree = create(<App />);
  });
  expect(mockProtectedLoad).not.toHaveBeenCalled();
  await act(async () =>
    mockSetUser({ id: 'TEST-SUP', roleName: 'SUPERVISOR' }),
  );
  expect(mockProtectedLoad).toHaveBeenCalledTimes(1);
  tree.unmount();
});
