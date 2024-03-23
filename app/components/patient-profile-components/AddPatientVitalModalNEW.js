// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text, Checkbox, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';

// Components
import InputField from '../input-components/InputField';
import AppButton from '../AppButton';
import SelectionInputField from '../input-components/SelectionInputField'; // Assuming you have or will implement this for selections if needed

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
  // Handle form data changes, assuming all fields are directly edited on the vitalFormData object
  const handleVitalDataChange = (field, value) => {
    setVitalFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Reset form to initial state when modal is closed or after successful data submission
  useEffect(() => {
    if (!showModal) {
      setVitalFormData({
        temperature: '',
        weight: '',
        height: '',
        systolicBP: '',
        diastolicBP: '',
        heartRate: '',
        spO2: '',
        bloodSugarLevel: '',
        afterMeal: false,
        vitalRemarks: '',
      });
    }
  }, [showModal, setVitalFormData]);

  return (
    <Modal isOpen={showModal} onClose={onClose} size="lg">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{modalMode} Patient Vital</Modal.Header>
        <ScrollView>
          <Modal.Body>
            <VStack space={4}>
              <InputField
                label="Temperature (°C)"
                value={vitalFormData.temperature}
                onChangeText={(value) =>
                  handleVitalDataChange('temperature', value)
                }
              />
              <InputField
                label="Weight (kg)"
                value={vitalFormData.weight}
                onChangeText={(value) => handleVitalDataChange('weight', value)}
              />
              {/* Add other vital sign input fields in a similar pattern */}
              <InputField
                label="Remarks"
                value={vitalFormData.vitalRemarks}
                onChangeText={(value) =>
                  handleVitalDataChange('vitalRemarks', value)
                }
                multiline
              />
              <Checkbox
                isChecked={vitalFormData.afterMeal}
                onChange={() =>
                  handleVitalDataChange('afterMeal', !vitalFormData.afterMeal)
                }
                value="afterMeal"
              >
                <Text ml={2}>After Meal</Text>
              </Checkbox>
            </VStack>
          </Modal.Body>
        </ScrollView>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton title="Cancel" onPress={onClose} />
            <AppButton title="Submit" onPress={onSubmit} />
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
