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

function PersonalPreferenceCard(props) {
    const { patientInformation } = props;
    const { preferredName, preferredLanguage } = patientInformation.route.params;

  return (
    <Stack>
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Preference
      </Text>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Preferred Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={preferredName}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Preferred Language
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={preferredLanguage}
            w="100%"
          />
        </HStack>
      </FormControl>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalPreferenceCard;
