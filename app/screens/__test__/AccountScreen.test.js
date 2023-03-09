/**
 * @jest-environment node
 */
import AuthContext from 'app/auth/context';
import AccountScreen from 'app/screens/AccountScreen';
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';

const renderAccountScreen = () => {
  return render(
    <AuthContext.Provider
      value={{
        user: {
          sub: 'Jessica Sim',
        },
      }}
    >
      <AccountScreen />
    </AuthContext.Provider>,
  );
};

afterEach(cleanup);
describe('Testing Account Screen', () => {
  it('Account screen snapshot should match', () => {
    expect(renderAccountScreen().toJSON()).toMatchSnapshot();
  });
  it('Logout screen snapshot should match', () => {
    const accountScreen = renderAccountScreen();
    fireEvent.press(screen.getByText('Logout'));
    expect(accountScreen.toJSON()).toMatchSnapshot();
  });
});
