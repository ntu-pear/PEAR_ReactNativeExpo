import React, { useContext } from 'react';
import authStorage from 'app/auth/authStorage';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import AuthContext from 'app/auth/context';
import { useGetPersonalDetails } from 'app/hooks/useGetPersonalDetails';
// import authStorage from 'app/auth/authStorage';

const getUserTokens = async () => {
  const accessToken1 = await authStorage.getToken('userAuthToken');
  const refreshToken1 = await authStorage.getToken('userRefreshToken');
  console.log(accessToken1);
  console.log(refreshToken1);
  // setUser(null);
  // await authStorage.removeToken();
  return;
};

function ConfigScreen() {
  const { setUser } = useContext(AuthContext);
  getUserTokens();
  // const { data, isError, isLoading } = useGetPersonalDetails('B22698B8-42A2-4115-9631-1C2D1E2AC5F2', false);
  // console.log(data);
  // setUser(null);
  return <MessageDisplayCard TextMessage={'Configuration Screen'} />;
}

export default ConfigScreen;
