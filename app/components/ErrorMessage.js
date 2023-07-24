import React from 'react';
import { Text } from 'react-native';
import { FormControl } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

function ErrorMessage(props) {
  const { message, visible, testID } = props;
  if (!visible) {
    return null;
  }

  return (
    <FormControl isInvalid>
      <FormControl.ErrorMessage
        leftIcon={<MaterialIcons name="warning" color={colors.red} size={25} />}
      >
        <Text testID={testID}>{message}</Text>
      </FormControl.ErrorMessage>
    </FormControl>
  );
}

export default ErrorMessage;
