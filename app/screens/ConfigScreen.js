import React from 'react';
import authStorage from 'app/auth/authStorage';
import MessageDisplayCard from 'app/components/MessageDisplayCard';

const getUserTokens = async () => {
  const accessToken1 = await authStorage.getToken('userAuthToken');
  const refreshToken1 = await authStorage.getToken('userRefreshToken');
  console.log(accessToken1);
  console.log(refreshToken1);
  return;
};

function ConfigScreen() {
  getUserTokens();
  return <MessageDisplayCard TextMessage={'Configuration Screen'} />;
}

export default ConfigScreen;
