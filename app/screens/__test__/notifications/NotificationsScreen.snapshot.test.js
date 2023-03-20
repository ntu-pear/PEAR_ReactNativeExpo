// Import the required dependencies
import React from 'react';
import { render } from '@testing-library/react-native';
import AuthContext from 'app/auth/context';
import { NativeBaseProvider } from 'native-base';
import NotificationsScreen from 'app/screens/notifications/NotificationsScreen';
import NotificationType from 'app/screens/notifications/NotificationType';
import useMockNotifications from 'app/screens/__test__/notifications/useMockNotifications';
import useNotifications from 'app/screens/notifications/useNotifications';

// Mock the useNotifications hook module
jest.mock('app/screens/notifications/useNotifications');
useNotifications.mockImplementation(useMockNotifications);

// Function to create the test props
const testProps = {
  navigation: {
    navigate: jest.fn(),
  },
  route: {
    params: {
      notificationType: NotificationType.Unread,
    },
  },
};

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

test('renders NotificationsScreen correctly', async () => {
  const { toJSON } = render(
    <AuthContext.Provider
      value={{
        user: {
          sub: 'Jessica Sim',
        },
        acceptRejectNotifID: null,
      }}
    >
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NotificationsScreen {...testProps} />
      </NativeBaseProvider>
    </AuthContext.Provider>,
  );
  // unable to solve the issue of waiting for the component to re-render
  // after data fetching before comparing snapshots, i.e.
  // snapshot is of an empty notifications list
  expect(toJSON()).toMatchSnapshot();
});
