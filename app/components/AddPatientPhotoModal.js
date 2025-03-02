// Libs
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import { format } from 'date-fns';

// Components
import AddEditModal from 'app/components/AddEditModal';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import InputField from 'app/components/input-components/InputField';
import AppButton from 'app/components/AppButton';
import DateInputField from 'app/components/input-components/DateInputField';
import SingleOptionCheckBox from 'app/components/input-components/SingleOptionCheckBox';

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

  // Options for album field
  const seededAlbums = [
    { AlbumCategoryListID: '1', AlbumCategoryName: 'Family' },
    { AlbumCategoryListID: '2', AlbumCategoryName: 'Friends' },
    { AlbumCategoryListID: '4', AlbumCategoryName: 'Pet' },
    { AlbumCategoryListID: '5', AlbumCategoryName: 'Food' },
    { AlbumCategoryListID: '6', AlbumCategoryName: 'Activity' },
  ];

  const albumOptions = seededAlbums.map((album) => ({
    label: album.AlbumCategoryName,
    value: album.AlbumCategoryListID, // now a string
  }));

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
      allowsEditing: false,
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

  const resetForm = () => {
    setFormData({
      PatientPhotoID: null,
      HolidayExpID: null,
      Photo: null,
      PhotoDetails: '',
      CountryListID: 1,
      StartDate: new Date(),
      EndDate: new Date(),
      AlbumCategoryListID: '1',
      AlbumCategoryName: '',
      HolidayExperience: {
        HolidayExpID: '',
        CountryListID: 1,
        StartDate: new Date(),
        EndDate: new Date(),
      },
      HolidayExperienceUpdateDTO: null,
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

  const handlePhotoData = (field) => (value) => {
    if (field === 'AlbumCategoryListID') {
      const selectedAlbum = seededAlbums.find(
        (album) => album.AlbumCategoryListID === value,
      );
      setFormData((prevState) => ({
        ...prevState,
        AlbumCategoryListID: value,
        AlbumCategoryName: selectedAlbum ? selectedAlbum.AlbumCategoryName : '',
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleSubmit = () => {
    if (!isInputErrors && formData.Photo) {
      const holidayKey =
        modalMode === 'update' || modalMode === 'edit'
          ? 'HolidayExperienceUpdateDTO'
          : 'HolidayExperienceAddDTO';

      const holidayPayload = formData.IsHoliday
        ? {
            CountryListID:
              formData[holidayKey]?.CountryListID ||
              formData.CountryListID ||
              '',
            StartDate:
              formData[holidayKey]?.StartDate instanceof Date
                ? format(
                    formData[holidayKey].StartDate,
                    "yyyy-MM-dd'T'HH:mm:ss",
                  )
                : formData[holidayKey]?.StartDate || '',
            EndDate:
              formData[holidayKey]?.EndDate instanceof Date
                ? format(formData[holidayKey].EndDate, "yyyy-MM-dd'T'HH:mm:ss")
                : formData[holidayKey]?.EndDate || '',
          }
        : {};

      // Decide which AlbumCategoryListID to submit.
      const albumIdToSubmit =
        albumCategoryListID != null
          ? albumCategoryListID
          : formData.AlbumCategoryListID;

      const payload = {
        [holidayKey]: holidayPayload,
        PhotoDetails: formData.PhotoDetails || '',
        AlbumCategoryListID: albumIdToSubmit,
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
    setFormData((prevState) => ({
      ...prevState,
      HolidayExperienceUpdateDTO: {
        ...prevState.HolidayExperienceUpdateDTO,
        [field]: value,
      },
      HolidayExperienceAddDTO: {
        ...prevState.HolidayExperienceAddDTO,
        [field]: value,
      },
    }));
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
          <AppButton
            title="Upload Photo"
            onPress={pickImage('Photo')}
            color={colors.grey}
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

          {albumCategoryListID == null && (
            <SelectionInputField
              isRequired
              title="Album"
              value={formData.AlbumCategoryListID}
              dataArray={albumOptions}
              onDataChange={handlePhotoData('AlbumCategoryListID')}
            />
          )}

          <InputField
            isRequired
            title="Description"
            value={formData.PhotoDetails}
            onChangeText={handlePhotoData('PhotoDetails')}
            onEndEditing={setIsPhotoDetailsError}
            autoCapitalize="none"
          />
          <View style={{ marginVertical: 8 }} />
          <SingleOptionCheckBox
            testID="holiday_check_box"
            title="Is this photo part of a holiday?"
            value={formData.IsHoliday}
            onChangeData={(value) =>
              setFormData((prevState) => ({
                ...prevState,
                IsHoliday: value,
                HolidayExperienceUpdateDTO: value
                  ? prevState.HolidayExperienceUpdateDTO
                  : null,
                HolidayExperienceAddDTO: value
                  ? prevState.HolidayExperienceAddDTO
                  : null,
                CountryListID: value
                  ? prevState.CountryListID ||
                    prevState.HolidayExperienceAddDTO?.CountryListID ||
                    ''
                  : null,
                StartDate: value
                  ? prevState.StartDate ||
                    prevState.HolidayExperienceAddDTO?.StartDate ||
                    ''
                  : null,
                EndDate: value
                  ? prevState.EndDate ||
                    prevState.HolidayExperienceAddDTO?.EndDate ||
                    ''
                  : null,
              }))
            }
          />

          {formData.IsHoliday ? (
            <>
              <SelectionInputField
                title="Country"
                value={
                  formData.HolidayExperienceUpdateDTO?.CountryListID ||
                  formData.HolidayExperienceAddDTO?.CountryListID
                }
                dataArray={countryOptions}
                onDataChange={handleHolidayPhotoData('CountryListID')}
              />

              <View style={styles.dateSelectionContainer}>
                <DateInputField
                  title="Start Date"
                  value={
                    formData.HolidayExperienceUpdateDTO?.StartDate
                      ? new Date(formData.HolidayExperienceUpdateDTO.StartDate)
                      : formData.HolidayExperienceAddDTO?.StartDate
                      ? new Date(formData.HolidayExperienceAddDTO.StartDate)
                      : new Date()
                  }
                  hideDayOfWeek={true}
                  handleFormData={handleHolidayPhotoData('StartDate')}
                  onEndEditing={setIsStartDateError}
                />
              </View>

              <View style={styles.dateSelectionContainer}>
                <DateInputField
                  title="End Date"
                  value={
                    formData.HolidayExperienceUpdateDTO?.EndDate
                      ? new Date(formData.HolidayExperienceUpdateDTO.EndDate)
                      : formData.HolidayExperienceAddDTO?.EndDate
                      ? new Date(formData.HolidayExperienceAddDTO.EndDate)
                      : new Date()
                  }
                  hideDayOfWeek={true}
                  handleFormData={handleHolidayPhotoData('EndDate')}
                  onEndEditing={setIsEndDateError}
                  minimumInputDate={
                    formData.HolidayExperienceUpdateDTO?.StartDate
                      ? new Date(formData.HolidayExperienceUpdateDTO.StartDate)
                      : formData.HolidayExperienceAddDTO?.StartDate
                      ? new Date(formData.HolidayExperienceAddDTO.StartDate)
                      : new Date()
                  }
                />
              </View>
            </>
          ) : null}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientPhotoModal;
