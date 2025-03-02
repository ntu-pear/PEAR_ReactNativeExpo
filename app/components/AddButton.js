import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'native-base';
import colors from 'app/config/colors';
import { FontAwesome } from '@expo/vector-icons';

function AddButton(props) {
  // Destructure props including an optional iconName with a default value of "plus"
  const {
    title,
    onPress,
    color = 'green',
    isDisabled = false,
    testID,
    iconName = 'plus', // default icon name is "plus"
  } = props;

  return (
    <View style={styles.buttonContainer}>
      <Button
        testID={testID}
        style={[styles.button, { backgroundColor: colors[color] }]}
        isDisabled={isDisabled}
        onPress={onPress}
      >
        <View style={styles.buttonContent}>
          <FontAwesome
            name={iconName}
            size={20}
            color={colors.white}
            style={styles.icon}
          />
          <Text style={styles.text}>{title}</Text>
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.pink,
    borderRadius: 25,
    width: '50%',
    height: 55,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 18,
    padding: 5,
  },
  icon: {
    marginHorizontal: 8, // Adjust spacing between text and icon
  },
});

export default AddButton;
