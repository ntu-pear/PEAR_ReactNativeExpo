// // Libs
// import React, { useEffect, useState } from 'react';
// import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
// import { VStack, Text } from 'native-base';
// import * as ImagePicker from 'expo-image-picker';
// import mime from 'mime';

// // Components
// import AddEditModal from './AddEditModal';
// import SelectionInputField from './input-components/SelectionInputField';
// import InputField from './input-components/InputField';
// import AppButton from './AppButton';
// import DateInputField from './input-components/DateInputField';

// // Hooks
// import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// // Configurations
// import colors from 'app/config/colors';

// function AddPatientPhotoModal({
//   showModal,
//   modalMode,
//   formData,
//   setFormData,
//   onClose,
//   onSubmit,
//   patientID,
//   albumCategoryListID,
// }) {
//   // Screen error state
//   const [isInputErrors, setIsInputErrors] = useState(false);

//   // Options for country field
//   const { data: countryOptions } = useGetSelectionOptions('Country');

//   // Input error states
//   const [isPhotoPathError, setIsPhotoPathError] = useState(false);
//   const [isPhotoDetailsError, setIsPhotoDetailsError] = useState(false);
//   const [isCountryListIDError, setIsCountryListIDError] = useState(false);
//   const [isStartDateError, setIsStartDateError] = useState(false);
//   const [isEndDateError, setIsEndDateError] = useState(false);

//   // Update error state when inputs change
//   useEffect(() => {
//     setIsInputErrors(
//       isPhotoPathError ||
//         isPhotoDetailsError ||
//         isCountryListIDError ||
//         isStartDateError ||
//         isEndDateError,
//     );
//   }, [
//     isPhotoPathError,
//     isPhotoDetailsError,
//     isCountryListIDError,
//     isStartDateError,
//     isEndDateError,
//   ]);

//   // Function to launch image picker and handle image picking.
//   // Reference: https://docs.expo.dev/versions/latest/sdk/imagepicker/
//   const pickImage = (input) => async () => {
//     // No permissions request is necessary for launching the image library
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });
//     if (!result.canceled) {
//       const newImageUri = 'file:///' + result.uri.split('file:/').join('');

//       var newData = formData['patientInfo'];
//       newData[input] = {
//         uri: newImageUri,
//         name: newImageUri.split('/').pop(),
//         type: mime.getType(newImageUri),
//       };

//       setFormData((prevState) => ({
//         ...prevState,
//         ['patientInfo']: newData,
//       }));

//       console.log(newData);
//     }
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       patientPhotoID: null,
//       photoPath: null,
//       photoDetails: '',
//       countryListID: 1,
//       startDate: new Date(),
//       endDate: new Date(),
//     });
//     setIsPhotoPathError(false);
//     setIsPhotoDetailsError(false);
//     setIsCountryListIDError(false);
//     setIsStartDateError(false);
//     setIsEndDateError(false);
//   };

//   // Reset form when modal is closed
//   useEffect(() => {
//     if (!showModal) {
//       resetForm();
//     }
//   }, [showModal]);

//   // // Function to update data
//   // const handlePhotoData = (field) => (e) => {
//   //   setFormData((prevState) => ({
//   //     ...prevState,
//   //     [field]: e,
//   //   }));
//   // };

//   // Function to update data
//   const handlePhotoData = (field) => (value) => {
//     setFormData((prevState) => {
//       // If field is "photoPath" (the image object)
//       if (field === 'photoPath' && value && value.uri) {
//         // Ensure the URI is properly formatted
//         const formattedUri = value.uri.startsWith('file:///')
//           ? value.uri
//           : `file://${value.uri}`;
//         return {
//           ...prevState,
//           photoPath: { ...value, uri: formattedUri },
//         };
//       }
//       // If the field should be a number, convert it.
//       if (field === 'albumCategoryListID') {
//         return {
//           ...prevState,
//           [field]: Number(value),
//         };
//       }
//       // For nested fields (for example, fields in HolidayExperience),
//       // you might call this function separately or handle it in a similar manner.
//       // Otherwise, update the field directly.
//       return {
//         ...prevState,
//         [field]: value,
//       };
//     });
//   };

//   const handleSubmit = () => {
//     if (!isInputErrors && formData.photoPath) {
//       onSubmit(formData);
//       onClose();
//     } else {
//       setIsPhotoPathError(true);
//     }
//   };

//   return (
//     <AddEditModal
//       handleSubmit={handleSubmit}
//       isInputErrors={isInputErrors}
//       modalMode={modalMode}
//       onClose={onClose}
//       showModal={showModal}
//       modalTitle="Photo"
//       modalContent={
//         <>
//           {/* Upload Button */}
//           <AppButton
//             title="Upload Photo"
//             onPress={pickImage}
//             color="gray"
//             isDisabled={false}
//           />

