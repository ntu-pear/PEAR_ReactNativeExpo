import React from "react";
import { StyleSheet } from "react-native";
import {
  Avatar,
  Center,
  Stack,
  Text,
  Input,
  FormControl,
  HStack,
  TextArea,
} from "native-base";
import colors from "../config/colors";

function PersonalSocialHistory() {
  return (
    <Stack alignItems="flex-start">
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Social History
      </Text>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalSocialHistory;
