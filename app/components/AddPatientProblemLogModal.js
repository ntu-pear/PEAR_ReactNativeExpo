// Import necessary dependencies
import React, { useState, useContext } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet } from 'react-native';

// Components
import InputField from './input-components/InputField'; // Reuse your existing InputField component
import AppButton from './AppButton'; // Reuse your existing AppButton component
import AuthContext from '../auth/context';
import SelectionInputField from './input-components/SelectionInputField';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

function AddPatientProblemLogModal({ showModal, onClose, onSubmit }) {
  // Get user data from AuthContext
  const { user } = useContext(AuthContext);
  const userID = user ? user.userID : null;

  // options data
  const { data: ProblemLog } = useGetSelectionOptions('ProblemLog');

  // State for form data
  const [problemLogData, setProblemLogData] = useState({
    userID: userID,
    problemLogListDesc: 8,
    remarks: '',
  });

  // Update field values
  const handleChange = (name, value) => {
    setProblemLogData({ ...problemLogData, [name]: value });
  };

  // Reset form fields
  const resetForm = () => {
    setProblemLogData({
      userID: userID,
      problemLogListDesc: 8,
      remarks: '',
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(problemLogData);
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Add Problem Log</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            <SelectionInputField
              title="Description"
              isRequired
              dataArray={ProblemLog}
              onDataChange={(value) =>
                handleChange('problemLogListDesc', value)
              }
              value={problemLogData.problemLogListDesc}
            />
            <InputField
              title="Remarks"
              isRequired
              onChangeText={(value) => handleChange('remarks', value)}
              value={problemLogData.remarks}
              variant="multiLine"
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
            ></AppButton>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: 'green', // Adjust as needed
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

export default AddPatientProblemLogModal;