//           {/* Show image only if photoPath exists */}
//           {formData.photoPath && (
//             <TouchableOpacity onPress={pickImage}>
//               <Image
//                 borderRadius={10}
//                 resizeMode="contain"
//                 // Here we create a valid source object using the URL string
//                 source={{ uri: formData.photoPath }}
//                 style={styles.imagePreview}
//                 alt="photo_image"
//               />
//             </TouchableOpacity>
//           )}
//           <InputField
//             isRequired
//             title="Description"
//             value={formData.photoDetails}
//             onChangeText={handlePhotoData('photoDetails')}
//             onEndEditing={setIsPhotoDetailsError}
//             autoCapitalize="none"
//           />
//           <SelectionInputField
//             // isRequired
//             title="Country"
//             value={formData.countryListID}
//             dataArray={countryOptions}
//             onDataChange={handlePhotoData('countryListID')}
//           />
//           <View style={styles.dateSelectionContainer}>
//             <DateInputField
//               // isRequired
//               title={'Start Date'}
//               value={formData.startDateTime}
//               hideDayOfWeek={true}
//               handleFormData={handlePhotoData('startDate')}
//               onEndEditing={setIsStartDateError}
//               minimumInputDate={new Date()}
//               maximumInputDate={formData.endDateTime}
//             />
//           </View>
//           <View style={styles.dateSelectionContainer}>
//             <DateInputField
//               // isRequired
//               title={'End Date'}
//               value={formData.endDateTime}
//               hideDayOfWeek={true}
//               handleFormData={handlePhotoData('endDate')}
//               onEndEditing={setIsEndDateError}
//               minimumInputDate={formData.startDateTime}
//             />
//           </View>
//         </>
//       }
//     />
//   );
// }

// const styles = StyleSheet.create({
//   imagePreview: {
//     width: '100%',
//     height: 200, // Dynamically adjust height in the UI
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   dateSelectionContainer: {
//     width: '100%',
//   },
// });

// export default AddPatientPhotoModal;

// Libs
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import { VStack, Text } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';

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

  // Updated function to launch image picker and handle image picking.
  const pickImage = (field) => async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Use the first asset from the assets array
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

  // const pickImage = (field) => async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets && result.assets.length > 0) {
  //     const asset = result.assets[0];
  //     // Force the URI to use five slashes: "file://///"
  //     const newImageUri = asset.uri.replace(/^file:\/+/, 'file://///');

  //     const imageData = {
  //       uri: newImageUri,
  //       name: newImageUri.split('/').pop(),
  //       type: mime.getType(newImageUri),
  //     };

  //     setFormData((prevState) => ({
  //       ...prevState,
  //       [field]: imageData,
  //     }));

  //     console.log('Picked image data:', imageData);
  //   }
  // };

  // Reset form
  const resetForm = () => {
    setFormData({
      Photo: null,
      PhotoDetails: '',
      CountryListID: 1,
      StartDate: new Date(),
      EndDate: new Date(),
      // You can include albumCategoryListID here if needed:
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
      // // If field is "photoPath" (the image object)
      // if (field === 'Photo' && value && value.uri) {
      //   // Ensure the URI is properly formatted
      //   const formattedUri = value.uri.startsWith('file:///')
      //     ? value.uri
      //     : `file://${value.uri}`;
      //   return {
      //     ...prevState,
      //     Photo: { ...value, uri: formattedUri },
      //   };
      // }
      // // If the field should be a number, convert it.
      // if (field === 'AlbumCategoryListID') {
      //   return {
      //     ...prevState,
      //     [field]: Number(value),
      //   };
      // }
      // Otherwise, update the field directly.
      return {
        ...prevState,
        [field]: value,
      };
    });
  };

  const handleSubmit = () => {
    if (!isInputErrors && formData.Photo) {
      // Prepare payload matching the expected POST structure:
      const payload = {
        HolidayExperience: {
          CountryListID: formData.CountryListID,
          StartDate: formData.StartDate,
          EndDate: formData.EndDate,
        },
        PhotoDetails: formData.PhotoDetails,
        AlbumCategoryListID: albumCategoryListID, // from props
        PatientID: patientID, // from props
        // Optionally include photoPath if your API requires the image data:
        Photo: formData.Photo,
      };
      console.log('Payload:', payload);

      onSubmit(payload);
      onClose();
    } else {
      setIsPhotoPathError(true);
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
            value={formData.CountryListID}
            dataArray={countryOptions}
            onDataChange={handlePhotoData('CountryListID')}
          />

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              title="Start Date"
              value={formData.StartDate}
              hideDayOfWeek={true}
              handleFormData={handlePhotoData('StartDate')}
              onEndEditing={setIsStartDateError}
              minimumInputDate={new Date()}
              maximumInputDate={formData.EndDate}
            />
          </View>

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              title="End Date"
              value={formData.EndDate}
              hideDayOfWeek={true}
              handleFormData={handlePhotoData('EndDate')}
              onEndEditing={setIsEndDateError}
              minimumInputDate={formData.StartDate}
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
