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
import {
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
  formatDate,
} from 'app/utility/miscFunctions';

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

  let {
    albumCategoryListID,
    photoDetails,
    albumCategoryName,
    patientPhotoID,
    initialIndex,
    numPhotos,
    photoPath,
  } = props.route.params;

  const testID = `view_photo_screen_${patientID}`;

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
    const filteredData = tempData.filter((item) => {
      return item.patientPhotoID.toString() === targetPatientPhotoID;
    });

    return filteredData.map((item) => ({
      patientPhotoID: item.patientPhotoID.toString(),
      photoPath: item.photoPath?.toString() || null, // Handle null values
      albumCategoryName: item.albumCategoryName?.toString(),
      albumCategoryListID: item.albumCategoryListID.toString(),
      photoDetails: item.photoDetails?.toString() || null,
      countryListID: item.holidayExperience?.countryListID?.toString() || null,
      country: item.holidayExperience?.country?.toString() || null,
      startDate: item.holidayExperience?.startDate?.toString() || null,
      endDate: item.holidayExperience?.endDate?.toString() || null,
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

  // Show form to add problem log when add button is clicked
  const handleOnClickAddLog = () => {
    setIsModalVisible(true);
    setModalMode('add');
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

  // Edit photo
  const handleEditPhoto = (photoID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    const tempPhotoData = photoData.filter(
      (x) => x.patientPhotoID == photoID,
    )[0];

    setFormData({
      photoDetails: tempPhotoData.photoDetails,
      albumCategoryName: tempPhotoData.albumCategoryName,
      albumCategoryListID: tempPhotoData.albumCategoryListID,
      patientPhotoID: tempPhotoData.patientPhotoID,
    });
  };

  // Submit data to edit photo
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = { ...formData };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updatePatientPhoto(patientID, tempFormData);
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

  // Ask user to confirm deletion of problem log
  const handleDeletePhoto = (photoID) => {
    const tempData = photoData.filter((x) => x.patientPhotoID == photoID)[0];

    Alert.alert(
      'Are you sure you wish to delete this item?',
      `Album Name: ${tempData.albumCategoryName}\n` +
        `Description: ${tempData.photoDetails}\n`,
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

  // Delete photo
  const deletePhoto = async (photoID) => {
    setIsLoading(true);

    let tempData = { patientPhotoID: photoID };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientPhoto(tempData);
    if (result.ok) {
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully deleted photo';
    } else {
      const errors = result.data?.message;
      console.log('Error deleting photo', result);

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error deleting photo';
    }

    Alert.alert(alertTitle, alertDetails);
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
                    country={item.country}
                    startDate={item.startDate}
                    endDate={item.endDate}
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
