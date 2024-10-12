import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text, Flex } from 'native-base';
import { StyleSheet } from 'react-native';

// Components
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import RadioButtonInput from './input-components/RadioButtonsInput';

// Configurations
import colors from 'app/config/colors';

function AddPatientVitalModalNEW({
  showModal,
  modalMode,
  vitalFormData,
  setVitalFormData,
  onClose,
  onSubmit,
}) {
  const [isInputErrors, setIsInputErrors] = useState(false);
  const afterMealOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isTemperatureError, setIsTemperatureError] = useState(false);
  const [isSystolicBPError, setIsSystolicBPError] = useState(false);
  const [isDiastolicBPError, setIsDiastolicBPError] = useState(false);
  const [isHeartRateError, setIsHeartRateError] = useState(false);
  const [isSpO2Error, setIsSpO2Error] = useState(false);
  const [isBloodSugarLevelError, setIsBloodSugarLevelError] = useState(false);
  const [isHeightError, setIsHeightError] = useState(false);
  const [isWeightError, setIsWeightError] = useState(false);
  const [isVitalRemarksError, setIsVitalRemarksError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isTemperatureError ||
        isSystolicBPError ||
        isDiastolicBPError ||
        isHeartRateError ||
        isSpO2Error ||
        isBloodSugarLevelError ||
        isHeightError ||
        isWeightError ||
        isVitalRemarksError,
    );
  }, [
    isTemperatureError,
    isSystolicBPError,
    isDiastolicBPError,
    isHeartRateError,
    isSpO2Error,
    isBloodSugarLevelError,
    isHeightError,
    isWeightError,
    isVitalRemarksError,
  ]);

  // Reset form to initial state
  const resetForm = () => {
    setVitalFormData({
      temperature: '',
      systolicBP: '',
      diastolicBP: '',
      heartRate: '',
      spO2: '',
      bloodSugarLevel: '',
      height: '',
      weight: '',
      vitalRemarks: '',
      afterMeal: false,
    });
    setIsTemperatureError(false);
    setIsSystolicBPError(false);
    setIsDiastolicBPError(false);
    setIsHeartRateError(false);
    setIsSpO2Error(false);
    setIsBloodSugarLevelError(false);
    setIsHeightError(false);
    setIsWeightError(false);
    setIsVitalRemarksError(false);
  };

  // When modal is closed, reset the form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Update form data as the user inputs values
  const handleVitalDataChange = (field) => (value) => {
    setVitalFormData((prevState) => ({
      ...prevState,
      [field]: field == 'vitalID' ? parseInt(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(vitalFormData);
      onClose();

      // if(!onSubmit(vitalFormData).ok){ //temp fix for onsubmit fail for 1-2m 
      //   return;
      // }
      // onClose();
    }
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="500px">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text
            style={styles.modalHeaderText}
          >{`${modalMode} Vital Data`}</Text>
        </Modal.Header>
        <Modal.Body>
          <Flex direction="row" justifyContent="space-between">
            <VStack space={4} flex={1} mr={2}>
              <InputField
                isRequired
                title="Temperature (°C)"
                keyboardType="numeric"
                value={vitalFormData.temperature}
                onChangeText={handleVitalDataChange('temperature')}
                onEndEditing={setIsTemperatureError}
                dataType={'temperature'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Systolic Blood Pressure (mmHg)"
                keyboardType="numeric"
                value={vitalFormData.systolicBP}
                onChangeText={handleVitalDataChange('systolicBP')}
                onEndEditing={setIsSystolicBPError}
                dataType={'systolicBP'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Diastolic Blood Pressure (mmHg)"
                keyboardType="numeric"
                value={vitalFormData.diastolicBP}
                onChangeText={handleVitalDataChange('diastolicBP')}
                onEndEditing={setIsDiastolicBPError}
                dataType={'diastolicBP'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="SpO2 (%)"
                keyboardType="numeric"
                value={vitalFormData.spO2}
                onChangeText={handleVitalDataChange('spO2')}
                onEndEditing={setIsSpO2Error}
                dataType={'spO2'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Blood Sugar (mmol/L)"
                keyboardType="numeric"
                value={vitalFormData.bloodSugarLevel}
                onChangeText={handleVitalDataChange('bloodSugarLevel')}
                onEndEditing={setIsBloodSugarLevelError}
                dataType={'bloodSugarLevel'}
                isInvalid={false}
              />
              <RadioButtonInput
                title={'After Meal'}
                isRequired={true}
                value={vitalFormData.afterMeal}
                dataArray={afterMealOptions}
                onChangeData={(newValue) =>
                  handleChange('afterMeal', newValue === true)
                }
              />
            </VStack>
            <VStack space={4} flex={1} ml={2}>
              <InputField
                isRequired
                title="Height (cm)"
                keyboardType="numeric"
                value={vitalFormData.height}
                onChangeText={handleVitalDataChange('height')}
                onEndEditing={setIsHeightError}
                dataType={'height'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Weight (kg)"
                keyboardType="numeric"
                value={vitalFormData.weight}
                onChangeText={handleVitalDataChange('weight')}
                onEndEditing={setIsWeightError}
                dataType={'weight'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Heart Rate (bpm)"
                keyboardType="numeric"
                value={vitalFormData.heartRate}
                onChangeText={handleVitalDataChange('heartRate')}
                onEndEditing={setIsHeartRateError}
                dataType={'heartRate'}
                isInvalid={false}
              />
              <InputField
                isRequired
                title="Remarks"
                value={vitalFormData.vitalRemarks}
                onChangeText={handleVitalDataChange('vitalRemarks')}
                onEndEditing={setIsVitalRemarksError}
                variant="multiLine"
                isInvalid={false}
              />
            </VStack>
          </Flex>
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

export default AddPatientVitalModalNEW;
