// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import SelectionInputField from './input-components/SelectionInputField';
import RadioButtonInput from './input-components/RadioButtonsInput';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import AddEditModal from './AddEditModal';

function AddPatientMobilityAidModal({
  testID,
  showModal,
  modalMode,
  formData,
  setFormData,
  onClose,
  onSubmit,
}) {
  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);
  
  // Options for mobility aid field
  const { data: mobilityAidOptions } = useGetSelectionOptions('Mobility');

  // Options for Condition
  const conditionOptions = [
    { label: 'Fully Recovered', value: true },
    { label: 'Not Recovered', value: false },
  ];

  
  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isMobilityRemarksError, setIsMobilityRemarksError] = useState(false);
  const [isCreatedDateTimeError, setIsCreatedDateTimeError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
        isMobilityRemarksError ||
        isCreatedDateTimeError,
    );
  }, [
    isMobilityRemarksError,
    isCreatedDateTimeError,
  ]);

  
  // Reset form
  const resetForm = () => {
    setFormData({    
      "mobilityId": null,
      "mobilityListId": 1,
      "mobilityRemark": "",
      "isRecovered": true,
    });
    setIsMobilityRemarksError(false);
    setIsCreatedDateTimeError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Function to update data
  const handleMobilityData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: field == 'mobilityListId' ? parseInt(e) : e,
    }));
  };

  
  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(formData);
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
      modalTitle='Mobility Aid' 
      modalContent={(
        <>
        <SelectionInputField
          testID={`${testID}_mobility_aid_input`}
          isRequired
          title="Mobility Aid"
          value={formData.mobilityListId}
          dataArray={mobilityAidOptions}
          onDataChange={handleMobilityData('mobilityListId')}
        />
        <InputField
          testID={`${testID}_remarks_input`}
          title={'Remarks'}
          value={formData.mobilityRemark}
          onChangeText={handleMobilityData('mobilityRemark')}
          onEndEditing={setIsMobilityRemarksError}
          autoCapitalize="characters"
        />  
        <RadioButtonInput
          testID={`${testID}_condition_radio`}
          title={'Condition'}
          isRequired={true}
          value={formData.isRecovered}
          dataArray={conditionOptions}
          onChangeData={(newValue) => handleChange('isRecovered', newValue)}
        />        
        </>
      )}
    />
  );
}


export default AddPatientMobilityAidModal;
