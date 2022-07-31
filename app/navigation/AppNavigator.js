import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Import Constants
import routes from "./routes";
import DashboardNavigator from "./DashboardNavigator";
import NotifcationsScreen from "../screens/NotifcationsScreen";
import PatientsNavigator from "./PatientsNavigator";
import ConfigNavigator from "./ConfigNavigator";
import AccountScreen from "../screens/AccountScreen";

// Refer to this doc: https://reactnavigation.org/docs/tab-based-navigation
const Tab = createBottomTabNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/bottom-tab-navigator
const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name={routes.DASHBOARD} component={DashboardNavigator} />
    <Tab.Screen
      name={routes.NOTIFICATION}
      component={NotifcationsScreen}
      options={{
        headerShown: true,
      }}
    />
    <Tab.Screen name={routes.PATIENTS} component={PatientsNavigator} />
    <Tab.Screen name={routes.CONFIG} component={ConfigNavigator} />
    <Tab.Screen
      name={routes.ACCOUNT}
      component={AccountScreen}
      options={{
        headerShown: true,
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
