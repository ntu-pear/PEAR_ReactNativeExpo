import React, { useState, useEffect } from 'react';
import { Image, VStack, AspectRatio, Center, ScrollView } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from 'app/navigation/routes';
import ConfigScreen from 'app/screens/ConfigScreen';
import EmptyScreen from 'app/screens/EmptyScreen';
import authStorage from 'app/auth/authStorage';
import ActivityIndicator from 'app/components/ActivityIndicator';

const Stack = createNativeStackNavigator();
const allowedRole = 'Supervisor';

function ConfigNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState({
    name: routes.EMPTY_SCREEN,
    component: EmptyScreen
  });

  useEffect(() => {
    async function fetchUser() {
      const user = await authStorage.getUser();

      if (user.role === allowedRole) {
        setScreen({
          name: routes.CONFIG_SCREEN,
          component: ConfigScreen
        });
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
        <Stack.Navigator>
          <Stack.Screen name={screen.name} component={screen.component} />
        </Stack.Navigator>
  );
}

export default ConfigNavigator;
