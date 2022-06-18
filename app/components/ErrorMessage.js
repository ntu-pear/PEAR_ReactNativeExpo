import React from "react";
import { StyleSheet } from "react-native";
import { FormControl } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../config/colors";

function ErrorMessage(props) {
  const { message } = props;
  return (
    <FormControl isInvalid>
      <FormControl.ErrorMessage
        leftIcon={<MaterialIcons name="warning" color={colors.red} size={25} />}
        style={styles.errorMessage}
      >
        {message}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}

const styles = StyleSheet.create({});

export default ErrorMessage;
