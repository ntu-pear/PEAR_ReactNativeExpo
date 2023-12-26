import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Constants from routes
import routes from 'app/navigation/routes';
import PatientsScreen from 'app/screens/PatientsScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DebugNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="abc"
        component={PatientsScreen}
        options={{
          headerShown: true,
          title: 'Patients',
        }}
      />
    </Stack.Navigator>
  );
}

export default DebugNavigator;
