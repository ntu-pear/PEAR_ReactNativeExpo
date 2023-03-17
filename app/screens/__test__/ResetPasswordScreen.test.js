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
import ResetPasswordScreen from 'app/screens/ResetPasswordScreen';
import '@testing-library/jest-native/extend-expect';
import user from 'app/api/user';
import { act } from 'react-test-renderer';
import { Alert } from 'react-native';

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  resetPassword: jest.fn(async (_email, _role) => ({
    ok: true,
  })),
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
});

describe('Test Reset Password', () => {
  test('Should show error when invalid email is entered', async () => {
    const resetPasswordScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <ResetPasswordScreen />
      </NativeBaseProvider>,
    );
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, 'wronguser');
    fireEvent.press(resetButton);

    expect(await screen.findByText('Invalid email address.')).toBeVisible();
  });

  test('Should show error when no email is entered', async () => {
    const resetPasswordScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <ResetPasswordScreen />
      </NativeBaseProvider>,
    );
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, '');
    fireEvent.press(resetButton);

    expect(await screen.findByText('Email is a required field.')).toBeVisible();
  });

  test('Should show alert upon successful reset', async () => {
    const resetPasswordScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <ResetPasswordScreen />
      </NativeBaseProvider>,
    );
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, 'jess@gmail.com');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(user.resetPassword).toBeCalledTimes(1);
      expect(user.resetPassword).toBeCalledWith('jess@gmail.com', 'Supervisor');
    });

    await waitFor(() => {
      expect(Alert.alert).toBeCalledTimes(1);
      expect(Alert.alert).toBeCalledWith(
        'Instructions to reset password have been sent to email.',
      );
    });
  });
});
