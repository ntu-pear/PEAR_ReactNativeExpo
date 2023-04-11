/**
 * @jest-environment node
 */
import {
  render,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import AccountViewScreen from 'app/screens/AccountViewScreen';
import '@testing-library/jest-native/extend-expect';
import routes from 'app/navigation/routes';

const mockedParams = {
  route: {
    params: {
      address: '521 Woodlands Dr14 #02-343, 730521 Singapore, Singapore',
      contactNo: '87654321',
      createdDateTime: '2023-01-26T02:09:37.717625',
      dob: '1980-01-01T00:00:00',
      email: 'jess@gmail.com',
      firstName: 'Jessica',
      gender: 'F',
      isActive: true,
      isDeleted: false,
      lastName: 'Sim',
      loginTimeStamp: '2023-03-17T20:25:21.1331954',
      nric: 'Sxxxx781F',
      preferredName: 'Jess',
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1681207517/User/Jessica_Sim_Sxxxx781F/ProfilePicture/txd37slz5amwsz7rdxfk.png',
      role: 'Supervisor',
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    },
  },
};

const createTestProps = () => ({
  navigation: {
    push: jest.fn(),
  },
  ...mockedParams,
});

// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const renderScreen = () => {
  this.props = createTestProps({});
  return render(
    <NativeBaseProvider initialWindowMetrics={inset}>
      <AccountViewScreen {...this.props} />
    </NativeBaseProvider>,
  );
};

describe('Test View Profile Information', () => {
  test('Should navigate to Edit Profile Information Screen upon clicking button', async () => {
    const accountViewScreen = renderScreen();
    const iconButton = accountViewScreen.getByTestId('iconButton');
    expect(iconButton).toBeVisible();
    fireEvent.press(iconButton);

    await waitFor(() => {
      expect(this.props.navigation.push).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.push).toHaveBeenCalledWith(
        routes.ACCOUNT_EDIT,
        {
          ...mockedParams.route.params,
        },
      );
    });
  });
});
