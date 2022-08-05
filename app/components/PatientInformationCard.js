import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Box, VStack, Center, Image, Text, HStack, Icon } from "native-base";
import colors from "../config/colors";
import routes from "../navigation/routes";
import { MaterialIcons } from "@expo/vector-icons";

function PatientInformationCard(props) {
  const { patientProfile, navigation } = props;
  const [displayPicUrl, setDisplayPicUrl] = useState(
    `https://picsum.photos/400/400/?image=${Math.floor(Math.random() * 85)}`
  );
  const handleOnPress = () => {
    console.log("Placeholder for touchablehighlight on press");
    navigation.push(routes.PATIENT_INFORMATION, {
      displayPicUrl: `${displayPicUrl}`,
      ...patientProfile,
    });
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
    <TouchableOpacity onPress={handleOnPress}>
      <Box
        mt="5"
        mb="5"
        ml="1"
        mr="1"
        w="100%"
        overflow="visible"
        rounded="lg"
        borderColor={colors.primary_gray}
        borderWidth="1"
      >
        <VStack mb="2" mt="2">
          <Center>
            <Image
              mt="2"
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
            <Center mt="1">
              <Text bold fontSize="2xl">
                {`${patientProfile.firstName} ${patientProfile.lastName}`}
              </Text>
            </Center>
            <Center mt="1">
              <Text italic fontSize="2xl">
                {`${patientProfile.preferredName}`}
              </Text>
            </Center>
            <Center mt="1">
              <Text italic fontSize="2xl">
                {patientProfile.gender === "F" ? "Female" : "Male"}
              </Text>
            </Center>
          </Center>
        </VStack>
        <HStack space={2} justifyContent="center" mt="1">
          <Box>
            <Text bold fontSize="xl">
              NRIC
            </Text>
          </Box>
          <Box>
            <Text italic fontSize="xl">{`${patientProfile.nric}`}</Text>
          </Box>

          <Box>
            <Text bold italic fontSize="xl">
              Age
            </Text>
          </Box>
          <Box>
            <Text italic fontSize="xl">
              {`${calcAge(patientProfile.dob)}`}
            </Text>
          </Box>
        </HStack>

        <HStack space={2} justifyContent="center" mt="1" mb="2">
          <Box>
            <Text bold italic fontSize="xl">
              D.O.B
            </Text>
          </Box>
          <Box>
            <Text italic fontSize="xl">
              {`${extractFullYear(patientProfile.dob)}`}
            </Text>
          </Box>
          <Box>
            <Text bold italic fontSize="xl">
              Language
            </Text>
          </Box>
          <Box>
            <Text italic fontSize="xl">
              {`${patientProfile.preferredLanguage}`}
            </Text>
          </Box>
        </HStack>
        <Center position="absolute" right="0" marginY="31%">
          <Icon as={MaterialIcons} color={colors.black_var1} name="chevron-right" size="5xl"/>
        </Center>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});

export default PatientInformationCard;
