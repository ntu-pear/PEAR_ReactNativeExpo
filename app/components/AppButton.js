import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text } from 'native-base';
import colors from 'app/config/colors';

function AppButton({
  title,
  onPress,
  color,
  isDisabled = false,
  disabled = false,
  testID,
  style,
}) {
  // replacement of TouchableOpacity with Button to enable isDisabled property - Russell
  return (
    <Button
      style={[styles.button, { backgroundColor: colors[color] }, style]}
      isDisabled={isDisabled || disabled}
      onPress={onPress}
      testID={testID}
    >
      <Text style={styles.text}>{title}</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.grey,
    borderRadius: 25,
    minHeight: 48,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: colors.white,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default AppButton;
