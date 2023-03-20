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

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  resetPassword: jest.fn(async (_email, _role) => ({
    ok: true,
  })),
}));
jest.setTimeout(10000);

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn(),
  },
  ...props,
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
      <ResetPasswordScreen {...this.props} />
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

  test('Should show alert upon successful reset', async () => {
    const resetPasswordScreen = renderScreen();
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

      expect(Alert.alert).toBeCalledTimes(1);
      expect(Alert.alert).toBeCalledWith(
        'Instructions to reset password have been sent to email.',
      );

      expect(this.props.navigation.navigate).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.navigate).toHaveBeenCalledWith(
        routes.WELCOME,
      );
    });
  });
});
