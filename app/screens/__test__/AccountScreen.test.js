import AuthContext from 'app/auth/context';
import { create } from 'react-test-renderer';
import AccountScreen from 'app/screens/AccountScreen';

const customRender = (component) => {
  return create(
    <AuthContext.Provider
      value={{
        user: {
          aud: 'https://coremvc.fyp2017.com/',
          email: 'jess@gmail.com',
          exp: 1663242907,
          iat: 1663235707,
          iss: 'https://coremvc.fyp2017.com/',
          jti: 'f49487a7-9aea-4abe-a4cd-d306a98ffb05',
          nbf: 1663235697,
          role: 'Supervisor',
          sub: 'Jessica Sim',
          userID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
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
