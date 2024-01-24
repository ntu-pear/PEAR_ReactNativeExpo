// Libs
import React, { useState } from 'react';
import { Modal, Button, VStack } from 'native-base';

// Components
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import InputField from './input-fields/InputField';

function AllergyFormModal({
  showModal,
  onClose,
  onSubmit,
  allergies,
  reactions,
}) {
  const [allergyData, setAllergyData] = useState({
    AllergyListID: null,
    AllergyReactionListID: null,
    AllergyRemarks: '',
  });

  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);

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
        <Modal.Header>Add Allergy</Modal.Header>
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

export default AllergyFormModal;
