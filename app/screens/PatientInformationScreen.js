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

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const [isLoading, setIsLoading] = useState(false); //eslint-disable-line no-unused-vars
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);

  useEffect(() => {
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    getSocialHistory.request(patientID);

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
        <Center minH="100%" backgroundColor={colors.white_var1}>
          {/* Note the immediate bunch of code will only be rendered
          when one of the APIs has an error. Purpose: Error handling of API */}
          {(getDoctorNote.error ||
            getPatientGuardian.error ||
            getSocialHistory.error) && (
            <Box h="100%">
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
              <Box position="fixed" my="50%" w="60%" mx="auto">
                <AppButton
                  title="Try Again"
                  color="red"
                  onPress={handleError}
                />
              </Box>
            </Box>
          )}
          <ScrollView>
            <Box>
              <AspectRatio w="100%" ratio={16 / 9}>
                <Image
                  source={{ uri: `${displayPicUrl}` }}
                  alt="patientInformationImage"
                />
              </AspectRatio>
              <Center
                position="absolute"
                bg={colors.primary_overlay_color}
                width="100%"
                height="100%"
              />
              <Center position="absolute" px="5%" py="10%">
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
                <PersonalInformationCard patientInformation={props} />
                <Divider />
                <PersonalPreferenceCard patientInformation={props} />
                <Divider />
                <PersonalDoctorCard doctorNote={getDoctorNote.data} />
                <Divider />
                <PersonalGuardianCard
                  patientGuardian={getPatientGuardian.data}
                />
                <Divider />
                <PersonalSocialHistory socialHistory={getSocialHistory.data} />
              </Stack>
            </VStack>
          </ScrollView>
        </Center>
      )}
    </>
  );
}

export default PatientInformationScreen;
/*
fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
*/
