// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text, Flex } from 'native-base';
import { StyleSheet } from 'react-native';

// Components
import SelectionInputField from './input-components/SelectionInputField';
import InputField from './input-components/InputField';
import AppButton from './AppButton';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';
import colors from 'app/config/colors';

// Configurations
import AddEditModal from './AddEditModal';

function AddPatientAllergyModal({
  showModal,
  modalMode,
  allergyFormData,
  setAllergyFormData,
  onClose,
  onSubmit,
  existingAllergyIDs,
}) {
  const [allergyData, setAllergyData] = useState({
    AllergyListID: null,
    AllergyReactionListID: null,
    AllergyRemarks: '',
  });

  // Error states for each input field
  const [isInputErrors, setIsInputErrors] = useState(false);
  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);

  // State to manage disabled options
  const [disabledAllergyOptions, setDisabledAllergyOptions] = useState({});

  const { data: allergies } = useGetSelectionOptions('Allergy');
  const sortedAllergies = allergies?.sort((a, b) => a.value - b.value) || [];
  
  const { data: reactions } = useGetSelectionOptions('AllergyReaction');
  const sortedReactions = reactions?.sort((a, b) => a.value - b.value) || [];

  // Filter out allergyID1 and allergyID2 if there is an existing allergy
  const hiddenAllergyIDs = [1, 2]; // AllergyID1 and AllergyID2
  const filteredAllergies = existingAllergyIDs.length > 0
    ? sortedAllergies.filter(allergy => !hiddenAllergyIDs.includes(allergy.value))
    : sortedAllergies;

  // Error handling useEffect
  useEffect(() => {
    setIsInputErrors(isAllergyError || isReactionError || isRemarksError);
  }, [isAllergyError, isReactionError, isRemarksError]);

  // Reset form to initial state
  const resetForm = () => {
    setAllergyData({
      AllergyListID: null,
      AllergyReactionListID: null,
      AllergyRemarks: '',
    });
    setIsAllergyError(false);
    setIsReactionError(false);
    setIsRemarksError(false);
  };

  // When modal is closed, reset the form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Update disabled options based on existing allergies
  useEffect(() => {
    const newDisabledOptions = {};
    existingAllergyIDs.forEach((id) => {
      newDisabledOptions[id] = true;
    });
    setDisabledAllergyOptions(newDisabledOptions);
  }, [existingAllergyIDs, allergies]);

  // Handle form data change
  const handleAllergyChange = (value) => {
    if (value < 3) {
      setAllergyData({
        ...allergyData,
        AllergyListID: value,
        AllergyReactionListID: 1,
        AllergyRemarks: 'NIL',
      });
      setIsReactionError(false);
      setIsRemarksError(false);
    } else {
      setAllergyData({
        ...allergyData,
        AllergyListID: value,
        AllergyReactionListID: null,  // Reset when selecting value > 2
        AllergyRemarks: '',           // Clear remarks as well
      });
    }
  };

  const handleReactionChange = (value) => {
    setAllergyData({ ...allergyData, AllergyReactionListID: value });
  };

  const handleRemarksChange = (value) => {
    setAllergyData({ ...allergyData, AllergyRemarks: value });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(allergyData);
      onClose();
    }
  };

  return (
    <AddEditModal
      handleSubmit={handleSubmit}
      isInputErrors={isInputErrors}
      modalMode={modalMode}
      onClose={onClose}
      showModal={showModal}
      modalTitle='Allergy'
      modalContent={(
        <>
          <SelectionInputField
            isRequired={allergyData.AllergyListID > 2}
            title="Allergy"
            onDataChange={handleAllergyChange}
            value={allergyData.AllergyListID}
            dataArray={filteredAllergies}
            onEndEditing={() => setIsAllergyError(false)}
            isDisabledItems={disabledAllergyOptions}
            isInvalid={isAllergyError}
          />
          {allergyData.AllergyListID > 2 && (
            <>
              <SelectionInputField
                isRequired
                title="Reaction"
                onDataChange={handleReactionChange}
                value={allergyData.AllergyReactionListID}
                dataArray={sortedReactions}
                onEndEditing={setIsReactionError}
                isInvalid={isReactionError}
              />
              <InputField
                isRequired
                title="Remarks"
                value={allergyData.AllergyRemarks}
                onChangeText={handleRemarksChange}
                variant="multiLine"
                onEndEditing={setIsRemarksError}
                isInvalid={isRemarksError}
              />
            </>
          )}
        </>
      )}
    />
  );

}
  

export default AddPatientAllergyModal;
