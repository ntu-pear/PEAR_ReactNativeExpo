/**
 * @jest-environment node
 */
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import AccountEditScreen from 'app/screens/AccountEditScreen';
import '@testing-library/jest-native/extend-expect';
import { Alert } from 'react-native';

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  updateUser: jest.fn(async (_preferredName, _contactNumber) => ({
    ok: true,
  })),
}));
jest.setTimeout(10000);

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

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
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1678789617/User/Jessica_Sim_Sxxxx781F/ProfilePicture/dvkpw0gsx8duekke7arq.png',
      role: 'Supervisor',
      userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
    },
  },
};

const createTestProps = () => ({
  navigation: {
    goBack: jest.fn(),
    navigate: jest.fn(),
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
      <AccountEditScreen {...this.props} />
    </NativeBaseProvider>,
  );
};

describe('Test Update Profile Information', () => {
  test('Edit account screen snapshot should match', () => {
    expect(renderScreen().toJSON()).toMatchSnapshot();
  });

  test('Should show error when invalid contact number is entered', async () => {
    const accountEditScreen = renderScreen();
    const preferredNameInput = accountEditScreen.getByPlaceholderText('Jess');
    const contactNumberInput =
    accountEditScreen.getByPlaceholderText('87654321');
    const saveButton = accountEditScreen.getByText('Save');
    const cancelButton = accountEditScreen.getByText('Cancel');
    expect(preferredNameInput).toBeVisible();
    expect(contactNumberInput).toBeVisible();
    expect(saveButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    fireEvent.changeText(contactNumberInput, '123');
    fireEvent.press(saveButton);

    expect(
      await screen.findByText(
        'Contact No. must start with the digit 6, 8 or 9, and must have 8 digits.',
      ),
    ).toBeVisible();
  });

  test('Should show error when compulsory fields are empty', async () => {
    const accountEditScreen = renderScreen();
    const preferredNameInput = accountEditScreen.getByPlaceholderText('Jess');
    const contactNumberInput =
    accountEditScreen.getByPlaceholderText('87654321');
    const saveButton = accountEditScreen.getByText('Save');
    const cancelButton = accountEditScreen.getByText('Cancel');
    expect(preferredNameInput).toBeVisible();
    expect(contactNumberInput).toBeVisible();
    expect(saveButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    fireEvent.changeText(preferredNameInput, '');
    fireEvent.changeText(contactNumberInput, '');
    fireEvent.press(saveButton);

    expect(
      await screen.findByText('Preferred Name is a required field.'),
    ).toBeVisible();
    expect(
      await screen.findByText('Contact No. is a required field.'),
    ).toBeVisible();
  });

  test('Should return to previous screen upon clicking on Cancel button', async () => {
    const accountEditScreen = renderScreen();

    const cancelButton = accountEditScreen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(this.props.navigation.goBack).toHaveBeenCalledTimes(1);
    });
  });
});
