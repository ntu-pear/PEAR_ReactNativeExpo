import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from 'app/navigation/routes';
import ConfigScreen from 'app/screens/ConfigScreen';
import EmptyScreen from 'app/screens/EmptyScreen';
import AuthContext from 'app/auth/context';

const Stack = createNativeStackNavigator();

function ConfigNavigator() {
  const { user } = useContext(AuthContext) || {};
  const roleName = (user?.roleName || user?.role || '').toUpperCase();
  const isSupervisor = roleName === 'SUPERVISOR';

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={isSupervisor ? routes.CONFIG_SCREEN : routes.EMPTY_SCREEN}
        component={isSupervisor ? ConfigScreen : EmptyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default ConfigNavigator;
