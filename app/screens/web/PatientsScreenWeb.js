import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Center,
  VStack,
  HStack,
  ScrollView,
  Fab,
  Icon,
  Stack,
  Divider,
  View,
} from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useNavigate } from 'react-router-dom';

import patientApi from 'app/api/patient';
import useCheckExpiredThenLogOut from 'app/hooks/useCheckExpiredThenLogOut';

import PatientScreenCard from 'app/components/PatientScreenCard';
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import ActivityIndicator from 'app/components/ActivityIndicator';

import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

function PatientsScreenWeb(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const [clickedPatientProfile, setPatientProfile] = useState();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation, sidebar } = props;

  // Refreshes every time the user navigates to PatientsScreen
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
      setIsLoading(true);
      const promiseFunction = async () => {
        const response = await getListOfPatients();
        setListOfPatients(response?.data.data);
        // initialize clicked patient as the first patient TODO: (yapsiang) error handling for no patient
        setPatientProfile(response?.data.data[0]);
      };
      promiseFunction();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const getListOfPatients = async () => {
    const response = await patientApi.getPatientList(null, true, true);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    setIsLoading(false);
    return response;
  };

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const handleFabOnPress = () => {
    if (Platform.OS === 'web') {
      navigate('/' + routes.PATIENT_ADD_PATIENT);
    } else {
      navigation.navigate(routes.PATIENT_ADD_PATIENT);
    }
  };

  const handlePatientScreenCardClick = (patientProfile, event) => {
    setPatientProfile(patientProfile);
  };

  return (
    <>
      {isLoading ? (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: sidebar ? '83vw' : '100vw',
          }}
        >
          <ActivityIndicator visible />
        </View>
      ) : (
        <HStack
          w={sidebar ? '84vw' : '99vw'}
          style={{ display: 'flex', flexDirection: 'row' }}
        >
          {/* PatientScreen */}
          <View>
            <Center backgroundColor={colors.white_var1}>
              <ScrollView h="100vh">
                <VStack paddingRight="10">
                  {listOfPatients
                    ? listOfPatients.map((item, index) => (
                        <PatientScreenCard
                          patientProfile={item}
                          key={index}
                          navigation={navigation}
                          onClick={(e) => handlePatientScreenCardClick(item, e)}
                        />
                      ))
                    : null}
                </VStack>
              </ScrollView>
              <Center position="absolute" bottom="8" right="1">
                <Fab
                  backgroundColor={colors.pink}
                  icon={
                    <Icon
                      as={MaterialIcons}
                      color={colors.white}
                      name="person-add-alt"
                      size="lg"
                      placement="bottom-right"
                    />
                  }
                  onPress={handleFabOnPress}
                  renderInPortal={false}
                  shadow={2}
                  size="sm"
                />
              </Center>{' '}
            </Center>
          </View>

          {/* PatientProfileScreen */}
          {/*
          This is exactly the same as PatientProfileScreen (mobile) except that it has flex 4,
          uses HStack instead of VStack and uses flex for styles.
           */}
          <Center
            backgroundColor={colors.white_var1}
            style={{ flex: 4, borderLeftWidth: 1 }}
          >
            <ScrollView
              w="100%"
              contentContainerStyle={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <VStack
                justifyContent="center"
                alignItems="center"
                mb="5"
                w="100%"
                style={{ flex: 1 }}
              >
                <View w="100%" style={{ flex: 3 }}>
                  <PatientInformationCard
                    patientProfile={clickedPatientProfile}
                    navigation={navigation}
                    w="100%"
                  />
                </View>

                <HStack
                  space={sidebar ? 3 : 6}
                  mx="3"
                  mt="6"
                  style={{ flex: 2 }}
                  flexWrap="wrap"
                >
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="allergy"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Allergy"
                    navigation={navigation}
                    routes={routes.PATIENT_ALLERGY}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="heart-pulse"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Vital"
                    navigation={navigation}
                    routes={routes.PATIENT_VITAL}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <FontAwesome5
                        name="pills"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Prescription"
                    navigation={navigation}
                    routes={routes.PATIENT_PRESCRIPTION}
                    patientProfile={clickedPatientProfile}
                  />
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
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="clipboard-text"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Medical History"
                    navigation={navigation}
                    routes={routes.PATIENT_ACTIVITY_PREFERENCE}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <FontAwesome5
                        name="calendar-day"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Activity"
                    navigation={navigation}
                    routes={routes.PATIENT_ROUTINE}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="emoticon-happy"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Patient Preference"
                    navigation={navigation}
                    routes={routes.PATIENT_PREFERENCE}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialIcons
                        name="insert-photo"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Photo Album"
                    navigation={navigation}
                    routes={routes.PATIENT_PHOTO_ALBUM}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="umbrella-beach"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Holiday"
                    navigation={navigation}
                    routes={routes.PATIENT_HOLIDAY}
                    patientProfile={clickedPatientProfile}
                  />
                </HStack>
              </VStack>
            </ScrollView>
          </Center>
        </HStack>
      )}
    </>
  );
}

export default PatientsScreenWeb;
