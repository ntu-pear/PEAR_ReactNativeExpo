import AuthContext from 'app/auth/context';
import { create } from 'react-test-renderer';
import AccountScreen from 'app/screens/AccountScreen';

const customRender = (component) => {
  return create(
    <AuthContext.Provider
      value={{
        user: {
          sub: 'Jessica Sim',
        },
      }}
    >
      {component}
    </AuthContext.Provider>,
  );
};

describe('Testing Account Screen', () => {
  it('Should match snapshot', () => {
    const accountScreen = customRender(<AccountScreen />).toJSON();
    expect(accountScreen).toMatchSnapshot();
  });
});
