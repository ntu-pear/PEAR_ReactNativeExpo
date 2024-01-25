// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import InputField from './input-fields/InputField';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

function AddPatientAllergyModal({
  showModal,
  onClose,
  onSubmit,
  existingAllergyIDs,
}) {
  const [allergyData, setAllergyData] = useState({
    AllergyListID: null,
    AllergyReactionListID: null,
    AllergyRemarks: '',
  });

  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);

  const { data: allergies } = useGetSelectionOptions('Allergy');
  const { data: reactions } = useGetSelectionOptions('AllergyReaction');

  // Update field values
  const handleAllergyChange = (value) => {
    setAllergyData({ ...allergyData, AllergyListID: value });
  };

  const handleReactionChange = (value) => {
    setAllergyData({ ...allergyData, AllergyReactionListID: value });
  };

  const handleRemarksChange = (value) => {
    setAllergyData({ ...allergyData, AllergyRemarks: value });
  };

  // Handle form submission
  // there is some problem with the allergydata format - Joel
  const handleSubmit = () => {
    if (!isAllergyError && !isReactionError && !isRemarksError) {
      onSubmit(allergyData);
      onClose();
    }
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Add Allergy</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <SelectionInputField
              isRequired
              title={'Allergy'}
              onDataChange={handleAllergyChange}
              value={allergyData.AllergyListID}
              dataArray={allergies}
              onEndEditing={setIsAllergyError}
            />
            {allergyData.AllergyListID > 2 ? (
              <>
                <SelectionInputField
                  isRequired={allergyData.AllergyListID > 2}
                  title={'Reaction'}
                  onDataChange={handleReactionChange}
                  value={allergyData.AllergyReactionListID}
                  dataArray={reactions}
                  onEndEditing={setIsReactionError}
                />

                <InputField
                  isRequired={allergyData.AllergyListID > 2}
                  title={'Remarks'}
                  value={allergyData.AllergyRemarks}
                  onChangeText={handleRemarksChange}
                  variant={'multiLine'}
                  onEndEditing={setIsRemarksError}
                />
              </>
            ) : (
              <View style={{ backgroundColor: 'black', height: 20 }} />
            )}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
              Cancel
            </Button>
            <Button onPress={handleSubmit}>Save</Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: 'green', // Change to your preferred green color
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

export default AddPatientAllergyModal;
