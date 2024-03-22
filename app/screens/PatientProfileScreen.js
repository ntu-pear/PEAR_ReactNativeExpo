// Libs
import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Center, VStack, HStack, ScrollView, View } from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';

// API
import patientApi from 'app/api/patient';
import doctorNoteApi from 'app/api/doctorNote';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';

// Config
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';

// Components
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import PatientInformationScreen from 'app/components/PatientInformationScreen';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const [patientProfile, setPatientProfile] = useState({});
  const [doctorsNoteData, setDoctorNoteData] = useState([]);
  const [guardianData, setGuardianData] = useState([]);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientID, setPatientID] = useState(route.params.id);

  useEffect(() => {
    // navigated from Highlights Modal or Dashboard Screen
    console.log('id', route.params.id);
    getPatient(route.params.id);
    retrieveDoctorsNote(route.params.id);
    retrieveGuardian(route.params.id);
    retrieveSocialHistory(route.params.id);
  }, [route.params.id, route.params.patientProfile]);

  // Retrieval of Patient Info, Doctor's Notes, Guardian Info and Social History
  const getPatient = async (id) => {
    setIsLoading(true);
    // setIsError(false);
    const response = await patientApi.getPatient(id, true);
    if (!response.ok) {
      // console.log('Request failed with status code: ', response.status);
      setIsLoading(false);
      // setIsError(true);
      // setStatusCode(response.status);
      return;
    }
    setIsLoading(false);
    // setStatusCode(response.status);
    setPatientProfile(response.data.data);
    // console.log('Request successful with response: ', response);
  };

  const retrieveDoctorsNote = async (id) => {
    const response = await doctorNoteApi.getDoctorNote(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setDoctorNoteData(response.data.data);
  };

  const retrieveGuardian = async (id) => {
    const response = await guardianApi.getPatientGuardian(id, false);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setGuardianData(response.data.data);
  };

  const retrieveSocialHistory = async (id) => {
    const response = await socialHistoryApi.getSocialHistory(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    if (response.data.data === null) {
      setSocialHistoryData([]);
    } else {
      setSocialHistoryData(response.data.data);
    }
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <Center backgroundColor={colors.white_var1} style={{ flex: 1 }}>
          <ScrollView
            w="100%"
            h="100%"
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: 'column',
            }}
          >
            <VStack
              justifyContent="center"
              alignItems="center"
              mb="5%"
              w="100%"
              h="100%"
              style={{ flex: 1 }}
            >
              <View w="100%" style={{ flex: 1 }}>
                <PatientInformationCard
                  patientProfile={patientProfile}
                  navigation={navigation}
                />
              </View>

              <VStack
                space={2}
                ml="3%"
                mr="3%"
                mt="6%"
                h="100%"
                style={{ flex: 1, height:500 }}
              >
                <HStack space={2} w="100%" h="30%">
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialCommunityIcons
                          name="allergy"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Allergy"
                      navigation={navigation}
                      routes={routes.PATIENT_ALLERGY}
                      patientProfile={patientProfile}
                      patientId={patientID}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialCommunityIcons
                          name="heart-pulse"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Vital"
                      navigation={navigation}
                      routes={routes.PATIENT_VITAL}
                      patientProfile={patientProfile}
                      patientId={patientID}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <FontAwesome5
                          name="pills"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Prescription"
                      navigation={navigation}
                      routes={routes.PATIENT_PRESCRIPTION}
                      patientProfile={patientProfile}
                    />
                  </View>
                </HStack>
                <HStack space={2} w="100%" h="30%">
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <FontAwesome5
                          name="exclamation-triangle"
                          size={SCREEN_HEIGHT * 0.035}
                          // style={{ size: "60%" }}
                          color={colors.pink}
                        />
                      }
                      text="Problem Log"
                      navigation={navigation}
                      routes={routes.PATIENT_PROBLEM_LOG}
                      patientProfile={patientProfile}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialCommunityIcons
                          name="clipboard-text"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Medical History"
                      navigation={navigation}
                      routes={routes.PATIENT_MEDICAL_HISTORY}
                      patientProfile={patientProfile}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <FontAwesome5
                          name="calendar-day"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Activity Routine"
                      navigation={navigation}
                      routes={routes.PATIENT_ROUTINE}
                      patientProfile={patientProfile}
                    />
                  </View>
                </HStack>
                <HStack space={2} w="100%" h="30%">
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialCommunityIcons
                          name="emoticon-happy"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Patient Preference"
                      navigation={navigation}
                      routes={routes.PATIENT_PREFERENCE}
                      patientProfile={patientProfile}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialIcons
                          name="insert-photo"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Photo Album"
                      navigation={navigation}
                      routes={routes.PATIENT_PHOTO_ALBUM}
                      patientProfile={patientProfile}
                    />
                  </View>
                  <View w="30%" h="100%">
                    <PatientProfileCard
                      vectorIconComponent={
                        <MaterialCommunityIcons
                          name="umbrella-beach"
                          size={SCREEN_HEIGHT * 0.04}
                          color={colors.pink}
                        />
                      }
                      text="Holiday"
                      navigation={navigation}
                      routes={routes.PATIENT_HOLIDAY}
                      patientProfile={patientProfile}
                    />
                  </View>
                </HStack>
              </VStack>
              <View w="100%" style={{flex: 1}}>
                <PatientInformationScreen 
                  patientID={patientID}
                  patientProfile={patientProfile}
                  guardianData={guardianData}
                  doctorsNoteData={doctorsNoteData}
                  socialHistoryData={socialHistoryData}
                />
              </View>
              
            </VStack>
          </ScrollView>
        </Center>
      )}
    </>
  );
}

export default PatientProfileScreen;
