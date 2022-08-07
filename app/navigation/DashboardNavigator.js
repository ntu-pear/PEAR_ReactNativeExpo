import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";

// Import Constants from Routes
import routes from "./routes";

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
const DashboardNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={routes.DASHBOARD_SCREEN} component={DashboardScreen} />
  </Stack.Navigator>
);

export default DashboardNavigator;
