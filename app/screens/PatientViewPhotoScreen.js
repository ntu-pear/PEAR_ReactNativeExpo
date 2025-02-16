// Libs
import React, { useContext, useState, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Utilities
import { isEmptyObject, noDataMessage } from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Auth
import AuthContext from 'app/auth/context';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import AddPatientPhotoModal from 'app/components/AddPatientPhotoModal';
import PhotoCarouselItem from 'app/components/PhotoCarouselItem';

function PatientViewPhoto(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  let { patientPhotoID, albumCategoryListID } = props.route.params;

  const testID = `view_photo_screen_${patientID}`;

  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // Search, sort, and filter related states
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Filter details related state
  // Details of filter options
  // --------------------------
  // type - chip | dropdown | autocomplete (what kind of UI/component to use to display the filter)
  // options - {} | custom dict that maps options for filtering to corresponding values in the patient data
  //                e.g.: {'Active': true, 'Inactive': false, 'All': undefined} for filter corresponding to isActive
  //                      where 'Active' filter option corresponds to isActive=true etc.
  // isFilter - whether the filter is actually to be used for filtering,
  //            since some filters like patient status may be used to make an API call instead of normal filtering
  // --------------------------
  // const [filterOptionDetails, setFilterOptionDetails] = useState({
  //   Date: {
  //     type: 'date',
  //     options: { min: {}, max: {} },
  //     isFilter: true,
  //   },
  // });

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadList, setIsReloadList] = useState(true);

  // Problem log data related states
  const [originalData, setOriginalData] = useState([]);
  const [photoData, setPhotoData] = useState([]);
  const [formData, setFormData] = useState({
    // for add/edit form
    photoDetails: '',
    albumCategoryName: '',
    albumCategoryListID: 1,
    patientPhotoID: 1,
    photoPath: '',
    holidayExperience: {
      holidayExpID: '',
      countryListID: '',
      country: '',
      startDate: '',
      endDate: '',
    },
    patientInfo: {},
  });

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadList) {
        refreshPhotoData();
        setIsReloadList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadList]),
  );

  // Memoized data refresh function
  const refreshPhotoData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await getPhotoData();
      await getPatientData();
    } catch (error) {
      console.error('Error refreshing photo data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get photo data from backend
  const getPhotoData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientPhoto(patientID);
      if (response.ok) {
        console.log('response.data.data: ', response.data.data);
        setOriginalData(
          parsePhotoData([...response.data.data], patientPhotoID),
        );
        setPhotoData(parsePhotoData([...response.data.data], patientPhotoID));

        setIsDataInitialized(true);
        setIsLoading(false);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalData([]);
        setPhotoData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  const parsePhotoData = (tempData, targetPatientPhotoID) => {
    // Filter the data to include only items matching the target patientPhotoID.
    const filteredData = tempData.filter((item) => {
      return item.patientPhotoID.toString() === targetPatientPhotoID;
    });

    // Map the filtered data to the desired format.
    return filteredData.map((item) => ({
      patientID: item.patientID,
      patientPhotoID: item.patientPhotoID.toString(),
      photoPath: item.photoPath ? item.photoPath.toString() : '',
      albumCategoryName: item.albumCategoryName
        ? item.albumCategoryName.toString()
        : '',
      albumCategoryListID: item.albumCategoryListID
        ? item.albumCategoryListID.toString()
        : '',
      photoDetails: item.photoDetails ? item.photoDetails.toString() : '',
      holidayExperience: item.holidayExperience
        ? {
            holidayExpID:
              item.holidayExperience.holidayExpID != null
                ? item.holidayExperience.holidayExpID.toString()
                : '',
            countryListID:
              item.holidayExperience.countryListID != null
                ? item.holidayExperience.countryListID.toString()
                : '',
            country: item.holidayExperience.country
              ? item.holidayExperience.country.toString()
              : '',
            startDate: item.holidayExperience.startDate
              ? item.holidayExperience.startDate.toString()
              : '',
            endDate: item.holidayExperience.endDate
              ? item.holidayExperience.endDate.toString()
              : '',
          }
        : {}, // Return an empty object if holidayExperience is missing.
    }));
  };

  // Get patient data from backend
  const getPatientData = async () => {
    if (patientID) {
      const response = await patientApi.getPatient(patientID);
      if (response.ok) {
        setPatientData(response.data.data);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setPatientData({});
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Submit data to add photo
  const handleModalSubmitAdd = async (tempPhotoData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientPhoto(patientID, tempPhotoData);
    if (result.ok) {
      console.log('submitting photo data', tempPhotoData);
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added photo';
    } else {
      const errors = result.data?.message;
      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error adding photo';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  const handleEditPhoto = (photoID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    // Find the photo data by photoID
    const tempPhotoData = photoData.find((x) => x.patientPhotoID == photoID);

    setFormData({
      PhotoDetails: tempPhotoData.photoDetails,
      AlbumCategoryListID: tempPhotoData.albumCategoryListID || '',
      AlbumCategoryName: tempPhotoData.albumCategoryListID
        ? ''
        : tempPhotoData.albumCategoryName,
      PatientPhotoID: tempPhotoData.patientPhotoID,
      Photo: tempPhotoData.photoPath,
      HolidayExperienceUpdateDTO: tempPhotoData.holidayExperience
        ? {
            HolidayExpID: tempPhotoData.holidayExperience.holidayExpID,
            CountryListID: Number(
              tempPhotoData.holidayExperience.countryListID,
            ),
            StartDate: tempPhotoData.holidayExperience.startDate,
            EndDate: tempPhotoData.holidayExperience.endDate,
          }
        : {
            HolidayExpID: '',
            CountryListID: '',
            StartDate: '',
            EndDate: '',
          },
    });
  };

  // Submit data to edit photo
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = { ...formData };
    // Log the form data before submitting it
    console.log('Submitted form data:', tempFormData);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updatePatientPhoto(patientID, tempFormData);

    console.log('Update result:', result);

    if (result.ok) {
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully edited photo';
    } else {
      const errors = result.data?.message;
      console.log('Error editing photo');

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error editing photo';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  const handleDeletePhoto = (photoID) => {
    // Find the photo data by photoID
    const tempData = photoData.find((x) => x.patientPhotoID == photoID);

    Alert.alert(
      'Are you sure you wish to delete this photo?',
      `Album: ${tempData.albumCategoryName || 'N/A'}\n` +
        `Description: ${tempData.photoDetails || 'No details'}\n`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'OK', onPress: () => deletePhoto(photoID) },
      ],
    );
  };

  const deletePhoto = async (photoID) => {
    setIsLoading(true);

    let tempData = { patientPhotoID: photoID };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientPhoto(tempData);
    if (result.ok) {
      await refreshPhotoData();
      setIsModalVisible(false);
      navigation.replace('PatientPhotoGrid', {
        patientID,
        albumCategoryListID,
      });

      alertTitle = 'Successfully deleted photo';
    } else {
      const errors = result.data?.message;
      console.log('Error deleting photo', result);
      alertDetails = result.data
        ? `\n${errors}\n\nPlease try again.`
        : 'Please try again.';
      alertTitle = 'Error deleting photo';
    }

    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      <FlatList
        onTouchStart={() => Keyboard.dismiss()}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onRefresh={refreshPhotoData}
        refreshing={isLoading}
        height={'72%'}
        ListEmptyComponent={() =>
          noDataMessage(statusCode, isLoading, isError, 'No albums found', true)
        }
        data={photoData}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.patientPhotoID.toString()}
        renderItem={({ item }) => {
          return (
            <Swipeable
              setIsScrolling={setIsScrolling}
              item={
                <TouchableOpacity
                  style={styles.logContainer}
                  activeOpacity={1}
                  disabled={!isScrolling}
                >
                  <PhotoCarouselItem
                    patientPhotoID={item.patientPhotoID.toString()}
                    photoPath={item.photoPath}
                    albumCategoryName={item.albumCategoryName}
                    photoDetails={item.photoDetails}
                    patientID={item.patientID}
                    country={item.holidayExperience.country}
                    startDate={item.holidayExperience.startDate}
                    endDate={item.holidayExperience.endDate}
                    onDelete={() => handleDeletePhoto(item.patientPhotoID)}
                    onEdit={() => handleEditPhoto(item.patientPhotoID)}
                  />
                </TouchableOpacity>
              }
            />
          );
        }}
      />
      <AddPatientPhotoModal
        showModal={isModalVisible}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={
          modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white_var1,
  },
  logContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addBtn: {
    marginTop: '0.01%',
  },
});

export default PatientViewPhoto;
