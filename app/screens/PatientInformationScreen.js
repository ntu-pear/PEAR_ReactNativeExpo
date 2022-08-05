import React, { useState, useEffect } from "react";
import { StyleSheet, Platform, View } from "react-native";
import {
  Center,
  VStack,
  ScrollView,
  Stack,
  Divider,
  Box,
  AspectRatio,
  Image,
  useToast,
  Alert,
  CloseIcon,
  HStack,
  Text,
  IconButton,
} from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";
import PersonalInformationCard from "../components/PersonalInformationCard";
import PersonalPreferenceCard from "../components/PersonalPreferenceCard";
import PersonalDoctorCard from "../components/PersonalDoctorCard";
import PersonalGuardianCard from "../components/PersonalGuardianCard";
import PersonalSocialHistory from "../components/PersonalSocialHistory";
import ActivityIndicator from "../components/ActivityIndicator";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";
import doctorNoteApi from "../api/doctorNote";
import guardianApi from "../api/guardian";
import socialHistoryApi from "../api/socialHistory";
import useApi from "../hooks/useApi";
import AppButton from "../components/AppButton";

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);

  useEffect(() => {
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    getSocialHistory.request(patientID);
  }, []);

  /*
   * Purpose: Handle API error if fetch fails
   */
  const handleError = () => {
    if (getDoctorNote.error) getDoctorNote.request(patientID);
    if (getPatientGuardian.error) getPatientGuardian.request(patientID);
    if (getSocialHistory.error) getSocialHistory.request(patientID);
  };

  return (
    <>
      {getDoctorNote.loading ||
      getPatientGuardian.loading ||
      getSocialHistory.loading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <Center minH="100%" backgroundColor={colors.white_var1}>
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
                        {`Unable to retrieve api data. Try again? Or Relogin`}
                      </Text>
                    </HStack>
                    <IconButton
                      variant="unstyled"
                      _focus={{
                        borderWidth: 0,
                      }}
                      icon={<CloseIcon size="3" />}
                      _icon={{
                        color: "coolGray.600",
                      }}
                    />
                  </HStack>
                </VStack>
              </Alert>
              <Box position="fixed" my="50%" w="60%" mx="auto">
                <AppButton
                  title="Try Again"
                  color={"red"}
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
              ></Center>
              <Center position="absolute" px="5%" py="10%">
                <VStack>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === "ios" ? "Helvetica" : typography.android
                      }`,
                      fontSize: "2xl",
                      fontWeight: "500",
                    }}
                  >
                    You're caring for
                  </Center>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === "ios" ? "Helvetica" : typography.android
                      }`,
                      fontSize: "2xl",
                      fontWeight: "500",
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

const styles = StyleSheet.create({});

export default PatientInformationScreen;
/*
fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
*/
