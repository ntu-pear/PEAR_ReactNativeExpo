/*eslint eslint-comments/no-unlimited-disable: error */
import doctorNoteApi from 'app/api/doctorNote';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AppButton from 'app/components/AppButton';
import PersonalDoctorCard from 'app/components/PersonalDoctorCard';
import PersonalGuardianCard from 'app/components/PersonalGuardianCard';
import PersonalInformationCard from 'app/components/PersonalInformationCard';
import PersonalPreferenceCard from 'app/components/PersonalPreferenceCard';
import PersonalSocialHistory from 'app/components/PersonalSocialHistory';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import useApi from 'app/hooks/useApi';
import {
  Alert,
  AspectRatio,
  Box,
  Center,
  CloseIcon,
  Divider,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Stack,
  Text,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useLocation } from 'react-router-dom';

function PatientInformationScreenWeb(props) {
  const { state } = useLocation();
  const { displayPicUrl, firstName, lastName, patientID } = { ...state };
  const { sidebar } = props;

  const [isLoading, setIsLoading] = useState(false); //eslint-disable-line no-unused-vars

  // TODO: (yapsiang) use API
  // const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  // const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  // const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);
  const getDoctorNote = [
    {
      doctorNoteId: 1,
      date: '2022-03-22T11:59:41.7004409',
      doctorName: 'Daniel Lee',
      patientId: 1,
      doctorId: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F6',
      doctorRemarks: 'Test 22-Mar-2022-1159hrs',
    },
  ];
  const getPatientGuardian = {
    guardian: {
      guardianID: 1,
      patientID: 1,
      relationship: 'Husband',
      firstName: 'Tommy',
      lastName: 'Lee',
      contactNo: '97123456',
      nric: 'S7719748F',
      email: 'tommylee711@gmail.com',
      relationshipID: 1,
      isActive: true,
    },
    additionalGuardian: {
      guardianID: 0,
      patientID: 0,
      relationship: null,
      firstName: null,
      lastName: null,
      contactNo: null,
      nric: null,
      email: null,
      relationshipID: 0,
      isActive: false,
    },
  };
  const getSocialHistory = {
    socialHistoryId: 1,
    patientId: 1,
    sexuallyActive: 1,
    secondhandSmoker: 1,
    alcoholUse: 1,
    caffeineUse: 1,
    tobaccoUse: 1,
    drugUse: 1,
    exercise: 1,
    dietListId: 1,
    dietDescription: 'Diabetic',
    educationListId: 1,
    educationDescription: 'Primary or lower',
    liveWithListId: 1,
    liveWithDescription: 'Alone',
    occupationListId: 1,
    occupationDescription: 'Accountant',
    petListId: 1,
    petDescription: 'Bird',
    religionListId: 1,
    religionDescription: 'Atheist',
  };

  useEffect(() => {
    // getDoctorNote.request(patientID);
    // getPatientGuardian.request(patientID);
    // getSocialHistory.request(patientID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Purpose: Handle API error if fetch fails
   */
  const handleError = () => {
    if (getDoctorNote.error) {
      getDoctorNote.request(patientID);
    }
    if (getPatientGuardian.error) {
      getPatientGuardian.request(patientID);
    }
    if (getSocialHistory.error) {
      getSocialHistory.request(patientID);
    }
  };

  return (
    <>
      {getDoctorNote.loading ||
      getPatientGuardian.loading ||
      getSocialHistory.loading ? (
        <ActivityIndicator visible />
      ) : (
        <Box backgroundColor={colors.white_var1} w="100%">
          {/* Note the immediate bunch of code will only be rendered
           when one of the APIs has an error. Purpose: Error handling of API */}
          {(getDoctorNote.error ||
            getPatientGuardian.error ||
            getSocialHistory.error) && (
            <Box p="2" w={sidebar ? '84%' : '100%'}>
              <Alert w="100%" status="error">
                <VStack space={2} flexShrink={1} w="100%">
                  <HStack
                    flexShrink={1}
                    space={2}
                    justifyContent="space-between"
                  >
                    <HStack space={2} flexShrink={1}>
                      <Alert.Icon mt="1" />
                      <Text fontSize="md" color="coolGray.800">
                        Unable to retrieve api data. Try again? Or Relogin
                      </Text>
                    </HStack>
                    <IconButton
                      variant="unstyled"
                      _focus={{
                        borderWidth: 0,
                      }}
                      icon={<CloseIcon size="3" />}
                      _icon={{
                        color: 'coolGray.600',
                      }}
                    />
                  </HStack>
                </VStack>
              </Alert>
              <Box my="50%" w="60%" mx="auto">
                <AppButton
                  title="Try Again"
                  color="red"
                  onPress={handleError}
                />
              </Box>
            </Box>
          )}
          <ScrollView p="2" w={sidebar ? '84%' : '100%'}>
            <Box>
                <Image
                  source={{ uri: `${displayPicUrl}` }}
                  alt="patientInformationImage"
                  style={{ aspectRatio: 16/4 }}
                />
              <Center
                position="absolute"
                bg={colors.primary_overlay_color}
                width="100%"
                height="100%"
              />
              <Center position="absolute" px="15%" py="10%">
                <VStack>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === 'ios' ? 'Helvetica' : typography.android
                      }`,
                      fontSize: '2xl',
                      fontWeight: '500',
                    }}
                  >
                    You're caring for
                  </Center>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === 'ios' ? 'Helvetica' : typography.android
                      }`,
                      fontSize: '2xl',
                      fontWeight: '500',
                    }}
                  >
                    {`${firstName} ${lastName}`}
                  </Center>
                </VStack>
              </Center>
            </Box>
            <VStack maxW="100%" mt="2.5" mb="8">
              <Stack ml="5" mr="5" space={5}>
                <Divider mt="2" />
                <PersonalInformationCard patientInformation={state} />
                <Divider />
                <PersonalPreferenceCard patientInformation={state} />
                <Divider />
                <PersonalDoctorCard doctorNote={getDoctorNote} />
                <Divider />
                <PersonalGuardianCard patientGuardian={getPatientGuardian} />
                <Divider />
                <PersonalSocialHistory socialHistory={getSocialHistory} />
              </Stack>
            </VStack>
          </ScrollView>
        </Box>
      )}
    </>
  );
}

export default PatientInformationScreenWeb;
/*
fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
*/
