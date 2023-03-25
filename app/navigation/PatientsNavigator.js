import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientsScreen from 'app/screens/PatientsScreen';
import PatientProfile from 'app/screens/PatientProfileScreen';
import PatientInformationScreen from 'app/screens/PatientInformationScreen';

// Import Constants from routes
import routes from 'app/navigation/routes';
import PatientActivityPreferenceScreen from 'app/screens/PatientActivityPreferenceScreen';
import PatientAllergyScreen from 'app/screens/PatientAllergyScreen';
import PatientHolidayScreen from 'app/screens/PatientHolidayScreen';
import PatientPhotoAlbumScreen from 'app/screens/PatientPhotoAlbumScreen';
import PatientPreferenceScreen from 'app/screens/PatientPreferenceScreen';
import PatientPrescriptionScreen from 'app/screens/PatientPrescriptionScreen';
import PatientProblemLog from 'app/screens/PatientProblemLog';
import PatientVitalScreen from 'app/screens/PatientVitalScreen';
import PatientRoutineScreen from 'app/screens/PatientRoutineScreen';
import PatientAddScreen from 'app/screens/PatientAddScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function PatientsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.PATIENTS_SCREEN}
        component={PatientsScreen}
        options={{
          headerShown: true,
          title: 'Patients',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_PROFILE}
        component={PatientProfile}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Patient Profile',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_INFORMATION}
        component={PatientInformationScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Patient Information',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_ACTIVITY_PREFERENCE}
        component={PatientActivityPreferenceScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Activity Preference',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_ALLERGY}
        component={PatientAllergyScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Allergy',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_HOLIDAY}
        component={PatientHolidayScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Holiday',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_PHOTO_ALBUM}
        component={PatientPhotoAlbumScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Photo Album',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_PREFERENCE}
        component={PatientPreferenceScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Preference',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_PRESCRIPTION}
        component={PatientPrescriptionScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Prescription',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_PROBLEM_LOG}
        component={PatientProblemLog}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Problem Log',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_VITAL}
        component={PatientVitalScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Vital',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_ROUTINE}
        component={PatientRoutineScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Routine',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_ADD_PATIENT}
        component={PatientAddScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Add Patient',
        }}
      />
    </Stack.Navigator>
  );
}

export default PatientsNavigator;
