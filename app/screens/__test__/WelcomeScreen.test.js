/**
 * @jest-environment node
 */
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import WelcomeScreen from 'app/screens/WelcomeScreen';
import '@testing-library/jest-native/extend-expect';
import errors from 'app/config/errors';
import { act } from 'react-test-renderer';
import user from 'app/api/user';
import routes from 'app/navigation/routes';

jest.mock('../../hooks/useApiHandler');
jest.mock('../../api/user', () => ({
  loginUser: jest.fn(async (_email, _role, _password) => ({
    ok: false,
  })),
}));

const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn(),
  },
  ...props,
});

jest.setTimeout(10000);
// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
describe('Test Welcome Screen', () => {
  test('Wrong credentials', async () => {
    const welcomeScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <WelcomeScreen />
      </NativeBaseProvider>,
    );
    const emailInput = welcomeScreen.getByPlaceholderText('jess@gmail.com');
    const passwordInput = welcomeScreen.getByPlaceholderText('Password');
    const loginButton = welcomeScreen.getByText('Login');
    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
    expect(loginButton).toBeVisible();
    fireEvent.changeText(emailInput, 'wronguser');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);
    expect(user.loginUser).toBeCalledTimes(1);
    expect(user.loginUser).toBeCalledWith(
      'wronguser',
      'Supervisor',
      'wrongpassword',
    );
    // timeout is to buffer for re-rendering of component
    expect(
      await screen.findByText(
        errors.loginError,
        { exact: false },
        { timeout: 10000 },
      ),
    ).not.toBeNull();
  });

  test('should navigate to Reset Password Screen upon clicking Forgot Password?', async () => {
    this.props = createTestProps({});
    const welcomeScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <WelcomeScreen {...this.props} />
      </NativeBaseProvider>,
    );
    const forgotPassword = welcomeScreen.getByText('Forgot Password?');
    expect(forgotPassword).toBeVisible();
    fireEvent.press(forgotPassword);

    await waitFor(() => {
      expect(this.props.navigation.navigate).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.navigate).toHaveBeenCalledWith(
        routes.RESET_PASSWORD,
      );
    });
  });
});
