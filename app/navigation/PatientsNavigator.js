import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientsScreen from 'app/screens/PatientsScreen';
import PatientProfile from 'app/screens/PatientProfileScreen';
import PatientInformationAccordion from 'app/components/PatientInformationAccordion';

// Import Constants from routes
import routes from 'app/navigation/routes';
import PatientMedicalHistoryScreen from 'app/screens/PatientMedicalHistoryScreen';
import PatientAllergyScreen from 'app/screens/PatientAllergyScreen';
import PatientHolidayScreen from 'app/screens/PatientHolidayScreen';
import PatientPhotoAlbumScreen from 'app/screens/PatientPhotoAlbumScreen';
import ActivityPreferenceScreen from 'app/screens/ActivityPreferenceScreen';
import PatientPrescriptionScreen from 'app/screens/PatientPrescriptionScreen';
import PatientProblemLog from 'app/screens/PatientProblemLogScreen';
import PatientVitalScreen from 'app/screens/PatientVitalScreen';
import PatientRoutineScreen from 'app/screens/PatientRoutineScreen';
import PatientAddScreen from 'app/screens/PatientAddScreen';
import EditPatientInfoScreen from 'app/screens/EditPatientInfoScreen';
import EditPatientPreferencesScreen from 'app/screens/EditPatientPreferencesScreen';
import EditPatientGuardianScreen from 'app/screens/EditPatientGuardianScreen';
import EditPatientSocialHistScreen from 'app/screens/EditPatientSocialHistScreen';
import PatientMedicationScreen from 'app/screens/PatientMedicationScreen';
import PatientScheduleScreen from 'app/screens/PatientScheduleScreen';
import PatientMobilityAidScreen from 'app/screens/PatientMobilityAidsScreen';
import DoctorNoteScreen from 'app/screens/DoctorNoteScreen';

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
        component={PatientInformationAccordion}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Patient Particulars',
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
        name={routes.ACTIVITY_PREFERENCE}
        component={ActivityPreferenceScreen}
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
          title: 'Mobility Aid',
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
      <Stack.Screen
        name={routes.DOCTORNOTE_SCREEN}
        component={DoctorNoteScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          title: 'Doctor Note',
        }}
      />
    </Stack.Navigator>
  );
}

export default PatientsNavigator;
