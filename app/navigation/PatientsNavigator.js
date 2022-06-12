import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PatientsScreen from "../screens/PatientsScreen";

// Import Constants from routes
import routes from "./routes";

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
const PatientsNavigator = () => (
  <Stack.Navigator
  screenOptions={{
    headerShown: false,
  }}>
    <Stack.Screen name={routes.PATIENTS_SCREEN} component={PatientsScreen} />
  </Stack.Navigator>
);

export default PatientsNavigator;
