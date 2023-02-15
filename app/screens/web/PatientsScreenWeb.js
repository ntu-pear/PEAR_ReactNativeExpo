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
          w={sidebar ? '83vw' : '98vw'}
          style={{ display: 'flex', flexDirection: 'row' }}
        >
          {/* PatientScreen */}
          <View style={{ flex: 1 }}>
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
          <View backgroundColor={colors.white_var1} style={{ flex: 4 }}>
            <PatientInformationCard
              patientProfile={clickedPatientProfile}
              navigation={navigation}
            />
            <Divider />
            <VStack
            /* Reponsive design: https://docs.nativebase.io/responsive
          Note: These are the breakpoints
          breakpoints = {
            base: 0,
            sm: 480,
            md: 768,
            lg: 992,
            xl: 1280,
            };
          */
            // ml={{
            //   base: '3',
            //   sm: '15',
            //   md: '15',
            //   lg: '15',
            // }}
            // mt="2"
            // mb="4"
            >
              <Stack
                direction="row"
                mb="2.5"
                mt="1.5"
                space={4}
                flexWrap="wrap"
              >
                <PatientProfileCard
                  iconTop="4"
                  iconRight="2"
                  iconSize="100"
                  vectorIconComponent={
                    <MaterialCommunityIcons name="allergy" />
                  }
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Allergy"
                  navigation={navigation}
                  routes={routes.PATIENT_ALLERGY}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="0"
                  iconSize="100"
                  vectorIconComponent={<FontAwesome5 name="heartbeat" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Vital"
                  navigation={navigation}
                  routes={routes.PATIENT_VITAL}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="0"
                  iconSize="100"
                  vectorIconComponent={<FontAwesome5 name="smile-beam" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Patient Preference"
                  navigation={navigation}
                  routes={routes.PATIENT_PREFERENCE}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="-15"
                  iconSize="100"
                  vectorIconComponent={<FontAwesome5 name="clipboard-check" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Activity Preference"
                  navigation={navigation}
                  routes={routes.PATIENT_ACTIVITY_PREFERENCE}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="-10"
                  iconSize="100"
                  vectorIconComponent={<FontAwesome5 name="calendar-day" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Routine"
                  navigation={navigation}
                  routes={routes.PATIENT_ROUTINE}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="-0"
                  iconSize="100"
                  vectorIconComponent={<MaterialIcons name="insert-photo" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Photo Album"
                  navigation={navigation}
                  routes={routes.PATIENT_PHOTO_ALBUM}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="-2"
                  iconSize="100"
                  vectorIconComponent={<MaterialCommunityIcons name="pill" />}
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Prescription"
                  navigation={navigation}
                  routes={routes.PATIENT_PRESCRIPTION}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="1"
                  iconSize="100"
                  vectorIconComponent={
                    <MaterialCommunityIcons name="umbrella-beach" />
                  }
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Holiday"
                  navigation={navigation}
                  routes={routes.PATIENT_HOLIDAY}
                  patientProfile={clickedPatientProfile}
                />
                <PatientProfileCard
                  iconTop="4"
                  iconRight="-2"
                  iconSize="100"
                  vectorIconComponent={
                    <MaterialCommunityIcons name="note-text-outline" />
                  }
                  textMarginTop="5"
                  textMarginLeft="1"
                  text="Problem Log"
                  navigation={navigation}
                  routes={routes.PATIENT_PROBLEM_LOG}
                  patientProfile={clickedPatientProfile}
                />
              </Stack>
            </VStack>
            {/* <Divider /> */}
          </View>
        </HStack>
      )}
    </>
  );
}

export default PatientsScreenWeb;
