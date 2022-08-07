import React from "react";
import { StyleSheet } from "react-native";
import { Text, HStack, VStack, IconButton, Alert, Box, CloseIcon } from "native-base";
import AppButton from "./AppButton";

/* Note the immediate bunch of code will only be rendered
 * when one of the APIs has an error. Purpose: Error handling of API
 * Note: Make sure to pass in handleError() from parent component to use this code
 */
function ErrorRetryApiCard({ handleError }) {
  return (
    <Box h="100%">
      <Alert w="100%" status="error">
        <VStack space={2} flexShrink={1} w="100%">
          <HStack flexShrink={1} space={2} justifyContent="space-between">
            <HStack space={2} flexShrink={1}>
              <Alert.Icon mt="1" />
              <Text fontSize="md" color="coolGray.800">
                {`Unable to retrieve api data. Try again? Or Relogin`}
              </Text>
            </HStack>
            <IconButton
              variant="unstyled"
              _focus={{
                borderWidth: 0,
              }}
              icon={<CloseIcon size="3" />}
              _icon={{
                color: "coolGray.600",
              }}
            />
          </HStack>
        </VStack>
      </Alert>
      <Box position="fixed" my="50%" w="60%" mx="auto">
        {/* Take not to pass in handleError from parent component */}
        <AppButton title="Try Again" color={"red"} onPress={handleError} />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({});
export default ErrorRetryApiCard;
