import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from 'app/screens/WelcomeScreen';
// Import Constants from routes
import routes from 'app/navigation/routes';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.WELCOME}
        component={WelcomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={routes.LOGIN}
        getComponent={() => require('app/screens/LoginScreen').default}
      />
      <Stack.Screen
        name={routes.REGISTER}
        getComponent={() => require('app/screens/RegisterScreen').default}
      />
      <Stack.Screen
        name={routes.RESET_PASSWORD}
        getComponent={() => require('app/screens/ResetPasswordScreen').default}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
