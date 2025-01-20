// // Libs
// import React from 'react';
// import { Text, View } from 'react-native';

// function PatientHolidayScreen() {
//   return (
//     <View>
//       <Text>This is PatientHolidayScreen</Text>
//     </View>
//   );
// }

// export default PatientHolidayScreen;

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
import AddButton from 'app/components/AddButton';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import DynamicTable from 'app/components/DynamicTable';
import ProblemLogItem from 'app/components/ProblemLogItem';
import AddPatientProblemLogModal from 'app/components/AddPatientProblemLogModal';
import AddPatientAlbumModal from 'app/components/AddPatientAlbumModal';
import PhotoGridItem from 'app/components/PhotoGridItem';
import HolidayItem from 'app/components/HolidayItem';

function PatientHoliday(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  let {
    albumCategoryListID,
    albumCategoryListId,
    photoDetails,
    albumCategoryName,
    patientPhotoID,
    holidayExperience,
    holidayExpID,
    countryListID,
    country,
    startDate,
    endDate,
  } = props.route.params;
  if (albumCategoryListId) {
    albumCategoryListID = albumCategoryListId;
  }

  const testID = `photo_holiday_screen_${patientID}`;

  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // Options for user to search by
  const SEARCH_OPTIONS = ['Country'];

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  // Sort options
  const SORT_OPTIONS = ['Country'];

  // // Filter options
  // const FILTER_OPTIONS = ['Date'];

  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    Country: 'country',
  };

  // Search, sort, and filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

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

  // Album data related states
  const [originalData, setOriginalData] = useState([]);
  const [photoData, setPhotoData] = useState([]);
  const [formData, setFormData] = useState({
    // for add/edit form
    photoDetails: '',
    albumCategoryName: '',
    albumCategoryListID: 1,
    patientPhotoID: 1,
    holidayExpID: 1,
    countryListID: 1,
    country: '',
    startDate: '',
    endDate: '',
  });
  const [photoCount, setPhotoCount] = useState([]);

  // const [patientAlbumIDs, setPatientAlbumIDs] = useState([]);
  const [patientPhotoIDs, setPatientPhotoIDs] = useState([]);
  const [latestPhoto, setLatestPhoto] = useState([]);

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

  // Parse photo data and group by countryListID dynamically
  const parsePhotoDataByCountryListID = (tempData) => {
    // Filter out items where holidayExperience or countryListID is missing
    const filteredData = tempData.filter(
      (item) =>
        item.holidayExperience && // Ensure holidayExperience is not null/undefined
        item.holidayExperience.countryListID != null, // Ensure countryListID exists
    );

    // Group photos by countryListID
    const groupedPhotos = filteredData.reduce((acc, item) => {
      const countryListID = item.holidayExperience.countryListID.toString();
      if (!acc[countryListID]) {
        acc[countryListID] = [];
      }
      acc[countryListID].push(item);
      return acc;
    }, {});

    // For each countryListID, select the most recent photo based on patientPhotoID
    const latestPhotos = Object.values(groupedPhotos).map((photos) => {
      return photos.reduce((latest, current) => {
        return current.patientPhotoID > latest.patientPhotoID
          ? current
          : latest;
      });
    });

    // Map the latest photos to a standardized format
    return latestPhotos.map((item) => ({
      patientID: item.patientID,
      photoPath: item.photoPath?.toString() || null,
      albumCategoryName: item.albumCategoryName?.toString() || '',
      albumCategoryListID: item.albumCategoryListID?.toString() || '',
      photoDetails: item.photoDetails?.toString() || null,
      country: item.holidayExperience.country?.toString() || '',
      countryListID: item.holidayExperience.countryListID?.toString() || '',
      startDate: item.holidayExperience.startDate || '',
      endDate: item.holidayExperience.endDate || '',
    }));
  };

  const countPhotosByCountry = (parsedData) => {
    // Count photos by countryListID
    return parsedData.reduce((acc, item) => {
      const countryListID = item.countryListID?.toString();
      if (countryListID) {
        acc[countryListID] = (acc[countryListID] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // Updated getPhotoData function
  const getPhotoData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientPhoto(patientID);
      if (response.ok) {
        const responseData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        console.log('response.data.data: ', responseData);

        // Parse photo data dynamically based on countryListID
        const parsedData = parsePhotoDataByCountryListID(responseData);

        // Use the parsedData for counting photos by country
        const photoCount = countPhotosByCountry(parsedData);

        setPhotoCount(photoCount);
        setPhotoData(parsedData);
        setOriginalData(parsedData);
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

  // Show form to add album when add button is clicked
  const handleOnClickAddLog = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add album
  const handleModalSubmitAdd = async (tempPhotoData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientPhoto(patientID, tempPhotoData);
    if (result.ok) {
      console.log('submitting album data', tempPhotoData);
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added album';
    } else {
      const errors = result.data?.message;

      console.log(result);

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error adding album';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Edit album
  const handleEditAlbum = (photoID) => {
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

      alertTitle = 'Successfully edited album';
    } else {
      const errors = result.data?.message;
      console.log('Error editing album');

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error editing album';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of album
  const handleDeleteAlbum = (photoID) => {
    const tempData = photoData.filter((x) => x.patientPhotoID == photoID)[0];

    Alert.alert(
      'Are you sure you wish to delete this item?',
      `Album Name: ${tempData.albumCategoryName}\n`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'OK', onPress: () => deleteAlbum(photoID) },
      ],
    );
  };

  // Delete album
  const deleteAlbum = async (photoID) => {
    setIsLoading(true);

    let tempData = { patientPhotoID: photoID };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientAlbum(tempData);
    if (result.ok) {
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully deleted album';
    } else {
      const errors = result.data?.message;
      console.log('Error deleting album', result);

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error deleting album';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  // Navigate to photo grid page on click album
  const onClickAlbum = () => {
    console.log('Navigating to:', routes.PATIENT_HOLIDAY_GRID);
    navigation.navigate(routes.PATIENT_HOLIDAY_GRID, {
      countryListID,
      country,
      endDate,
      startDate,
      patientID,
      albumCategoryListID,
      photoDetails,
      albumCategoryName,
      patientPhotoID,
    });
  };

  // NEED TO EDIT!!! (COME  BACK LTR)
  // Return formatted row data for table display
  // Note: keys originally ordered like ['ID', 'Author', 'Description', 'Created Datetime', 'Remarks']
  const getTableRowData = () => {
    const dataNoIDs = photoData.map(
      ({ patientID, userID, problemLogListID, ...rest }) => rest,
    );

    let tempLogData = dataNoIDs.map((item) => {
      return Object.entries(item).map(([key, value]) => {
        if (key.toLowerCase().includes('date')) {
          return formatDate(new Date(value), true);
        } else {
          return String(value); // Convert other values to strings
        }
      });
    });

    // Reordered items to have remarks before created datetime
    tempLogData = tempLogData.map((item) => {
      let temp = item[3];
      item[3] = item[4];
      item[4] = temp;

      return item;
    });

    return tempLogData;
  };

  // NEED TO EDIT!!! (COME  BACK LTR)
  // Return formatted header data for table display
  // Note: keys originally ordered like ['ID', 'Author', 'Description', 'Created Datetime', 'Remarks']
  const getTableHeaderData = () => {
    return ['ID', 'Author', 'Description', 'Remarks', 'Created Datetime'];
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      <View style={{ justifyContent: 'space-between' }}>
        <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}>
          {!isEmptyObject(patientData) ? (
            <ProfileNameButton
              testID={`${testID}_profileNameButton`}
              profilePicture={patientData.profilePicture}
              profileLineOne={patientData.preferredName}
              profileLineTwo={
                patientData.firstName + ' ' + patientData.lastName
              }
              handleOnPress={onClickProfile}
              isPatient
              isVertical={false}
              size={90}
            />
          ) : (
            <LoadingWheel />
          )}
        </View>

        <View>
          <SearchFilterBar
            originalList={originalData}
            setList={setPhotoData}
            SEARCH_OPTIONS={SEARCH_OPTIONS}
            FIELD_MAPPING={FIELD_MAPPING}
            SORT_OPTIONS={SORT_OPTIONS}
            // FILTER_OPTIONS={FILTER_OPTIONS}
            // filterOptionDetails={filterOptionDetails}
            datetime={datetime}
            setDatetime={setDatetime}
            sort={sort}
            setSort={setSort}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            itemType="albums"
            itemCount={photoData.length}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            DISPLAY_MODES={DISPLAY_MODES}
          />
        </View>
      </View>
      {console.log('Current display mode:', displayMode)}
      {console.log('Length of photoData:', photoData.length)}
      {displayMode == 'rows' ? (
        <FlatList
          onTouchStart={() => Keyboard.dismiss()}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onRefresh={refreshPhotoData}
          refreshing={isLoading}
          height={'72%'}
          ListEmptyComponent={() =>
            noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No albums found',
              true,
            )
          }
          data={photoData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.countryListID}
          renderItem={({ item }) => {
            console.log('Rendering item:', item);
            console.log('Rendering item:', item.patientPhotoID);
            console.log('Rendering item:', item.photoPath);
            console.log('Rendering item:', item.albumCategoryName);
            console.log('Rendering item:', item.photoDetails);
            console.log('Rendering photocount:', item.photoCount);
            console.log('Length of photoData INSIDE:', photoData.length);
            return (
              <Swipeable
                setIsScrolling={setIsScrolling}
                onSwipeRight={() => handleDeleteAlbum(item.patientPhotoID)}
                onSwipeLeft={() => handleEditAlbum(item.patientPhotoID)}
                underlay={<EditDeleteUnderlay />}
                item={
                  <TouchableOpacity
                    style={styles.logContainer}
                    activeOpacity={1}
                    disabled={!isScrolling}
                  >
                    <HolidayItem
                      patientID={item.patientID}
                      patientPhotoID={item.patientPhotoID}
                      photoPath={item.photoPath}
                      country={item.country || 'No Country Provided'}
                      countryListID={
                        item.countryListID || 'No Country Provided'
                      }
                      startDate={item.startDate || 'Start date not available'}
                      endDate={item.endDate || 'End date not available'}
                      photoCount={photoCount[item.countryListID] || 0}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item)}
                      handleOnPress={onClickAlbum}
                    />
                  </TouchableOpacity>
                }
              />
            );
          }}
        />
      ) : (
        <View style={{ height: '72%', marginBottom: 20, marginHorizontal: 40 }}>
          {/* <DynamicTable
            headerData={getTableHeaderData()}
            rowData={getTableRowData()}
            widthData={[200, 200, 200, 200]}
            screenName={'patient problem log'}
            onClickDelete={handleDeleteLog}
            onClickEdit={handleEditLog}
            noDataMessage={noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No problem log found',
              false,
            )}
            del={true}
            edit={true}
          /> */}
          <Text>Testing Row</Text>
        </View>
      )}
      {/* <View style={styles.addBtn}>
        <AddButton title="Add Album" onPress={handleOnClickAddLog} />
      </View>
      <AddPatientAlbumModal
        showModal={isModalVisible}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={
          modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit
        }
      /> */}
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

export default PatientHoliday;
