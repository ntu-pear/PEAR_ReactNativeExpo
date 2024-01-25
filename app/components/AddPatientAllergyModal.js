// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import InputField from './input-fields/InputField';
import AppButton from './AppButton';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import colors from 'app/config/colors';

function AddPatientAllergyModal({
  showModal,
  onClose,
  onSubmit,
  existingAllergyIDs,
}) {
  // Variables relatied to retrieving allergy and reaction select options from API
  const [allergyData, setAllergyData] = useState({
    AllergyListID: null,
    AllergyReactionListID: null,
    AllergyRemarks: '',
  });

  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);
  const [disabledAllergyOptions, setDisabledAllergyOptions] = useState({});

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

  useEffect(() => {
    const newDisabledOptions = {};
    existingAllergyIDs.forEach((id) => {
      newDisabledOptions[id] = true;
    });
    setDisabledAllergyOptions(newDisabledOptions);
  }, [existingAllergyIDs, allergies]);

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
              isDisabledItems={disabledAllergyOptions}
            />
            {allergyData.AllergyListID > 2 ? (
              <>
                <SelectionInputField
                  isRequired={allergyData.AllergyListID > 2 ? true : false}
                  title={'Reaction'}
                  onDataChange={handleReactionChange}
                  value={allergyData.AllergyReactionListID}
                  dataArray={reactions}
                  onEndEditing={setIsReactionError}
                />

                <InputField
                  isRequired={allergyData.AllergyListID > 2 ? true : false}
                  title={'Remarks'}
                  value={allergyData.AllergyRemarks}
                  onChangeText={handleRemarksChange}
                  variant={'multiLine'}
                  onEndEditing={setIsRemarksError}
                  hideError={true}
                />
              </>
            ) : null}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton color="red" title="Cancel" onPress={onClose}></AppButton>
            <AppButton
              onPress={handleSubmit}
              title="Submit"
              color="green"
            ></AppButton>
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
