/**
 * @jest-environment node
 */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import ChangePasswordScreen from 'app/screens/ChangePasswordScreen';
import '@testing-library/jest-native/extend-expect';
import user from 'app/api/user';
import authStorage from 'app/auth/authStorage';
import { Alert } from 'react-native';

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  changePassword: jest.fn(async (_email, _oldPassword, _newPassword) => ({
    ok: false,
    data: {
      message:
        'Please ensure that your new password have one uppercase, one lowercase and one non-alphanumeric.',
    },
  })),
}));

jest.mock('../../auth/authStorage', () => ({
  getUser: jest.fn(),
}));
jest.setTimeout(10000);

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

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
  return render(
    <NativeBaseProvider initialWindowMetrics={inset}>
      <ChangePasswordScreen />
    </NativeBaseProvider>,
  );
};

describe('Test Change Password', () => {
  test('Should show error when compulsory fields are empty', async () => {
    const changePasswordScreen = renderScreen();
    const oldPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter Old Password');
    const newPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter New Password');
    const confirmButton = changePasswordScreen.getByText('Confirm');
    expect(oldPasswordInput).toBeVisible();
    expect(newPasswordInput).toBeVisible();
    expect(confirmButton).toBeVisible();

    fireEvent.changeText(oldPasswordInput, '');
    fireEvent.changeText(newPasswordInput, '');
    fireEvent.press(confirmButton);

    expect(
      await screen.findByText('Old Password is a required field.'),
    ).toBeVisible();

    expect(
      await screen.findByText('New Password is a required field.'),
    ).toBeVisible();
  });

  // Only one case (new password does not match requirements) tested to show that error returned from api will be displayed
  test('Should show error from backend validation', async () => {
    authStorage.getUser.mockReturnValueOnce({
      email: 'jess@gmail.com',
    });

    const changePasswordScreen = renderScreen();
    const oldPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter Old Password');
    const newPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter New Password');
    const confirmButton = changePasswordScreen.getByText('Confirm');
    expect(oldPasswordInput).toBeVisible();
    expect(newPasswordInput).toBeVisible();
    expect(confirmButton).toBeVisible();
    fireEvent.changeText(oldPasswordInput, 'Supervisor!23');
    fireEvent.changeText(newPasswordInput, 'Supervisor');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.changePassword).toBeCalledTimes(1);
      expect(user.changePassword).toBeCalledWith(
        'jess@gmail.com',
        'Supervisor!23',
        'Supervisor',
      );
    });

    expect(
      await screen.findByText(
        'Please ensure that your new password have one uppercase, one lowercase and one non-alphanumeric.',
      ),
    ).toBeVisible();
  });

  test('Should show alert upon successful password change', async () => {
    authStorage.getUser.mockReturnValueOnce({
      email: 'jess@gmail.com',
    });
    user.changePassword.mockReturnValueOnce({
      ok: true,
    });

    const changePasswordScreen = renderScreen();
    const oldPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter Old Password');
    const newPasswordInput =
      changePasswordScreen.getByPlaceholderText('Enter New Password');
    const confirmButton = changePasswordScreen.getByText('Confirm');
    expect(oldPasswordInput).toBeVisible();
    expect(newPasswordInput).toBeVisible();
    expect(confirmButton).toBeVisible();
    fireEvent.changeText(oldPasswordInput, 'Supervisor!23');
    fireEvent.changeText(newPasswordInput, 'Supervisor123!');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(authStorage.getUser).toBeCalledTimes(1);
      expect(user.changePassword).toBeCalledTimes(1);
      expect(user.changePassword).toBeCalledWith(
        'jess@gmail.com',
        'Supervisor!23',
        'Supervisor123!',
      );

      expect(Alert.alert).toBeCalledTimes(1);
      expect(Alert.alert).toBeCalledWith(
        'Password changed successfully. Please login again.',
      );
    });
  });
});
