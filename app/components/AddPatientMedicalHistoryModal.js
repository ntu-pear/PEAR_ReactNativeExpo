// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import DateInputField from './input-components/DateInputField';
import AddEditModal from './AddEditModal';

// Configurations
import colors from 'app/config/colors';

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
    setFormData({
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
    setFormData((prevState) => ({
      ...prevState,
      [field]: e,
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
      modalTitle='Medical History'
      modalContent={(
        <>
        <InputField
          isRequired={true}
          title={'Source'}
          value={formData.informationSource}
          onChangeText={handleHxData('informationSource')}
          onEndEditing={setIsInformationSourceError}
        />
        <InputField
          isRequired={true}
          title={'Details'}
          value={formData.medicalDetails}
          onChangeText={handleHxData('medicalDetails')}
          onEndEditing={setIsMedicalDetailsError}
        />
        <InputField
          isRequired={true}
          title={'Remarks'}
          value={formData.medicalRemarks}
          onChangeText={handleHxData('medicalRemarks')}
          onEndEditing={setIsMedicalRemarksError}
        />
        <View style={styles.dateSelectionContainer}>
          <DateInputField
            isRequired
            title={'Estimated Date'}
            mode='date'
            value={formData.medicalEstimatedDate}
            hideDayOfWeek={true}
            handleFormData={handleHxData('medicalEstimatedDate')}
            maximumInputDate={new Date()}
          />
          </View>
        </>
      )}
      />
  );
}

const styles = StyleSheet.create({
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientMedicalHistoryModal;
