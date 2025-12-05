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
import { Button } from 'react-native-paper';

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

  let {
    patientPhotoID,
    albumCategoryListID,
    countryListID,
    startDate,
    endDate,
    previousScreen,
  } = props.route.params;

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

  // Refresh list when new photo is added or user requests refresh
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
    if (photoID) {
      const response = await patientApi.getPatientPhotoV1(patientPhotoID);
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
        : {},
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

    const result = await patientApi.addPatientPhotoV1(patientID, tempPhotoData);
    if (result.ok) {
      console.log('Submitting photo data', tempPhotoData);
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

  const handleEditPhoto = (patientID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    // Find the photo data by patientID
    const tempPhotoData = photoData.find((x) => x.patientID == patientID);


    setFormData({
      PhotoDetails: tempPhotoData.photoDetails,
      AlbumCategoryListID: tempPhotoData.albumCategoryListID || '',
      AlbumCategoryName: tempPhotoData.albumCategoryListID
        ? ''
        : tempPhotoData.albumCategoryName,
      PatientPhotoID: tempPhotoData.patientPhotoID,
      Photo: tempPhotoData.photoPath,
      // Populate the nested holiday experience data.
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
      // Set the IsHoliday flag based on whether holiday experience data exists
      IsHoliday:
        tempPhotoData.holidayExperience &&
        Object.keys(tempPhotoData.holidayExperience).length > 0,
    });
  };

  // Submit data to edit photo
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = { ...formData };
    console.log('FormData before submission:', tempFormData);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updatePatientPhotoV1(patientID, tempFormData);

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

  const handleDeletePhoto = (patientID) => {
    // Find the photo data by patientID
    const tempData = photoData.find((x) => x.patientID == patientID);

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
        { text: 'OK', onPress: () => deletePhoto(patientID) },
      ],
    );
  };

  const deletePhoto = async (patientID) => {
    setIsLoading(true);

    let tempData = { patientID: patientID };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientPhotoV1(tempData);
    if (result.ok) {
      await refreshPhotoData();
      setIsModalVisible(false);

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
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      {photoData.length > 0 && (
        <>
          <PhotoCarouselItem photoPath={photoData[0].photoPath} />
          <View style={styles.detailsContainer}>
            {photoData[0].albumCategoryName && (
              <Text style={styles.boldText}>
                Album:{' '}
                <Text style={styles.normalText}>
                  {photoData[0].albumCategoryName}
                </Text>
              </Text>
            )}
            {photoData[0].photoDetails && (
              <Text style={styles.boldText}>
                Details:{' '}
                <Text style={styles.normalText}>
                  {photoData[0].photoDetails}
                </Text>
              </Text>
            )}
            {photoData[0].holidayExperience.country && (
              <Text style={styles.boldText}>
                Country:{' '}
                <Text style={styles.normalText}>
                  {photoData[0].holidayExperience.country}
                </Text>
              </Text>
            )}
            {photoData[0].holidayExperience.startDate && (
              <Text style={styles.boldText}>
                Start Date:{' '}
                <Text style={styles.normalText}>
                  {formatDate(photoData[0].holidayExperience.startDate)}
                </Text>
              </Text>
            )}
            {photoData[0].holidayExperience.endDate && (
              <Text style={styles.boldText}>
                End Date:{' '}
                <Text style={styles.normalText}>
                  {formatDate(photoData[0].holidayExperience.endDate)}
                </Text>
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => handleEditPhoto(photoData[0].patientID)}
              style={[
                styles.button,
                { borderColor: colors.green, borderWidth: 2 },
              ]}
              labelStyle={{ color: colors.green }}
              contentStyle={styles.buttonContent}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeletePhoto(photoData[0].patientID)}
              style={[
                styles.button,
                { borderColor: colors.pink, borderWidth: 2 },
              ]}
              labelStyle={{ color: colors.pink }}
              contentStyle={styles.buttonContent}
            >
              Delete
            </Button>
          </View>
        </>
      )}
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
    flex: 1,
    backgroundColor: colors.white,
  },
  detailsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 20, // Add some bottom margin for spacing
  },
  button: {
    marginHorizontal: 5,
  },
  buttonContent: {
    marginVertical: -5,
    marginHorizontal: -10,
  },
});

export default PatientViewPhoto;
