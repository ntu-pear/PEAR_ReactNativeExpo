// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import DateInputField from './input-components/DateInputField';

// Configurations
import colors from 'app/config/colors';

function AddPatientMedicalHistoryModal({
  showModal,
  modalMode,
  medicalHistoryData,
  setMedicalHistoryData,
  onClose,
  onSubmit,
}) {
  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isInformationSourceError, setIsInformationSourceError] = useState(false);
  const [isMedicalDetailsError, setIsMedicalDetailsError] = useState(false);
  const [isMedicalEstimatedDateError, setIsMedicalEstimatedDateError] = useState(false);
  const [isMedicalRemarksError, setIsMedicalRemarksError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isInformationSourceError ||
      isMedicalDetailsError ||
      isMedicalEstimatedDateError ||
      isMedicalRemarksError
    );
  }, [
    isInformationSourceError,
    isMedicalDetailsError,
    isMedicalEstimatedDateError,
    isMedicalRemarksError,
  ]);

  // Reset form 
  const resetForm = () => {
    setMedicalHistoryData({
      "medicalHistoryId": null,
      "informationSource": "",
      "medicalDetails": "",
      "medicalRemarks": "",
      "medicalEstimatedDate": new Date(),
    });
    setIsInformationSourceError(false);
    setIsMedicalDetailsError(false);
    setIsMedicalEstimatedDateError(false);
    setIsMedicalRemarksError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update  data
  const handleHxData = (field) => (e) => {
    setMedicalHistoryData((prevState) => ({
      ...prevState,
      [field]: e,
    }));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(medicalHistoryData);
      onClose();
    }
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="65%">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>{modalMode} Medical History</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>            
            <InputField
              isRequired={true}
              title={'Source'}
              value={medicalHistoryData.informationSource}
              onChangeText={handleHxData('informationSource')}
              onEndEditing={setIsInformationSourceError}
              autoCapitalize='none'
            />
            <InputField
              isRequired={true}
              title={'Details'}
              value={medicalHistoryData.medicalDetails}
              onChangeText={handleHxData('medicalDetails')}
              onEndEditing={setIsMedicalDetailsError}
              autoCapitalize='none'
            />
            <InputField
              isRequired={true}
              title={'Remarks'}
              value={medicalHistoryData.medicalRemarks}
              onChangeText={handleHxData('medicalRemarks')}
              onEndEditing={setIsMedicalRemarksError}
              autoCapitalize='none'
            />
            <View style={styles.dateSelectionContainer}>
              <DateInputField
                isRequired
                title={'Estimated Date'}
                mode='date'
                value={medicalHistoryData.medicalEstimatedDate}
                hideDayOfWeek={true}
                handleFormData={handleHxData('medicalEstimatedDate')}
              />
            </View>           
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

export default AddPatientMedicalHistoryModal;
