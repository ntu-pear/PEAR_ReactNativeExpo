import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from 'app/screens/AccountScreen';
import AccountViewScreen from 'app/screens/AccountViewScreen';
import AboutScreen from 'app/screens/AboutScreen';
// Import Constants from routes
import routes from 'app/navigation/routes';
import SettingsScreen from 'app/screens/SettingsScreen';
import AccountEditScreen from 'app/screens/AccountEditScreen';
import ChangePasswordScreen from 'app/screens/ChangePasswordScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function AccountNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.ACCOUNT_SCREEN}
        component={AccountScreen}
        options={{
          headerShown: true,
          title: 'Account',
        }}
      />
      <Stack.Screen
        name={routes.ACCOUNT_VIEW}
        component={AccountViewScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'View Personal Information',
        }}
      />
      <Stack.Screen
        name={routes.ACCOUNT_EDIT}
        component={AccountEditScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Personal Information',
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
      <Stack.Screen
        name={routes.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Change Password',
        }}
      />
    </Stack.Navigator>
  );
}

export default AccountNavigator;
