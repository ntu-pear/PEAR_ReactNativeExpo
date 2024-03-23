/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from 'app/screens/DashboardScreen';
import PatientProfile from 'app/screens/patient-profile/PatientProfileScreen';
import PatientInformationScreen from 'app/screens/patient-profile/PatientInformationScreen';
import PatientMedicalHistoryScreen from 'app/screens/patient-profile/PatientMedicalHistoryScreen';
import PatientAllergyScreen from 'app/screens/patient-profile/PatientAllergyScreen';
import PatientHolidayScreen from 'app/screens/patient-profile/PatientHolidayScreen';
import PatientPhotoAlbumScreen from 'app/screens/patient-profile/PatientPhotoAlbumScreen';
import PatientPreferenceScreen from 'app/screens/patient-profile/PatientPreferenceScreen';
import PatientPrescriptionScreen from 'app/screens/patient-profile/PatientPrescriptionScreen';
import PatientProblemLog from 'app/screens/patient-profile/PatientProblemLogScreen';
import PatientVitalScreen from 'app/screens/patient-profile/PatientVitalScreen';
import PatientRoutineScreen from 'app/screens/patient-profile/PatientRoutineScreen';
import MessageDisplayCard from 'app/components/MessageDisplayCard';

// Import Constants from Routes
import routes from 'app/navigation/routes';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';
import EditPatientSocialHistScreen from 'app/screens/patient-information/EditPatientSocialHistScreen';
import EditPatientGuardianScreen from 'app/screens/patient-information/EditPatientGuardianScreen';
import EditPatientPreferencesScreen from 'app/screens/patient-information/EditPatientPreferencesScreen';
import EditPatientInfoScreen from 'app/screens/patient-information/EditPatientInfoScreen';
import PatientMedicationScreen from 'app/screens/patient-profile/PatientMedicationScreen';
import PatientScheduleScreen from 'app/screens/patient-profile/PatientScheduleScreen';
import PatientMobilityAidScreen from 'app/screens/patient-profile/PatientMobilityAidsScreen';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.DASHBOARD_SCREEN}
        component={DashboardScreen}
        options={{
          headerRight: () => <PatientDailyHighlights />,
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
        name={routes.PATIENT_MEDICAL_HISTORY}
        component={PatientMedicalHistoryScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Medical History',
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
        name={routes.PATIENT_MEDICATION}
        component={PatientMedicationScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Medication',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_SCHEDULE}
        component={PatientScheduleScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Schedule',
        }}
      />
      <Stack.Screen
        name={routes.PATIENT_MOBILITY_AIDS}
        component={PatientMobilityAidScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Schedule',
        }}
      />
      <Stack.Screen
        name={routes.EDIT_PATIENT_INFO}
        component={EditPatientInfoScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Patient Info',
        }}
      />
      <Stack.Screen
        name={routes.EDIT_PATIENT_PREFERENCES}
        component={EditPatientPreferencesScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Patient Preferences',
        }}
      />
      <Stack.Screen
        name={routes.EDIT_PATIENT_GUARDIAN}
        component={EditPatientGuardianScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Patient Guardian',
        }}
      />
      <Stack.Screen
        name={routes.EDIT_PATIENT_SOCIALHIST}
        component={EditPatientSocialHistScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Edit Patient Social History',
        }}
      />
    </Stack.Navigator>
  );
}

export default DashboardNavigator;
