// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from '../input-components/InputField';
import AppButton from '../AppButton';
import SelectionInputField from '../input-components/SelectionInputField';

// Hooks 
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import colors from 'app/config/colors';
import AddEditModal from './AddEditModal';

function AddPatientMedicalHistoryModal({
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

  // Options for problem field
  const { data: problemLogOptions } = useGetSelectionOptions('ProblemLog');

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isAuthorNameError, setIsAuthorNameError] = useState(false);
  const [isProblemDescriptionError, setIsProblemDescriptionError] = useState(false);
  const [isProblemRemarksError, setIsProblemRemarksError] = useState(false);
  const [isCreatedDateTimeError, setIsCreatedDateTimeError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isAuthorNameError ||
      isProblemDescriptionError ||
      isProblemRemarksError ||
      isCreatedDateTimeError
    );
  }, [
    isAuthorNameError,
    isProblemDescriptionError,
    isProblemRemarksError,
    isCreatedDateTimeError,
  ]);

  // Reset form 
  const resetForm = () => {
    setFormData({    
      "problemLogID": null,
      "problemLogListID": 1,
      "problemLogRemarks": "",
    });
    setIsAuthorNameError(false);
    setIsProblemDescriptionError(false);
    setIsProblemRemarksError(false);
    setIsCreatedDateTimeError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update  data
  const handleLogData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: field == 'problemLogListID' ? parseInt(e) : e,
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
      handleSubmit={handleSubmit}
      isInputErrors={isInputErrors}
      modalMode={modalMode}
      onClose={onClose}
      showModal={showModal}
      modalTitle='Problem Log' 
      modalContent={(
        <>
        <SelectionInputField
          isRequired
          title="Description"
          value={formData.problemLogListID}
          dataArray={problemLogOptions}
          onDataChange={handleLogData('problemLogListID')}
        />        
        <InputField
          isRequired
          title={'Remarks'}
          value={formData.problemLogRemarks}
          onChangeText={handleLogData('problemLogRemarks')}
          onEndEditing={setIsProblemRemarksError}
          autoCapitalize='none'
        />         
        </>
      )}
    />
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
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientMedicalHistoryModal;
