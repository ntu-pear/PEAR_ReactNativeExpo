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
import AddEditModal from './AddEditModal';

function AddPatientPhotoModal({
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
  const { data: photoOptions } = useGetSelectionOptions('ProblemLog');

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isPhotoPathError, setIsPhotoPathError] = useState(false);
  const [isPhotoDetailsError, setIsPhotoDetailsError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(isPhotoPathError || isPhotoDetailsError);
  }, [isPhotoPathError, isPhotoDetailsError]);

  // Reset form
  const resetForm = () => {
    setFormData({
      patientPhotoID: null,
      photoPath: null,
      photoDetails: '',
      //   albumCategoryListID: 0,
      //   patientID: 0,
      //   albumCategoryName: null,
    });
    setIsPhotoPathError(false);
    setIsPhotoDetailsError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update  data
  const handlePhotoData = (field) => (e) => {
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
      modalTitle="Photo"
      modalContent={
        <>
          {/* <SelectionInputField
            isRequired
            title="Description"
            value={formData.problemLogListID}
            dataArray={photoOptions}
            onDataChange={handleLogData('problemLogListID')}
          /> */}
          <InputField
            isRequired
            title={'Description'}
            value={formData.photoDetails}
            onChangeText={handlePhotoData('photoDetails')}
            onEndEditing={setIsPhotoDetailsError}
            autoCapitalize="none"
          />
        </>
      }
    />
  );
}

export default AddPatientPhotoModal;
