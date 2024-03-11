/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from 'app/screens/DashboardScreen';
import PatientProfile from 'app/screens/PatientProfileScreen';
import PatientInformationScreen from 'app/screens/PatientInformationScreen';
import PatientMedicalHistoryScreen from 'app/screens/PatientMedicalHistoryScreen';
import PatientAllergyScreen from 'app/screens/PatientAllergyScreen';
import PatientHolidayScreen from 'app/screens/PatientHolidayScreen';
import PatientPhotoAlbumScreen from 'app/screens/PatientPhotoAlbumScreen';
import PatientPreferenceScreen from 'app/screens/PatientPreferenceScreen';
import PatientPrescriptionScreen from 'app/screens/PatientPrescriptionScreen';
import PatientProblemLog from 'app/screens/PatientProblemLog';
import PatientVitalScreen from 'app/screens/PatientVitalScreen';
import PatientRoutineScreen from 'app/screens/PatientRoutineScreen';
import MessageDisplayCard from 'app/components/MessageDisplayCard';

// Import Constants from Routes
import routes from 'app/navigation/routes';
import { Image, Row } from 'native-base';
import { TouchableOpacity, Text } from 'react-native';
import ActivityFilterCard from 'app/components/ActivityFilterCard';
import dashboardApi from 'app/api/dashboard';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardNavigator() {
  const [highlightsModalVisible, setHighlightsModalVisible] = useState(true);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.DASHBOARD_SCREEN}
        component={DashboardScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setHighlightsModalVisible(!highlightsModalVisible)}
              testID={'highlightsButton'}
            >
              <Image
                alt={'daily-highlights'}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
                }}
                size={'25px'}
              />
              <PatientDailyHighlights
                modalVisible={highlightsModalVisible}
                setModalVisible={setHighlightsModalVisible}
              />
            </TouchableOpacity>
          ),
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
    </Stack.Navigator>
  );
}

export default DashboardNavigator;
