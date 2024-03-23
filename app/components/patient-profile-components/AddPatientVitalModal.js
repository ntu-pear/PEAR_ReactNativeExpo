// Import necessary dependencies
import React, { useState } from 'react';
import { Modal, Button, VStack, Text, HStack } from 'native-base';
import { StyleSheet } from 'react-native';
import AppButton from '../AppButton';
import InputField from '../input-components/InputField';
import RadioButtonInput from '../input-components/RadioButtonsInput';

function AddPatientVitalModal({ showModal, onClose, onSubmit }) {
  // State to hold form data
  const initialVitalData = {
    temperature: '',
    weight: '',
    height: '',
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    spO2: '',
    bloodSugarlevel: '',
    vitalRemarks: '',
    afterMeal: true,
  };

  const [vitalData, setVitalData] = useState(initialVitalData);
  const afterMealOptions = [
    { label: 'yes', value: true },
    { label: 'no', value: false },
  ];

  // Update field values
  const handleChange = (name, value) => {
    setVitalData({ ...vitalData, [name]: value });
  };

  const resetForm = () => {
    setVitalData(initialVitalData);
  };

  // Handle form submission
  const handleSubmit = () => {
    const submittedData = {
      ...vitalData,
      temperature: parseFloat(vitalData.temperature),
      systolicBP: parseInt(vitalData.systolicBP, 10),
      weight: parseFloat(vitalData.weight),
      height: parseFloat(vitalData.height),
      diastolicBP: parseInt(vitalData.diastolicBP, 10),
      heartRate: parseInt(vitalData.heartRate, 10),
      spO2: parseInt(vitalData.spO2, 10),
      bloodSugarlevel: parseInt(vitalData.bloodSugarlevel, 10),
    };

    onSubmit(submittedData);
    resetForm();
    onClose(); // Close the modal
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={showModal} onClose={handleClose}>
      <Modal.Content maxWidth="500px">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Add Vital</Text>
        </Modal.Header>
        <Modal.Body>
          <HStack space={4} alignItems="flex-start">
            {/* Column 1 */}
            <VStack space={5} flex={1}>
              <InputField
                title={'Temperature (°C)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('temperature', value)}
                value={vitalData.temperature}
              />
              <InputField
                title={'Systolic BP (mmHg)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('systolicBP', value)}
                value={vitalData.systolicBP}
              />
              <InputField
                title={'Diastolic BP (mmHg)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('diastolicBP', value)}
                value={vitalData.diastolicBP}
              />
              <InputField
                title={'SpO2 (%)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('spO2', value)}
                value={vitalData.spO2}
              />
              <InputField
                title={'Blood Sugar Level (mmol/L)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('bloodSugarlevel', value)}
                value={vitalData.bloodSugarlevel}
              />
              <RadioButtonInput
                title={'After Meal'}
                isRequired={true}
                value={vitalData.afterMeal}
                dataArray={afterMealOptions}
                onChangeData={(newValue) =>
                  handleChange('afterMeal', newValue === true)
                }
              />
            </VStack>
            {/* Column 2 */}
            <VStack space={4} flex={1}>
              <InputField
                title={'Height (m)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('height', value)}
                value={vitalData.height}
              />
              <InputField
                title={'Weight (kg)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('weight', value)}
                value={vitalData.weight}
              />
              <InputField
                title={'Heart Rate BP (bpm)'}
                isRequired
                keyboardType="numeric"
                type="number"
                onChangeText={(value) => handleChange('heartRate', value)}
                value={vitalData.heartRate}
              />
              <InputField
                isRequired
                title={'Remarks'}
                value={vitalData.vitalRemarks}
                onChangeText={(value) => handleChange('vitalRemarks', value)}
                variant={'multiLine'}
                hideError={true}
              />
            </VStack>
          </HStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton color="red" title="Cancel" onPress={onClose}></AppButton>
            <AppButton
              onPress={handleSubmit}
              title="Submit"
              color="green"
            ></AppButton>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: 'green', // Change to your preferred green color
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    color: 'white', // Text color
    fontSize: 18, // Adjust font size as needed
    fontweight: 'bold', // Optional: if you want the text to be bold
    textTransform: 'uppercase',
  },
});

export default AddPatientVitalModal;
