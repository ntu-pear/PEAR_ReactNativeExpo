import React from 'react';
import { Text } from 'react-native';
import { FormControl } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

function ErrorMessage({ message, visible = true, testID = '' }) {
  if (!visible) {
    return null;
  }

  return (
    <FormControl isInvalid>
      <FormControl.ErrorMessage
        leftIcon={message ? (
          <MaterialIcons name="warning" color={colors.red} size={17} />
        ) : null}
      >
        <Text testID={testID}>{message}</Text>
      </FormControl.ErrorMessage>
    </FormControl>
  );
}

export default ErrorMessage;
