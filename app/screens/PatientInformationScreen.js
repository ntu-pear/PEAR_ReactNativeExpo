import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
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

function PatientInformationScreen(props) {
  const { displayPicUrl } = props.route.params;

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
            <Center
              position="absolute"
              _text={{
                color: `${colors.white_var1}`,
              }}
            >
              Your time
            </Center>
          </Box>
        </TouchableOpacity>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientInformationScreen;
