import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
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
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const [patientProfile, setPatientProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPatient(route.params.patientProfile.patientID);
    setIsLoading(false);
  }, [route.params.patientProfile.patientID]);

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

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  //   const handleProfileButton = () => {
  //     console.log("tesitn profile");
  //     console.log(patientProfile);
  //   };

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
              display: 'flex',
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
                style={{ flex: 2 }}
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
                      routes={routes.PATIENT_ACTIVITY_PREFERENCE}
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
                      text="Activity"
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
            </VStack>
          </ScrollView>
        </Center>
      )}
    </>
  );
}

export default PatientProfileScreen;
