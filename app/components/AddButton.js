import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'native-base';
import colors from 'app/config/colors';
import { FontAwesome } from '@expo/vector-icons';

function AddButton(props) {
  // Destructure props
  const { title, onPress, color = 'green', isDisabled = false , testID } = props;

  // replacement of TouchableOpacity with Button to enable isDisabled property - Russell
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
            name="plus"
            size={20}
            color={colors.secondary}
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
    color: colors.secondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 18,
    padding: 5,
  },
  icon: {
    marginHorizontal: 8, // Adjust the spacing between text and icon
  },
});

export default AddButton;
