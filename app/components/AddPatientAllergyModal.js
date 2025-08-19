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
  testID,
  showModal,
  modalMode,
  allergyFormData,
  setAllergyFormData,
  onClose,
  onSubmit,
  existingAllergyIDs,
}) {
  const [allergyData, setAllergyData] = useState({
    AllergyListID: 1,
    AllergyReactionListID: 1,
    AllergyRemarks: 'NIL',
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
  
    // Find the next available Allergy ID that is not in existingAllergyIDs
    let nextAvailableAllergyID = null;

    // Take the whole range of allergies
    for (let i = 3; i <= 13; i++) {
      if (!existingAllergyIDs.includes(i)) {
        nextAvailableAllergyID = i;
        break;
      }
    }

    setAllergyData({
      // if all allergies taken after finding nextAvaiableAllergy, then default fallback to Corn
      AllergyListID: existingAllergyIDs.length > 0 ? (nextAvailableAllergyID || 3) : 1, 
      AllergyReactionListID: existingAllergyIDs.length > 0 ? 2 : 1,
      AllergyRemarks: existingAllergyIDs.length > 0 ? '' : 'NIL',
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
        AllergyReactionListID: 2,  
        AllergyRemarks: '',      
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
      testID={testID}
      handleSubmit={handleSubmit}
      isInputErrors={isInputErrors}
      modalMode={modalMode}
      onClose={onClose}
      showModal={showModal}
      modalTitle='Allergy'
      modalContent={(
        <>
          <SelectionInputField
            testID={`${testID}_allergy_select`}
            isRequired
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
                testID={`${testID}_reaction_select`}
                isRequired
                title="Reaction"
                onDataChange={handleReactionChange}
                value={allergyData.AllergyReactionListID}
                dataArray={sortedReactions}
                onEndEditing={setIsReactionError}
                isInvalid={isReactionError}
              />
              <InputField
                testID={`${testID}_remarks`}
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
