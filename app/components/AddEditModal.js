// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import DateInputField from './input-components/DateInputField';

// Configurations
import colors from 'app/config/colors';

function AddEditModal({
  showModal,
  modalMode,
  modalContent,
  modalTitle='',
  onClose,
  handleSubmit,
  isInputErrors=false,
}) {

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="65%">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>{modalMode} {modalTitle}</Text>
        </Modal.Header>
        <Modal.Body>
          <View> 
            {modalContent}         
          </View>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton color="red" title="Cancel" onPress={onClose}></AppButton>
            <AppButton
              onPress={handleSubmit}
              title="Submit"
              color="green"
              isDisabled={isInputErrors}
            ></AppButton>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: colors.green, // Change to your preferred green color
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    color: 'white', // Text color
    fontSize: 18, // Adjust font size as needed
    fontWeight: 'bold', // Optional: if you want the text to be bold
    textTransform: 'uppercase',
  },  
});

export default AddEditModal;
