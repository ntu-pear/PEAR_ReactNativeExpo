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
import { Alert } from 'react-native';
import routes from 'app/navigation/routes';

// mock reset password api
jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  resetPassword: jest.fn(async (_email, _role) => ({
    ok: true,
  })),
}));
jest.setTimeout(10000);

// mock Alert component
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// mock navigation prop
// https://stackoverflow.com/questions/52569447/how-to-mock-react-navigations-navigation-prop-for-unit-tests-with-typescript-in
const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn(),
  },
  ...props,
});
const props = createTestProps({});

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
      <ResetPasswordScreen {...props} />
    </NativeBaseProvider>,
  );
};

describe('Test Reset Password', () => {
  test('Should show error when invalid email is entered', async () => {
    const resetPasswordScreen = renderScreen();
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
    const resetPasswordScreen = renderScreen();
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, '');
    fireEvent.press(resetButton);

    expect(await screen.findByText('Email is a required field.')).toBeVisible();
  });

  test('Should show error from backend validation when incorrect email is entered', async () => {
    user.resetPassword.mockReturnValueOnce({
      ok: false,
      data: {
        message: 'Invalid user with role or user does not exist.',
      },
    });

    const resetPasswordScreen = renderScreen();
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, 'a@gmail.com');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(user.resetPassword).toBeCalledTimes(1);
      expect(user.resetPassword).toBeCalledWith('a@gmail.com', 'Supervisor');
    });

    expect(
      await screen.findByText('Invalid user with role or user does not exist.'),
    ).toBeVisible();
  });

  test('Should show alert upon successful reset', async () => {
    const resetPasswordScreen = renderScreen();
    const emailInput =
      resetPasswordScreen.getByPlaceholderText('jess@gmail.com');
    const role = resetPasswordScreen.getByPlaceholderText('Select role');
    const resetButton = resetPasswordScreen.getByText('Reset');
    expect(emailInput).toBeVisible();
    expect(role).toBeVisible();
    expect(resetButton).toBeVisible();
    fireEvent.changeText(emailInput, 'pearfyp2019email@gmail.com');
    fireEvent.press(role);
    fireEvent.press(screen.getByText('Doctor'));
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(user.resetPassword).toBeCalledTimes(1);
      expect(user.resetPassword).toBeCalledWith(
        'pearfyp2019email@gmail.com',
        'Doctor',
      );

      expect(Alert.alert).toBeCalledTimes(1);
      expect(Alert.alert).toBeCalledWith(
        'Instructions to reset password have been sent to email.',
      );

      expect(props.navigation.navigate).toHaveBeenCalledTimes(1);
      expect(props.navigation.navigate).toHaveBeenCalledWith(routes.WELCOME);
    });
  });
});
