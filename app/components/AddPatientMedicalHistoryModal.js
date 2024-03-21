// Import necessary dependencies
import React, { useState } from 'react';
import { Modal, Button, VStack, Text, HStack } from 'native-base';
import { StyleSheet } from 'react-native';

// Adding Components
import AppButton from './AppButton';
import InputField from './input-components/InputField';
import DateInputField from './input-components/DateInputField';

function AddPatientMedicalHistoryModal({ showModal, onClose, onSubmit }) {
  // Initial state for form data
  const initialMedicalData = {
    medicalDetails: '',
    informationSource: '',
    medicalRemarks: '',
    medicalEstimatedDate: new Date(),
  };

  const [medicalData, setMedicalData] = useState(initialMedicalData);

  // Update field values
  const handleChange = (name, value) => {
    setMedicalData({ ...medicalData, [name]: value });
  };

  // Reset form to initial state
  const resetForm = () => {
    setMedicalData(initialMedicalData);
  };

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(medicalData);
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
          <Text style={styles.modalHeaderText}>Add Medical History</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            <DateInputField
              title={'Medical Estimated Date'}
              hideDayOfWeek={true}
              isRequired={true}
              mode={'date'}
              selectionMode={'default'}
              handleFormData={(selectedDate) =>
                handleChange('medicalEstimatedDate', selectedDate)
              }
              value={medicalData.medicalEstimatedDate}
              allowNull={false}
            />
            <InputField
              isRequired
              title={'Medical Details'}
              keyboardType="default"
              onChangeText={(value) => handleChange('medicalDetails', value)}
              value={medicalData.medicalDetails}
            />
            <InputField
              title={'Information Source'}
              isRequired
              onChangeText={(value) => handleChange('informationSource', value)}
              value={medicalData.informationSource}
              variant={'multiLine'}
            />
            <InputField
              isRequired
              title={'Remarks'}
              onChangeText={(value) => handleChange('medicalRemarks', value)}
              value={medicalData.medicalRemarks}
              variant={'multiLine'}
            />
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton title="Cancel" onPress={onClose} color="red"></AppButton>
            <AppButton
              title="Submit"
              onPress={handleSubmit}
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
    backgroundColor: 'green', // Use your theme green color here
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default AddPatientMedicalHistoryModal;
