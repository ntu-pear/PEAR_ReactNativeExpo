// EditButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from 'app/config/colors'; // Adjust the path as needed
import { FontAwesome } from '@expo/vector-icons';

const EditButton = ({ isEditMode, toggleEditMode }) => {
  return (
    <TouchableOpacity onPress={toggleEditMode} style={styles.button}>
      <Text style={styles.text}>{isEditMode ? 'Done' : 'Edit'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary, // Replace with your color config
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 3, // Shadow for Android
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: colors.dark, // Replace with your color config
    fontWeight: 'bold',
  },
});

export default EditButton;
