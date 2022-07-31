import React from "react";
import { StyleSheet, View, TouchableHighlight } from "react-native";

import { Center, Image, Text, VStack, Box } from "native-base";
import colors from "../config/colors";

function PatientScreenCard(props) {
  const { patientProfile } = props;

  const handleOnPress = () => {
    console.log("CLICKING");
    console.log(props);
    // TODO: Navigate to PatientProfile
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
        minW="90%"
        overflow="hidden"
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
              resizeMode={"contain"}
              size="2xl"
              source={{
                uri: `${patientProfile.profilePicture}`,
              }}
            />
          </Center>
          <Center>
            <Text bold fontSize="md">
              {`${patientProfile.firstName} ${patientProfile.lastName}`}
            </Text>
          </Center>
          <Center>
            <Text>{`${patientProfile.preferredName}`}</Text>
          </Center>
          <Center>
            <Text>{`${patientProfile.nric}`}</Text>
          </Center>
        </VStack>
      </Box>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({});

export default PatientScreenCard;
