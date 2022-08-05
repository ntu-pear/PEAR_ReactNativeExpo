import React from "react";
import { StyleSheet, Platform } from "react-native";
import { Stack, Text, Input, FormControl, HStack, Button } from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";

function PersonalGuardianCard(props) {
  const { guardian, additionalGuardian } = props.patientGuardian; 

  return (
    <Stack>
      <Text
        color={colors.black_var1}
        fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
        fontSize="2xl"
        fontWeight="semibold"
      >
        Guardian(s)
      </Text>
      <FormControl>
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            First Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={guardian.firstName ? guardian.firstName : "Not Available"}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Last Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={guardian.lastName ? guardian.lastName : "Not Available"}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            NRIC
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={guardian.nric ? guardian.nric : "Not Available"}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${Platform.OS === "ios" ? "Helvetica" : typography.android}`,
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Relationship
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={ Platform.OS === "ios" ? "Helvetica" : typography.android }
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={guardian.relationship ? guardian.relationship : "Not Available"}
            w="100%"
          />
        </HStack>
      </FormControl>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalGuardianCard;
