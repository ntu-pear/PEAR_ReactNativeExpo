import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Import Constants from routes
import routes from 'app/navigation/routes';
import PatientAddAllergyScreen from 'app/screens/PatientAddAllergyScreen';
import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import PatientAddScreen from 'app/screens/PatientAddScreen';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';
import AccountEditScreen from 'app/screens/AccountEditScreen';
import WelcomeScreen from 'app/screens/WelcomeScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DebugNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="xyz"
        component={PatientDailyHighlights}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default DebugNavigator;
