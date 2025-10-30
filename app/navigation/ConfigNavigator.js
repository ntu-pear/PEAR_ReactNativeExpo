import React, { useState, useEffect } from 'react';
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
  const [isSupervisor, setIsSupervisor] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await authStorage.getUser();
        
        if (user && user.role === allowedRole) {
          setIsSupervisor(true);
        } else {
          setIsSupervisor(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsSupervisor(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (isLoading) {
    return <ActivityIndicator visible />;
  }

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
