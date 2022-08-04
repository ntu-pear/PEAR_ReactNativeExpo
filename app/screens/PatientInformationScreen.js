import React from "react";
import { StyleSheet, Platform} from "react-native";
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

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName } = props.route.params;

  const handleSomething = () => {
    console.log(props);
    console.log(displayPicUrl);
  };

  return (
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
                  fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
                  fontSize: "2xl",
                  fontWeight: "500",
                }}
              >
                You're caring for
              </Center>
              <Center
                _text={{
                  color: `${colors.white_var1}`,
                  fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
                  fontSize: "2xl",
                  fontWeight: "500",
                }}
              >
                {`${firstName} ${lastName}`}
              </Center>
            </VStack>
          </Center>
        </Box>
        <VStack maxW="100%" mt="2.5">
          <Stack ml="5" mr="5" space={5}>
            <Divider mt="2" />
            <PersonalInformationCard patientInformation={props} />
            <Divider />
            <PersonalPreferenceCard patientInformation={props} />
            <Divider />
            <PersonalDoctorCard />
            <Divider />
            <PersonalGuardianCard />
            <Divider />
            <PersonalSocialHistory />
          </Stack>
        </VStack>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientInformationScreen;
/*
fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
*/