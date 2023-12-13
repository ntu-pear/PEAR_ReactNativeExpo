import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text } from 'native-base';
import colors from 'app/config/colors';

function AppButton(props) {
  // Destructure props
  const { title, onPress, color, isDisabled = false, testID } = props;
  // replacement of TouchableOpacity with Button to enable isDisabled property - Russell
  return (
    <Button
      style={[styles.button, { backgroundColor: colors[color] }]}
      isDisabled={isDisabled}
      onPress={onPress}
      testID={testID}
    >
      <Text style={styles.text}>{title}</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.light_gray,
    borderRadius: 25,
  },
  text: {
    color: colors.secondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 18,
    padding: 7,
  },
});

export default AppButton;
