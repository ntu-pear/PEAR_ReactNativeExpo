// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import SelectionInputField from './input-components/SelectionInputField';
import DateInputField from './input-components/DateInputField';
import RadioButtonInput from './input-components/RadioButtonsInput';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import colors from 'app/config/colors';
import AddEditModal from './AddEditModal';

function AddPatientPrescriptionModal({
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
  const { data: prescriptionOptions } = useGetSelectionOptions('Prescription');

  // Options for chronic
  const chronicOptions = [
    { label: 'Short term', value: true },
    { label: 'Long Term', value: false },
    
  ];

  // Options for aftermeal
  const afterMealOptions = [
    { label: 'After Meal', value: true },
    { label: 'Before Meal', value: false },
    
  ];
  
  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isDosageError, setIsDosageError] = useState(false);
  const [isFrequencyPerDayError, setIsFrequencyPerDayError] = useState(false);
  const [isInstructionError, setIsInstructionError] = useState(false);
  const [isStartDateError, setIsStartDateError] = useState(false);
  const [isEndDateError, setIsEndDateError] = useState(false);
  const [isPrescriptionRemarksError, setIsPrescriptionRemarksError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isDosageError ||
      isFrequencyPerDayError ||
      isInstructionError ||
      isStartDateError ||
      isEndDateError || 
      isPrescriptionRemarksError ,
    );
  }, [
    isDosageError ,
    isFrequencyPerDayError ,
    isInstructionError ,
    isStartDateError ,
    isEndDateError ,
    isPrescriptionRemarksError ,
  ]);

  // Reset form
  const resetForm = () => {
    setFormData({    
      "prescriptionID": null,
      "prescriptionListID": 1,
      "dosage": "",
      "frequencyPerDay": 1,
      "isChronic": true,
      "instruction": "",
      "startDate": new Date(),
      "endDate": new Date(),
      "afterMeal": true,
      "prescriptionRemarks": "",
    });
    setIsDosageError(false);
    setIsInstructionError(false);
    setIsFrequencyPerDayError(false);
    setIsStartDateError(false);
    setIsEndDateError(false);
    setIsPrescriptionRemarksError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update  data
  const handlePrescriptionData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: field == 'prescriptionListID' ? parseInt(e) : e,
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
      modalTitle='Prescription' 
      modalContent={(
        <>
        <SelectionInputField
          isRequired
          title="Prescription"
          value={formData.prescriptionListID}
          dataArray={prescriptionOptions}
          onDataChange={handlePrescriptionData('prescriptionListID')}
        />        
        <InputField
          isRequired
          title={'Dosage'}
          value={formData.dosage}
          onChangeText={handlePrescriptionData('dosage')}
          onEndEditing={setIsDosageError}
          autoCapitalize='none'
        />
        <RadioButtonInput
          title={'To be taken'}
          isRequired={true}
          value={formData.afterMeal}
          dataArray={afterMealOptions}
          onChangeData={(newValue) => handleChange('afterMeal', newValue)}
        />
        <InputField
          isRequired
          title={'Frequency Per Day'}
          keyboardType="numeric"
          value={formData.frequencyPerDay}
          onChangeText={handlePrescriptionData('frequencyPerDay')}
          onEndEditing={setIsFrequencyPerDayError}
          autoCapitalize='none'
          dataType={'frequencyPerDay'}
          isInvalid={false}
          maxLength={2}
        />
        <RadioButtonInput
          title={'Period'}
          isRequired={true}
          value={formData.isChronic}
          dataArray={chronicOptions}
          onChangeData={(newValue) => handleChange('isChronic', newValue)}
        />
        <InputField
          isRequired
          title={'Instruction'}
          value={formData.instruction}
          onChangeText={handlePrescriptionData('instruction')}
          onEndEditing={setIsInstructionError}
          autoCapitalize='none'
        />
        <View style={styles.dateSelectionContainer}>
          <DateInputField
            isRequired
            title={'Start Date'}
            value={formData.startDate}
            hideDayOfWeek={true}
            handleFormData={handlePrescriptionData('startDate')}
            onEndEditing={setIsStartDateError}
            maximumInputDate={formData.endDate}
          />
        </View>  
        <View style={styles.dateSelectionContainer}>
          <DateInputField
            isRequired
            title={'End Date'}
            value={formData.endDate}
            hideDayOfWeek={true}
            handleFormData={handlePrescriptionData('endDate')}
            onEndEditing={setIsEndDateError}
            minimumInputDate={formData.startDate}
          />
        </View>
        <InputField
          isRequired={true}
          title={'Remarks'}
          value={formData.prescriptionRemarks}
          onChangeText={handlePrescriptionData('prescriptionRemarks')}
          onEndEditing={setIsPrescriptionRemarksError}
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

export default AddPatientPrescriptionModal;
