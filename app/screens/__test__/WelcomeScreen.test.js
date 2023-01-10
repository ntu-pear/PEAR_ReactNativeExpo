/**
 * @jest-environment node
 */
import {
  cleanup,
  render,
  screen,
  fireEvent,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import WelcomeScreen from 'app/screens/WelcomeScreen';
import '@testing-library/jest-native/extend-expect';
import errors from 'app/config/errors';
import { act } from 'react-test-renderer';

jest.mock('../../hooks/useApiHandler');
// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
afterEach(cleanup);
describe('Test Login', () => {
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
    act(() => {
      fireEvent.changeText(emailInput, 'wronguser');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);
    });
    // without the timeout the test framework can't find the error on the screen
    // since it's an asynchronous process to query the login api with the username
    // and password and re-render the UI
    expect(
      await screen.findByText(
        errors.loginError,
        { exact: false },
        { timeout: 10000 },
      ),
    ).not.toBeNull();
  });
});
