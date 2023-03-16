import React, { useState, useEffect } from 'react';
import { Center, VStack, HStack, ScrollView, View } from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';
import patientApi from 'app/api/patient';

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const [patientProfile, setPatientProfile] = useState({});

  useEffect(() => {
    if (route.params.patientProfile == null) {
      getPatient(route.params.id);
    } else {
      setPatientProfile(route.params.patientProfile);
    }
  }, [route.params.id, route.params.patientProfile]);

  const getPatient = async (id) => {
    // setIsLoading(true);
    // setIsError(false);
    const response = await patientApi.getPatient(id, true);
    if (!response.ok) {
      // console.log('Request failed with status code: ', response.status);
      // setIsLoading(false);
      // setIsError(true);
      // setStatusCode(response.status);
      return;
    }
    // setIsLoading(false);
    // setStatusCode(response.status);
    setPatientProfile(response.data.data);
    // console.log('Request successful with response: ', response);
  };

  //   const handleProfileButton = () => {
  //     console.log("tesitn profile");
  //     console.log(patientProfile);
  //   };

  return (
    <Center backgroundColor={colors.white_var1}>
      <ScrollView w="100%">
        <VStack justifyContent="center" alignItems="center" mb="5" w="100%">
          <View w="100%">
            <PatientInformationCard
              patientProfile={patientProfile}
              navigation={navigation}
              w="100%"
            />
          </View>

          <VStack space={2} ml="3%" mr="3%" mt="6">
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="allergy"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Allergy"
                navigation={navigation}
                routes={routes.PATIENT_ALLERGY}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Vital"
                navigation={navigation}
                routes={routes.PATIENT_VITAL}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5 name="pills" size={30} color={colors.pink} />
                }
                text="Prescription"
                navigation={navigation}
                routes={routes.PATIENT_PRESCRIPTION}
                patientProfile={patientProfile}
              />
            </HStack>
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={28}
                    color={colors.pink}
                  />
                }
                text="Problem Log"
                navigation={navigation}
                routes={routes.PATIENT_PROBLEM_LOG}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="clipboard-text"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Medical History"
                navigation={navigation}
                routes={routes.PATIENT_ACTIVITY_PREFERENCE}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5
                    name="calendar-day"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Activity"
                navigation={navigation}
                routes={routes.PATIENT_ROUTINE}
                patientProfile={patientProfile}
              />
            </HStack>
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="emoticon-happy"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Patient Preference"
                navigation={navigation}
                routes={routes.PATIENT_PREFERENCE}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialIcons
                    name="insert-photo"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Photo Album"
                navigation={navigation}
                routes={routes.PATIENT_PHOTO_ALBUM}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="umbrella-beach"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Holiday"
                navigation={navigation}
                routes={routes.PATIENT_HOLIDAY}
                patientProfile={patientProfile}
              />
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Center>
  );
}

export default PatientProfileScreen;
