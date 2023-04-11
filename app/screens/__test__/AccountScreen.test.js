/**
 * @jest-environment node
 */
import {
  render,
  cleanup,
  waitFor,
  fireEvent,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import AccountScreen from 'app/screens/AccountScreen';
import '@testing-library/jest-native/extend-expect';
import user from 'app/api/user';
import authStorage from 'app/auth/authStorage';
import { NavigationContext } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  getUser: jest.fn(),
}));
jest.setTimeout(10000);

jest.mock('../../auth/authStorage', () => ({
  getUser: jest.fn(),
}));

const createTestProps = (props) => ({
  navigation: {
    push: jest.fn(),
  },
  ...props,
});

jest.setTimeout(10000);

const mockUserData = [
  {
    address: '521 Woodlands Dr14 #02-343, 730521 Singapore, Singapore',
    contactNo: '94444444',
    createdDateTime: '2023-01-26T02:09:37.717625',
    dob: '1980-01-01T00:00:00',
    email: 'jess@gmail.com',
    firstName: 'Jessica',
    gender: 'F',
    isActive: true,
    isDeleted: false,
    lastName: 'Sim',
    loginTimeStamp: '2023-03-17T16:24:03.3703207',
    nric: 'Sxxxx781F',
    preferredName: 'newname',
    profilePicture:
      'https://res.cloudinary.com/dbpearfyp/image/upload/v1681207517/User/Jessica_Sim_Sxxxx781F/ProfilePicture/txd37slz5amwsz7rdxfk.png',
    role: 'Supervisor',
    userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
  },
];

// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// fake NavigationContext value data
// allows useFocusEffect to determine if component has been focused
const navContext = {
  isFocused: () => true,
  // addListener returns an unscubscribe function.
  addListener: jest.fn(() => jest.fn()),
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const renderScreen = () => {
  return render(
    <NativeBaseProvider initialWindowMetrics={inset}>
      <NavigationContext.Provider value={navContext}>
        <AuthContext.Provider
          value={{
            user: {
              userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
            },
          }}
        >
          <AccountScreen />
        </AuthContext.Provider>
      </NavigationContext.Provider>
    </NativeBaseProvider>,
  );
};

describe('Test Account Screen', () => {
  test('should show ActivityIndicator when loading', async () => {
    const accountScreen = renderScreen();
    await waitFor(() => {
      const activityIndicator = accountScreen.getByTestId('activityIndicator');
      expect(activityIndicator).toBeVisible();
    });
  });

  test('should display information after loading succeeds', async () => {
    authStorage.getUser.mockReturnValueOnce({
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    });
    user.getUser.mockReturnValueOnce({
      ok: true,
      data: { data: mockUserData },
    });

    const accountScreen = renderScreen();
    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledWith(
        'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      );

      const settings = accountScreen.getByText('Settings');
      const about = accountScreen.getByText('About');
      const logoutButton = accountScreen.getByText('Logout');
      const accountDetailCard = accountScreen.getByTestId('accountDetailCard');
      expect(settings).toBeVisible();
      expect(about).toBeVisible();
      expect(logoutButton).toBeVisible();
      expect(accountDetailCard).toBeVisible();
    });
  });

  test('should show ActivityIndicator when loading fails', async () => {
    authStorage.getUser.mockReturnValueOnce({
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    });
    user.getUser.mockReturnValueOnce({
      ok: false,
    });

    const accountScreen = renderScreen();
    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledWith(
        'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      );

      const activityIndicator = accountScreen.getByTestId('activityIndicator');
      expect(activityIndicator).toBeVisible();
    });
  });

  test('should navigate to About Screen upon clicking About', async () => {
    authStorage.getUser.mockReturnValueOnce({
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    });
    user.getUser.mockReturnValueOnce({
      ok: true,
      data: { data: mockUserData },
    });
    this.props = createTestProps({});
    const accountScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <AuthContext.Provider
            value={{
              user: {
                userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
              },
            }}
          >
            <AccountScreen {...this.props} />
          </AuthContext.Provider>
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledWith(
        'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      );

      const about = accountScreen.getByText('About');
      expect(about).toBeVisible();
      fireEvent.press(about);
    });

    await waitFor(() => {
      expect(this.props.navigation.push).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.push).toHaveBeenCalledWith(routes.ABOUT);
    });
  });

  test('should navigate to Settings Screen upon clicking Settings', async () => {
    authStorage.getUser.mockReturnValueOnce({
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    });
    user.getUser.mockReturnValueOnce({
      ok: true,
      data: { data: mockUserData },
    });
    this.props = createTestProps({});
    const accountScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <AuthContext.Provider
            value={{
              user: {
                userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
              },
            }}
          >
            <AccountScreen {...this.props} />
          </AuthContext.Provider>
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledTimes(1);
      expect(user.getUser).toBeCalledWith(
        'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      );

      const settings = accountScreen.getByText('Settings');
      expect(settings).toBeVisible();
      fireEvent.press(settings);
    });

    await waitFor(() => {
      expect(this.props.navigation.push).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.push).toHaveBeenCalledWith(routes.SETTINGS);
    });
  });
});
