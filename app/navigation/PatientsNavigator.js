import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PatientsScreen from "../screens/PatientsScreen";
import PatientProfile from "../screens/PatientProfileScreen";
import PatientInformationScreen from "../screens/PatientInformationScreen";

// Import Constants from routes
import routes from "./routes";

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
const PatientsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={routes.PATIENTS_SCREEN} component={PatientsScreen} 
    options={{
      headerShown: true,
      title: "Patients"
    }}/>
    <Stack.Screen name={routes.PATIENT_PROFILE} component={PatientProfile} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Patient Profile"
    }}/>
    <Stack.Screen name={routes.PATIENT_INFORMATION} component={PatientInformationScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Patient Information"
    }}/>
  </Stack.Navigator>
);

export default PatientsNavigator;
