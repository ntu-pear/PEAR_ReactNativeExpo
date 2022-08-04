import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  Center,
  VStack,
  ScrollView,
  Stack,
  Divider,
  Box,
  AspectRatio,
  Image,
  Text,
} from "native-base";
import colors from "../config/colors";
import PersonalInformationCard from "../components/PersonalInformationCard";

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName } = props.route.params;

  const handleSomething = () => {
    console.log(props);
    console.log(displayPicUrl);
  };

  return (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      <ScrollView>
        <TouchableOpacity onPress={handleSomething}>
          <Box alignItems="Center">
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
                  alignItems="flext-start"
                  _text={{
                    color: `${colors.white_var1}`,
                    fontFamily: "Helvetica",
                    fontSize: "2xl",
                    fontWeight: "500",
                  }}
                >
                  You're caring for
                </Center>
                <Center
                  alignItems="flext-start"
                  _text={{
                    color: `${colors.white_var1}`,
                    fontFamily: "Helvetica",
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
            <Stack ml="5" mr="5" space={3}>
              <PersonalInformationCard patientInformation={props} />
              <Divider />
            </Stack>
          </VStack>
        </TouchableOpacity>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientInformationScreen;
