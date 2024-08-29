// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, Text } from 'native-base';
import { StyleSheet, Keyboard, View } from 'react-native';

// Components
import AppButton from './AppButton';

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
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      const { height } = event.endCoordinates;
      setKeyboardOffset(height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <View
        style={[
          styles.centeredView,
          { marginBottom: keyboardOffset }, // Adjust margin based on keyboardOffset
        ]}
      >
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
      </View>
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
