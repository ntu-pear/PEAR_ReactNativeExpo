import React from "react";
import { StyleSheet } from "react-native";
import { Stack, Text, Input, FormControl, HStack } from "native-base";
import colors from "../config/colors";

function PersonalGuardianCard() {
  return (
    <Stack alignItems="flex-start">
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Guardian(s)
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
            First Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={"test"}
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
            Last Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={"test"}
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
            NRIC
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={"test"}
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
            Relationship
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={"test"}
            w="100%"
          />
        </HStack>
      </FormControl>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalGuardianCard;
