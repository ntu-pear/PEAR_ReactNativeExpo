import React, { useState, useEffect, useRef } from 'react';
import {
  Center,
  VStack,
  HStack,
  ScrollView,
  Fab,
  Icon,
  Content,
  FlatList,
  Stack,
  Divider,
  View,
} from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from '@expo/vector-icons';

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
  // TODO: (yapsiang) get list of patients using APIs
  const [listOfPatients, setListOfPatients] = useState([
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Tommy Lee',
        secondaryGuardianName: 'JanetTest LeeTest',
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 1,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 1,
        guardian2ID: 28,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 1,
      preferredLanguage: 'Cantonese',
      firstName: 'Alice',
      lastName: 'Lee',
      nric: 'Sxxxx922I',
      address: '73 Kampong Bahru Road 169373, Singapore',
      tempAddress: null,
      homeNo: '65123456',
      handphoneNo: '61234564',
      gender: 'F',
      dob: '0002-09-12T00:00:00',
      preferredName: 'Alice',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2020-05-04T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
    },
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Janet Lee',
        secondaryGuardianName: null,
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 2,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 2,
        guardian2ID: 0,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 2,
      preferredLanguage: 'English',
      firstName: 'Yan',
      lastName: 'Yi',
      nric: 'Sxxxx578A',
      address: null,
      tempAddress: null,
      homeNo: '66778888',
      handphoneNo: null,
      gender: 'M',
      dob: '0002-02-04T00:00:00',
      preferredName: 'Alex',
      privacyLevel: 1,
      updateBit: true,
      autoGame: true,
      startDate: '2002-02-02T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
    },
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Dawn Ong',
        secondaryGuardianName: 'Me Me',
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 3,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 3,
        guardian2ID: 29,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 3,
      preferredLanguage: 'English',
      firstName: 'Jon',
      lastName: 'Ong',
      nric: 'Sxxxx828C',
      address: 'Blk 3007 Ubi Rd 1 05-412, 406701, Singapore',
      tempAddress: null,
      homeNo: '67485000',
      handphoneNo: '67485000',
      gender: 'M',
      dob: '1933-04-02T00:00:00',
      preferredName: 'Jon',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2021-01-01T00:00:00',
      endDate: '2021-11-12T00:00:00',
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522355/Patient/Jon_Ong_Sxxxx300H/ProfilePicture/arkceots9px0niro7iwh.jpg',
    },
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Tommy Lee',
        secondaryGuardianName: 'Guardian of Bi Gong',
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 4,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 4,
        guardian2ID: 16,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 4,
      preferredLanguage: 'Hakka',
      firstName: 'Bi',
      lastName: 'Gong',
      nric: 'Sxxxx443F',
      address: '41 Sungei Kadut Loop S 729509, Singapore',
      tempAddress: '42 Sungei Kadut Loop S 729509, Singapore',
      homeNo: '98123123',
      handphoneNo: '98123133',
      gender: 'M',
      dob: '0004-12-04T00:00:00',
      preferredName: 'Bi',
      privacyLevel: 3,
      updateBit: true,
      autoGame: true,
      startDate: '2000-01-01T00:00:00',
      endDate: '2022-11-26T00:00:00',
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: '2021-01-01T00:00:00',
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
    },
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Charissa Mao',
        secondaryGuardianName: null,
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 5,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 5,
        guardian2ID: 0,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 5,
      preferredLanguage: 'English',
      firstName: 'Jeline',
      lastName: 'Mao',
      nric: 'Sxxxx065F',
      address: '12 Ang Mio Kio Road #98-55 546512,Singapore',
      tempAddress: null,
      homeNo: '65231565',
      handphoneNo: '86543216',
      gender: 'M',
      dob: '0001-01-09T00:00:00',
      preferredName: 'Tom',
      privacyLevel: 3,
      updateBit: true,
      autoGame: true,
      startDate: '2021-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture: null,
    },
    {
      patientAllocationDTO: null,
      patientID: 9,
      preferredLanguage: 'Cantonese',
      firstName: 'Mary',
      lastName: 'Tan',
      nric: 'Sxxxx585X',
      address: null,
      tempAddress: null,
      homeNo: null,
      handphoneNo: null,
      gender: 'F',
      dob: '1996-02-02T00:00:00',
      preferredName: 'Mary',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2020-02-02T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: false,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture: null,
    },
    {
      patientAllocationDTO: {
        doctorName: 'Daniel Lee',
        gameTherapistName: 'Alan Tan',
        supervisorName: 'Jessica Sim',
        caregiverName: 'Adeline Tan',
        guardianName: 'Tommy Lee',
        secondaryGuardianName: 'Tommy Lee',
        temporaryDoctorName: null,
        temporaryCaregiverName: null,
        patientID: 10,
        doctorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
        gameTherapistID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F3',
        supervisorID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
        caregiverID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
        guardianID: 10,
        guardian2ID: 11,
        tempDoctorID: null,
        tempCaregiverID: null,
      },
      patientID: 10,
      preferredLanguage: 'English',
      firstName: 'John',
      lastName: 'Can',
      nric: 'Sxxxx123Z',
      address: '12 Ang Mio Kio Road #98-55 546512,Singapore',
      tempAddress: null,
      homeNo: '65231565',
      handphoneNo: '86543216',
      gender: 'M',
      dob: '1965-01-01T00:00:00',
      preferredName: 'John',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2021-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: false,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture: null,
    },
    {
      patientAllocationDTO: null,
      patientID: 11,
      preferredLanguage: 'Cantonese',
      firstName: 'adfad',
      lastName: 'adfad',
      nric: 'Txxfadf',
      address: null,
      tempAddress: null,
      homeNo: null,
      handphoneNo: null,
      gender: 'F',
      dob: '2000-01-01T00:00:00',
      preferredName: 'dlaijfdl',
      privacyLevel: 1,
      updateBit: true,
      autoGame: true,
      startDate: '2022-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture: null,
    },
    {
      patientAllocationDTO: null,
      patientID: 12,
      preferredLanguage: 'Cantonese',
      firstName: 'adfad',
      lastName: 'adfad',
      nric: 'Txxfadf',
      address: null,
      tempAddress: null,
      homeNo: null,
      handphoneNo: null,
      gender: 'F',
      dob: '2000-01-01T00:00:00',
      preferredName: 'dlaijfdl',
      privacyLevel: 1,
      updateBit: true,
      autoGame: true,
      startDate: '2022-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture: null,
    },
    {
      patientAllocationDTO: null,
      patientID: 13,
      preferredLanguage: 'Cantonese',
      firstName: 'wk1234',
      lastName: 'testlastname',
      nric: 'Sxxxx235A',
      address: 'MyHome',
      tempAddress: 'MyHome',
      homeNo: '61236123',
      handphoneNo: '61236123',
      gender: 'M',
      dob: '2000-10-10T00:00:00',
      preferredName: 'wk',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2000-10-10T00:00:00',
      endDate: '2000-10-10T00:00:00',
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture: null,
    },
    {
      patientAllocationDTO: null,
      patientID: 14,
      preferredLanguage: 'Cantonese',
      firstName: 'Hello',
      lastName: 'Test',
      nric: 'Sxxxx235A',
      address: 'MyHome',
      tempAddress: 'MyHome',
      homeNo: '61236123',
      handphoneNo: '61236123',
      gender: 'M',
      dob: '2000-10-10T00:00:00',
      preferredName: 'A',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2000-10-10T00:00:00',
      endDate: '2000-10-10T00:00:00',
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture: null,
    },
  ]);
  const [clickedPatientProfile, setPatientProfile] = useState(
    // initialize clicked patient as the first patient TODO: (yapsiang) error handling for no patient
    listOfPatients[0],
  );
  //   const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation, sidebar } = props;

  // TODO: (yapsiang) set up api calls

  //   useEffect(() => {
  //     // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
  //     // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
  //     setIsLoading(true);
  //     const promiseFunction = async () => {
  //       const response = await getListOfPatients();

  //       setListOfPatients(response.data);
  //     };
  //     promiseFunction();
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  //   const getListOfPatients = async () => {
  //     const response = await patientApi.getPatient(null, true, true);
  //     if (!response.ok) {
  //       // Check if token has expired, if yes, proceed to log out
  //       checkExpiredLogOutHook.handleLogOut(response);
  //       return;
  //     }
  //     setIsLoading(false);
  //     return response;
  //   };

  //   const handleFabOnPress = () => {
  //     // TODO: Include `Add Patient Feature`
  //     // console.log('Placeholder for fab on click');
  //   };

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
          w={sidebar ? '85vw' : '100vw'}
          style={{ display: 'flex', flexDirection: 'row' }}
        >
          {/* PatientScreen */}
          <View style={{ flex: 1 }}>
            <Center backgroundColor={colors.white_var1}>
              <ScrollView h="110vh">
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
              {/* <Fab
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
          />{' '} */}
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
                <View w="100%" style={{ flex: 2 }}>
                  <PatientInformationCard
                    patientProfile={clickedPatientProfile}
                    navigation={navigation}
                    w="100%"
                  />
                </View>

                <HStack
                  space={sidebar ? 0 : 2}
                  ml="3%"
                  mr="3%"
                  mt="6"
                  style={{ flex: 1 }}
                >
                  <HStack space={sidebar ? 0 : 2}>
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
                      patientProfile={clickedPatientProfile}
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
                      patientProfile={clickedPatientProfile}
                    />
                    <PatientProfileCard
                      vectorIconComponent={
                        <FontAwesome5
                          name="pills"
                          size={30}
                          color={colors.pink}
                        />
                      }
                      text="Prescription"
                      navigation={navigation}
                      routes={routes.PATIENT_PRESCRIPTION}
                      patientProfile={clickedPatientProfile}
                    />
                  </HStack>
                  <HStack space={sidebar ? 0 : 2}>
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
                          size={30}
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
                          size={30}
                          color={colors.pink}
                        />
                      }
                      text="Activity"
                      navigation={navigation}
                      routes={routes.PATIENT_ROUTINE}
                      patientProfile={clickedPatientProfile}
                    />
                  </HStack>
                  <HStack space={sidebar ? 0 : 2}>
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
                      patientProfile={clickedPatientProfile}
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
                      patientProfile={clickedPatientProfile}
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
                      patientProfile={clickedPatientProfile}
                    />
                  </HStack>
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
