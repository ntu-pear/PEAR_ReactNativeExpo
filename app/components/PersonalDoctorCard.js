import React from "react";
import { StyleSheet } from "react-native";
import { Stack, Text, FormControl, TextArea } from "native-base";
import colors from "../config/colors";

function PersonalDoctorCard() {
  return (
    <Stack>
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Doctor's Notes
      </Text>
      <FormControl>
        <Stack space={0} alignItems="flex-start" flexWrap={"wrap"}>
          <FormControl.Label
            width="100%"
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Medical Notes
          </FormControl.Label>
          <TextArea
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            input="lg"
            ml="-2.5"
            minH="8%"
            maxH="40%"
            variant="unstyled"
            value={"test"}
            w="100%"
          />
        </Stack>
      </FormControl>
    </Stack>
  );
}

const styles = StyleSheet.create({});

export default PersonalDoctorCard;
