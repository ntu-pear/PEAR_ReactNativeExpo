import React from 'react';
// Import Constants from routes
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from './routes';
import ConfigScreen from '../screens/ConfigScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function ConfigNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={routes.CONFIG_SCREEN} component={ConfigScreen} />
    </Stack.Navigator>
  );
}

export default ConfigNavigator;
