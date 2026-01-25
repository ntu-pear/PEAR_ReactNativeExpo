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

  // Filter out allergyID1 and allergyID2 if there is an existing allergy (add mode only)
  const hiddenAllergyIDs = [1, 2]; // AllergyID1 and AllergyID2
  const filteredAllergies =
    modalMode === 'add'
      ? (existingAllergyIDs.length > 0
          ? sortedAllergies.filter((allergy) => !hiddenAllergyIDs.includes(allergy.value))
          : sortedAllergies)
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

  // Prefill data for edit mode
  useEffect(() => {
    if (!showModal || modalMode !== 'edit') return;

    const resolveIdFromLabel = (options = [], label = '') => {
      const needle = (label ?? '').toString().trim().toLowerCase();
      if (!needle) return null;
      const hit = options.find((o) => (o.label ?? '').toString().trim().toLowerCase() === needle);
      return hit?.value ?? null;
    };

    const prefillAllergyId =
      allergyFormData?.allergyListID ??
      resolveIdFromLabel(sortedAllergies, allergyFormData?.allergyListDesc);
    const prefillReactionId =
      allergyFormData?.allergyReactionListID ??
      resolveIdFromLabel(sortedReactions, allergyFormData?.allergyReaction);

    const prefill = {
      AllergyListID: prefillAllergyId ?? 1,
      AllergyReactionListID: prefillReactionId ?? 1,
      AllergyRemarks: allergyFormData?.allergyRemarks ?? '',
    };

    setAllergyData(prefill);
    setIsAllergyError(false);
    setIsReactionError(false);
    setIsRemarksError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, modalMode, allergyFormData, sortedAllergies.length, sortedReactions.length]);

  // Update disabled options based on existing allergies
  useEffect(() => {
    const newDisabledOptions = {};
    existingAllergyIDs.forEach((id) => {
      newDisabledOptions[id] = true;
    });
    // In edit mode, allow re-selecting the current allergy type
    if (modalMode === 'edit' && allergyData?.AllergyListID != null) {
      delete newDisabledOptions[allergyData.AllergyListID];
    }
    setDisabledAllergyOptions(newDisabledOptions);
  }, [existingAllergyIDs, allergies, modalMode, allergyData?.AllergyListID]);

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
    // Basic required-field validation (prevents unstable submissions)
    const trimmedNotes = (allergyData?.AllergyRemarks ?? '').toString().trim();

    let hasError = false;

    // Allergy selection should always exist, but guard anyway
    if (allergyData?.AllergyListID == null) {
      setIsAllergyError(true);
      hasError = true;
    }

    // When an actual allergy is selected (IDs > 2 in this flow), require reaction + notes
    if ((allergyData?.AllergyListID ?? 0) > 2) {
      if (allergyData?.AllergyReactionListID == null) {
        setIsReactionError(true);
        hasError = true;
      }
      if (!trimmedNotes) {
        setIsRemarksError(true);
        hasError = true;
      }
    }

    if (hasError || isInputErrors) {
      return;
    }

    const payload =
      modalMode === 'edit'
        ? {
            ...allergyData,
            Patient_AllergyID: allergyFormData?.allergyID ?? null,
            IsDeleted: '0',
          }
        : allergyData;

    onSubmit(payload);
    onClose();
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
                title="Notes"
                value={allergyData.AllergyRemarks}
                onChangeText={handleRemarksChange}
                variant="multiLine"
                autoCapitalize="none"
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
