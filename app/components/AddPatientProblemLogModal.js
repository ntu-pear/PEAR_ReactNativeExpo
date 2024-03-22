// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import SelectionInputField from './input-components/SelectionInputField';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import colors from 'app/config/colors';

function AddPatientProblemLogModal({
  showModal,
  modalMode,
  logFormData,
  setLogFormData,
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
  const [isProblemDescriptionError, setIsProblemDescriptionError] =
    useState(false);
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
        isCreatedDateTimeError,
    );
  }, [
    isAuthorNameError,
    isProblemDescriptionError,
    isProblemRemarksError,
    isCreatedDateTimeError,
  ]);

  // Reset form
  const resetForm = () => {
    setLogFormData({
      problemLogID: null,
      problemLogListID: 1,
      problemLogRemarks: '',
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
    setLogFormData((prevState) => ({
      ...prevState,
      [field]: field == 'problemLogListID' ? parseInt(e) : e,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(logFormData);
      onClose();
    }
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="65%">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>{modalMode} Problem Log</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <SelectionInputField
              isRequired
              title="Description"
              value={logFormData.problemLogListID}
              dataArray={problemLogOptions}
              onDataChange={handleLogData('problemLogListID')}
            />
            <InputField
              isRequired
              title={'Remarks'}
              value={logFormData.problemLogRemarks}
              onChangeText={handleLogData('problemLogRemarks')}
              onEndEditing={setIsProblemRemarksError}
              autoCapitalize="none"
            />
          </VStack>
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
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientProblemLogModal;
