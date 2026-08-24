// Base
import React from 'react';
import { Platform } from 'react-native';
import { View } from 'native-base';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';
// Navigations
import routes from 'app/navigation/routes';
import DashboardNavigator from 'app/navigation/DashboardNavigator';
import PatientsNavigator from 'app/navigation/PatientsNavigator';
import ConfigNavigator from 'app/navigation/ConfigNavigator';
import AccountNavigator from 'app/navigation/AccountNavigator';
import NotificationNavigator from 'app/navigation/NotificationNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import useInactivityLogout from 'app/hooks/useInactivityLogout';

// Refer to this doc: https://reactnavigation.org/docs/tab-based-navigation
const Tab = createBottomTabNavigator();

/*
 * Purpose: Hides bottom tab on specific route
 * Reference:
 * (1) https://reactnavigation.org/docs/screen-options-resolution/#setting-parent-screen-options-based-on-child-navigators-state
 * (2) https://medium.com/@mspviraj/hide-bottom-tab-bar-on-a-specific-screen-in-react-navigation-6-0-26d31625d339
 */
function hideBottomTabOnSpecificRoute(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  if (
    routeName === routes.NOTIFICATION_APPROVAL_REQUEST ||
    routeName === routes.ACCOUNT_EDIT
  ) {
    return { display: 'none' };
  }
  // Continue to include other routes here if hiding bottom tab is required
  return;
}

// Tablet emulator 3-button / gesture nav sits under the default tab bar, so
// Notifications (and nearby tabs) were dispatching Android Home/Back.
const liftedTabBarStyle = {
  height: Platform.OS === 'android' ? 104 : 56,
  paddingBottom: Platform.OS === 'android' ? 40 : 0,
  paddingTop: Platform.OS === 'android' ? 8 : 0,
};

// Refer to this for configuration: https://reactnavigation.org/docs/bottom-tab-navigator
function AppNavigator() {
  const { panResponder } = useInactivityLogout();
  return (
    <View
      {...panResponder.panHandlers}
      style={{ height: '100%', width: '100%' }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.pink,
          tabBarStyle: liftedTabBarStyle,
        }}
      >
        <Tab.Screen
          name={routes.DASHBOARD}
          component={DashboardNavigator}
          options={{
            tabBarTestID: 'Dashboard_Tab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={routes.NOTIFICATION}
          component={NotificationNavigator}
          options={({ route }) => ({
            tabBarTestID: 'Notification_Tab',
            tabBarStyle: {
              ...liftedTabBarStyle,
              ...(hideBottomTabOnSpecificRoute(route) || {}),
            },
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bell-outline"
                color={color}
                size={size}
              />
            ),
          })}
        />
        <Tab.Screen
          name={routes.PATIENTS}
          component={PatientsNavigator}
          options={{
            tabBarTestID: 'Patients_Tab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-group-outline"
                color={color}
                size={size}
              />
            ),
          }}
          screenOptions={{ unmountOnBlur: true }}
        />
        <Tab.Screen
          name={routes.CONFIG}
          component={ConfigNavigator}
          options={{
            tabBarTestID: 'Config_Tab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cog-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={routes.ACCOUNT}
          component={AccountNavigator}
          options={({ route }) => ({
            unmountOnBlur: true,
            tabBarStyle: {
              ...liftedTabBarStyle,
              ...(hideBottomTabOnSpecificRoute(route) || {}),
            },
            tabBarTestID: 'Account_Tab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle-outline"
                color={color}
                size={size}
              />
            ),
          })}
        />
      </Tab.Navigator>
    </View>
  );
}

export default AppNavigator;
