import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Box, Icon, Text } from "native-base";
import colors from "../config/colors";

function PatientProfileCard(props) {
  const {
    iconTop,
    iconRight,
    iconSize,
    vectorIconComponent,
    textMarginTop,
    textMarginLeft,
    text,
    navigation,
    routes,
    patientProfile
  } = props;

  const handleOnPressToNextScreen = () => {
      console.log("Moving to next screen from profile card");
      navigation.push(routes, {...patientProfile})

  }

  return (
    <TouchableOpacity
    onPress={handleOnPressToNextScreen}>
      <Box
        alignItems="center"
        rounded="lg"
        minW="40"
        minH="40"
        mt="5"
        borderWidth="1"
        borderColor={colors.primary_gray}
      >
        <Box alignItems="center">
          <Icon
            //Reference: Passing component to child
            //https://stackoverflow.com/questions/39652686/pass-react-component-as-props
            as={{ ...vectorIconComponent }}
            top={iconTop}
            right={iconRight}
            color={colors.black_var1}
            size={iconSize}
          />
          <Text
            fontSize="lg"
            mt={textMarginTop}
            ml={textMarginLeft}
            color={colors.black_var1}
          >
            {text}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileCard;
