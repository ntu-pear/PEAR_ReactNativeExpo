import React from "react";
// Import Constants from routes
import routes from "./routes";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConfigScreen from "../screens/ConfigScreen";

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
const ConfigNavigator = () => (
  <Stack.Navigator
  screenOptions={{
    headerShown: false,
  }}>
    <Stack.Screen name={routes.CONFIG_SCREEN} component={ConfigScreen} />
  </Stack.Navigator>
);

export default ConfigNavigator;
