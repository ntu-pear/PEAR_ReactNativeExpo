import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PatientsScreen from "../screens/PatientsScreen";
import PatientProfile from "../screens/PatientProfileScreen";
import PatientInformationScreen from "../screens/PatientInformationScreen";

// Import Constants from routes
import routes from "./routes";
import PatientActivityPreferenceScreen from "../screens/PatientActivityPreferenceScreen";
import PatientAllergyScreen from "../screens/PatientAllergyScreen";
import PatientHolidayScreen from "../screens/PatientHolidayScreen";
import PatientPhotoAlbumScreen from "../screens/PatientPhotoAlbumScreen";
import PatientPreferenceScreen from "../screens/PatientPreferenceScreen";
import PatientPrescriptionScreen from "../screens/PatientPrescriptionScreen";
import PatientProblemLog from "../screens/PatientProblemLog";
import PatientVitalScreen from "../screens/PatientVitalScreen";
import PatientRoutineScreen from "../screens/PatientRoutineScreen";

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
    <Stack.Screen name={routes.PATIENT_ACTIVITY_PREFERENCE} component={PatientActivityPreferenceScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Activity Preference"
    }}/>
    <Stack.Screen name={routes.PATIENT_ALLERGY} component={PatientAllergyScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Allergy"
    }}/>
    <Stack.Screen name={routes.PATIENT_HOLIDAY} component={PatientHolidayScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Holiday"
    }}/>
    <Stack.Screen name={routes.PATIENT_PHOTO_ALBUM} component={PatientPhotoAlbumScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Photo Album"
    }}/>
    <Stack.Screen name={routes.PATIENT_PREFERENCE} component={PatientPreferenceScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Preference"
    }}/>
    <Stack.Screen name={routes.PATIENT_PRESCRIPTION} component={PatientPrescriptionScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Prescription"
    }}/>
    <Stack.Screen name={routes.PATIENT_PROBLEM_LOG} component={PatientProblemLog} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Problem Log"
    }}/>
    <Stack.Screen name={routes.PATIENT_VITAL} component={PatientVitalScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Vital"
    }}/>
    <Stack.Screen name={routes.PATIENT_ROUTINE} component={PatientRoutineScreen} 
    options={{
      headerShown: true,
      headerBackTitleVisible: false,
      title: "Routine"
    }}/>
  </Stack.Navigator>
);

export default PatientsNavigator;
