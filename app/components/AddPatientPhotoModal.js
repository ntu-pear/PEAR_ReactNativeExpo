// Libs
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import { VStack, Text } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import { format } from 'date-fns';

// Components
import AddEditModal from './AddEditModal';
import SelectionInputField from './input-components/SelectionInputField';
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import DateInputField from './input-components/DateInputField';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Configurations
import colors from 'app/config/colors';

function AddPatientPhotoModal({
  showModal,
  modalMode,
  formData,
  setFormData,
  onClose,
  onSubmit,
  patientID,
  albumCategoryListID,
}) {
  // Screen error state
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Options for country field
  const { data: countryOptions } = useGetSelectionOptions('Country');

  // Input error states
  const [isPhotoPathError, setIsPhotoPathError] = useState(false);
  const [isPhotoDetailsError, setIsPhotoDetailsError] = useState(false);
  const [isCountryListIDError, setIsCountryListIDError] = useState(false);
  const [isStartDateError, setIsStartDateError] = useState(false);
  const [isEndDateError, setIsEndDateError] = useState(false);

  // Update error state when inputs change
  useEffect(() => {
    setIsInputErrors(
      isPhotoPathError ||
        isPhotoDetailsError ||
        isCountryListIDError ||
        isStartDateError ||
        isEndDateError,
    );
  }, [
    isPhotoPathError,
    isPhotoDetailsError,
    isCountryListIDError,
    isStartDateError,
    isEndDateError,
  ]);

  const pickImage = (field) => async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false, // no editing, so no cropping restrictions
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImageUri = asset.uri.startsWith('file:///')
        ? asset.uri
        : 'file:///' + asset.uri.split('file:/').join('');

      const imageData = {
        uri: newImageUri,
        name: newImageUri.split('/').pop(),
        type: mime.getType(newImageUri),
      };

      setFormData((prevState) => ({
        ...prevState,
        [field]: imageData,
      }));

      console.log('Picked image data:', imageData);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      PatientPhotoID: null,
      HolidayExpID: null,
      Photo: null,
      PhotoDetails: '',
      CountryListID: 1,
      StartDate: new Date(),
      EndDate: new Date(),
      // albumCategoryListID: albumCategoryListID,
    });
    setIsPhotoPathError(false);
    setIsPhotoDetailsError(false);
    setIsCountryListIDError(false);
    setIsStartDateError(false);
    setIsEndDateError(false);
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Function to update data in formData
  const handlePhotoData = (field) => (value) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [field]: value,
      };
    });
  };

  const handleSubmit = () => {
    if (!isInputErrors && formData.Photo) {
      // Choose the correct holiday experience key based on modalMode.
      // For update/edit mode, use "HolidayExperienceUpdateDTO"; for add mode, use "HolidayExperienceAddDTO".
      const holidayKey =
        modalMode === 'update' || modalMode === 'edit'
          ? 'HolidayExperienceUpdateDTO'
          : 'HolidayExperienceAddDTO';

      const payload = {
        [holidayKey]: {
          CountryListID: formData.CountryListID || '',
          StartDate:
            formData.StartDate instanceof Date
              ? format(formData.StartDate, "yyyy-MM-dd'T'HH:mm:ss")
              : formData.StartDate || '',
          EndDate:
            formData.EndDate instanceof Date
              ? format(formData.EndDate, "yyyy-MM-dd'T'HH:mm:ss")
              : formData.EndDate || '',
        },
        PhotoDetails: formData.PhotoDetails || '',
        AlbumCategoryName: formData.AlbumCategoryName || '',
        AlbumCategoryListID: albumCategoryListID,
        PatientID: patientID,
        Photo: formData.Photo,
      };

      console.log('Payload:', payload);
      onSubmit(payload);
      onClose();
    } else {
      setIsPhotoPathError(true);
    }
  };

  const handleHolidayPhotoData = (field) => (value) => {
    if (modalMode === 'edit') {
      setFormData((prevState) => ({
        ...prevState,
        HolidayExperienceUpdateDTO: {
          ...prevState.HolidayExperienceUpdateDTO,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
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
          {/* Upload Button */}
          <AppButton
            title="Upload Photo"
            onPress={pickImage('Photo')}
            color="gray"
            isDisabled={false}
          />

          {/* Show image only if photoPath exists */}
          {formData.Photo && (
            <TouchableOpacity onPress={pickImage('Photo')}>
              <Image
                borderRadius={10}
                resizeMode="contain"
                source={{ uri: formData.Photo.uri || formData.Photo }}
                style={styles.imagePreview}
                alt="photo_image"
              />
            </TouchableOpacity>
          )}

          <InputField
            isRequired
            title="Description"
            value={formData.PhotoDetails}
            onChangeText={handlePhotoData('PhotoDetails')}
            onEndEditing={setIsPhotoDetailsError}
            autoCapitalize="none"
          />

          <SelectionInputField
            title="Country"
            value={
              modalMode === 'edit'
                ? formData.HolidayExperienceUpdateDTO?.CountryListID
                : formData.CountryListID
            }
            dataArray={countryOptions}
            onDataChange={handleHolidayPhotoData('CountryListID')}
          />

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              title="Start Date"
              value={
                modalMode === 'edit'
                  ? formData.HolidayExperienceUpdateDTO?.StartDate
                    ? new Date(formData.HolidayExperienceUpdateDTO.StartDate)
                    : new Date()
                  : formData.StartDate instanceof Date
                  ? formData.StartDate
                  : new Date(formData.StartDate)
              }
              hideDayOfWeek={true}
              handleFormData={handleHolidayPhotoData('StartDate')}
              onEndEditing={setIsStartDateError}
              // Remove minimumInputDate if not needed
              maximumInputDate={
                modalMode === 'edit'
                  ? formData.HolidayExperienceUpdateDTO?.EndDate
                    ? new Date(formData.HolidayExperienceUpdateDTO.EndDate)
                    : new Date()
                  : formData.EndDate instanceof Date
                  ? formData.EndDate
                  : new Date(formData.EndDate)
              }
            />
          </View>

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              title="End Date"
              value={
                modalMode === 'edit'
                  ? formData.HolidayExperienceUpdateDTO?.EndDate
                    ? new Date(formData.HolidayExperienceUpdateDTO.EndDate)
                    : new Date()
                  : formData.EndDate instanceof Date
                  ? formData.EndDate
                  : new Date(formData.EndDate)
              }
              hideDayOfWeek={true}
              handleFormData={handleHolidayPhotoData('EndDate')}
              onEndEditing={setIsEndDateError}
              minimumInputDate={
                modalMode === 'edit'
                  ? formData.HolidayExperienceUpdateDTO?.StartDate
                    ? new Date(formData.HolidayExperienceUpdateDTO.StartDate)
                    : new Date()
                  : formData.StartDate instanceof Date
                  ? formData.StartDate
                  : new Date(formData.StartDate)
              }
            />
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 200, // Adjust the height as needed
    borderRadius: 10,
    marginTop: 10,
  },
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientPhotoModal;
