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

function AddPatientAlbumModal({
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
  const { data: albumOptions } = useGetSelectionOptions('AlbumCategory');

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isAlbumCategoryNameError, setIsAlbumCategoryNameError] =
    useState(false);
  const [isPatientPhotoIdError, setIsPatientPhotoIdError] = useState(false);
  const [isPhotoDetailsError, setIsPhotoDetailsError] = useState(false);
  const [isAlbumCategoryListIdError, setIsAlbumCategoryListIdError] =
    useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isAlbumCategoryNameError ||
        isPatientPhotoIdError ||
        isPhotoDetailsError ||
        isAlbumCategoryListIdError,
    );
  }, [
    isAlbumCategoryNameError,
    isPatientPhotoIdError,
    isPhotoDetailsError,
    isAlbumCategoryListIdError,
  ]);

  // Reset form
  const resetForm = () => {
    setFormData({
      patientPhotoID: 1,
      albumCategoryListID: 1,
      albumCategoryName: '',
      photoDetails: '',
    });
    setIsAlbumCategoryNameError(false);
    setIsPatientPhotoIdError(false);
    setIsPhotoDetailsError(false);
    setIsAlbumCategoryListIdError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update  data
  const handleAlbumData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: field == 'albumCategoryListID' ? parseInt(e) : e,
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
      modalTitle="Album"
      modalContent={
        <>
          <SelectionInputField
            isRequired
            title="Album Title"
            value={formData.albumCategoryListID}
            dataArray={albumOptions}
            onDataChange={handleAlbumData('albumCategoryListID')}
          />
          {albumOptions.find(
            (option) => option.id === formData.albumCategoryListID,
          )?.title === 'Others' && (
            <InputField
              isRequired
              title={'Remarks'}
              value={formData.albumCategoryName}
              onChangeText={handleAlbumData('albumCategoryName')}
              onEndEditing={setIsAlbumCategoryNameError}
              autoCapitalize="none"
            />
          )}
        </>
      }
    />
  );
}

export default AddPatientAlbumModal;
