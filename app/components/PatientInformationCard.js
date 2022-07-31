import React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";
import { Box, VStack, Center, Image, Text, HStack } from "native-base";
import colors from "../config/colors";
import patient from "../api/patient";

function PatientInformationCard(props) {
  const { patientProfile, navigation } = props;
  const handleOnPress = () => {
    console.log("Placeholder for touchablehighlight on press");
  };

  const calcAge = (dob) => {
    let today = new Date().getFullYear();
    let _dob = new Date(dob).getFullYear();
    return today - _dob;
  };

  const extractFullYear = (dob) => {
    var _date = new Date(dob);
    return _date.getDate() + "-" + _date.getMonth() + "-" + _date.getFullYear();
  };

  return (
    <TouchableHighlight
      onPress={handleOnPress}
      underlayColor={colors.lighter_var2}
    >
      <Box
        bg={colors.light_var1}
        mt="5"
        mb="5"
        ml="1"
        mr="1"
        minW="90%"
        overflow="visible"
        rounded="lg"
      >
        <VStack mb="2">
          <Center>
            <Image
              alt="patient_image"
              borderRadius="full"
              // Note: This is a fall-back uri. Will only be used if source fails to render the image.
              fallbackSource={{
                uri:
                  "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg",
              }}
              resizeMode={"cover"}
              size="2xl"
              source={{
                uri: `${patientProfile.profilePicture}`,
              }}
            />
            <Center>
              <Text bold fontSize="2xl">
                {`${patientProfile.firstName} ${patientProfile.lastName}`}
              </Text>
            </Center>
            <Center>
              <Text italic fontSize="2xl">
                {`${patientProfile.preferredName}`}
              </Text>
            </Center>
            <Center>
              <Text italic fontSize="2xl">
                {patientProfile.gender === "F" ? "Female" : "Male"}
              </Text>
            </Center>
          </Center>
        </VStack>
        <HStack
          ml="5"
          mt="3"
          w="90%"
          space={3}
          justifyContent="flex-start"
          flexWrap={"wrap"}
        >
          <Center w="100%" flex={0}>
            <Text italic fontSize="xl">
              NRIC {`${patientProfile.nric}`}
            </Text>
            <Center w="100%" flex={0}>
              <Text italic fontSize="lg"></Text>
            </Center>
          </Center>
          <Center></Center>
          <Center>
            <Text bold italic fontSize="xl">
              Age
            </Text>
          </Center>
          <Center>
            <Text italic fontSize="lg">
              {`${calcAge(patientProfile.dob)}`}
            </Text>
          </Center>
          <Center>
            <Text bold italic fontSize="xl">
              D.O.B
            </Text>
          </Center>
          <Center>
            <Text italic fontSize="lg">
              {`${extractFullYear(patientProfile.dob)}`}
            </Text>
          </Center>
          <Center>
            <Text bold italic fontSize="xl">
              Language
            </Text>
          </Center>
          <Center>
            <Text italic fontSize="lg">
              {`${patientProfile.preferredLanguage}`}
            </Text>
          </Center>
        </HStack>
      </Box>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({});

export default PatientInformationCard;
