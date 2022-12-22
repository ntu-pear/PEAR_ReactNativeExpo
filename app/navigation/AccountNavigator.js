import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from 'app/screens/AccountScreen';
import AccountDetailScreen from 'app/screens/AccountDetailScreen';
import AboutScreen from 'app/screens/AboutScreen';
// Import Constants from routes
import routes from 'app/navigation/routes';
import SettingsScreen from 'app/screens/SettingsScreen';
import EditAccountScreen from 'app/screens/EditAccountScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function AccountNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.ACCOUNT}
        component={AccountScreen}
        options={{
          headerShown: true,
          title: 'Account',
        }}
      />
      <Stack.Screen
        name={routes.ACCOUNT_DETAIL}
        component={AccountDetailScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Account Details',
        }}
      />
      <Stack.Screen
        name={routes.ACCOUNT_EDIT}
        component={EditAccountScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Account',
        }}
      />
      <Stack.Screen
        name={routes.ABOUT}
        component={AboutScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'About',
        }}
      />
      <Stack.Screen
        name={routes.SETTINGS}
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}

export default AccountNavigator;
