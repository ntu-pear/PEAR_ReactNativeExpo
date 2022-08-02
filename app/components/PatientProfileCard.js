import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Box, Icon, Text } from "native-base";
import colors from "../config/colors";

function PatientProfileCard() {
  return (
    <TouchableOpacity>
      <Box
        alignItems="center"
        rounded="lg"
        minW="40"
        minH="40"
        borderWidth="1"
        borderColor={colors.primary_gray}
      >
        <Box alignItems="center">
          <Icon
            as={<MaterialCommunityIcons name="allergy" />}
            top="4"
            right="2"
            color={colors.black_var1}
            size="100"
          />
          <Text fontSize="lg" mt="5" ml="1" color={colors.black_var1}>
            Allergy
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileCard;
