import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import AuthContext from 'app/auth/context';
import AppButton from 'app/components/AppButton';
import authStorage from 'app/auth/authStorage';

function AccountScreen() {
  const { user, setUser } = useContext(AuthContext);

  const onPressLogOut = async () => {
    setUser(null);
    await authStorage.removeToken();
  };

  return (
    <View>
      <Text>This is my accountscreen</Text>
      <Text>{user.sub}</Text>
      <AppButton title="Logout" color="red" onPress={onPressLogOut} />
    </View>
  );
}

export default AccountScreen;
