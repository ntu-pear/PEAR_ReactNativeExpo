import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';
// Import Constants
import routes from 'app/navigation/routes';
import DashboardNavigator from 'app/navigation/DashboardNavigator';
import PatientsNavigator from 'app/navigation/PatientsNavigator';
import ConfigNavigator from 'app/navigation/ConfigNavigator';
import AccountNavigator from 'app/navigation/AccountNavigator';
import NotificationNavigator from 'app/navigation/NotificationNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

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
  if (routeName === routes.NOTIFICATION_APPROVAL_REQUEST) {
    return { display: 'none' };
  }
  // Continue to include other routes here if hiding bottom tab is required
  return;
}

// Refer to this for configuration: https://reactnavigation.org/docs/bottom-tab-navigator
function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        // tabBarInactiveTintColor: colors.black_var1,
      }}
    >
      <Tab.Screen
        name={routes.DASHBOARD}
        component={DashboardNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="notebook-outline"
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
          tabBarStyle: hideBottomTabOnSpecificRoute(route),
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={routes.CONFIG}
        component={ConfigNavigator}
        options={{
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
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default AppNavigator;
