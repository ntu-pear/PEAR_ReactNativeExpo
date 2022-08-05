import React, { useState, useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import {
  Center,
  VStack,
  ScrollView,
  Stack,
  Divider,
  Box,
  AspectRatio,
  Image,
} from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";
import PersonalInformationCard from "../components/PersonalInformationCard";
import PersonalPreferenceCard from "../components/PersonalPreferenceCard";
import PersonalDoctorCard from "../components/PersonalDoctorCard";
import PersonalGuardianCard from "../components/PersonalGuardianCard";
import PersonalSocialHistory from "../components/PersonalSocialHistory";
import ActivityIndicator from "../components/ActivityIndicator";
import doctorNoteApi from "../api/doctorNote";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";


function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const [isLoading, setIsLoading] = useState(false);
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const [doctorNote, setDoctorNote] = useState([]);

  useEffect(() => {
    const promiseFunction = async () => {
      // TODO: Set Loading here
      setIsLoading(true);
      // TODO: Get Doctor's Notes
      const doctorNotesResponse = await getDoctorNote();
      setDoctorNote(doctorNotesResponse.data);
      // TODO: Get Guardian's Notes
      // TODO: GET Social History
      // Unset Loading
      setIsLoading(false);
    };
    promiseFunction();
    // Run consoloditated promise functions
  }, []);

  const getDoctorNote = async () => {
    const response = await doctorNoteApi.getDoctorNote(patientID);
    if(!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    return response;
  }

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <Center minH="100%" backgroundColor={colors.white_var1}>
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
                <PersonalDoctorCard doctorNote={doctorNote}/>
                <Divider />
                <PersonalGuardianCard />
                <Divider />
                <PersonalSocialHistory />
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
