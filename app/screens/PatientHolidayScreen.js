// Libs
import React, { useState } from 'react';
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
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import AddPatientPhotoModal from 'app/components/AddPatientPhotoModal';
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
    countryListID,
    country,
    startDate,
    endDate,
    holidayExperience,
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
    holidayExperience: {
      holidayExpID: '',
      countryListID: '',
      country: '',
      startDate: '',
      endDate: '',
    },
  });
  const [photoCount, setPhotoCount] = useState([]);

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  // Refresh list when new holiday is added or user requests refresh
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

  const parsePhotoDataByCountryListID = (tempData) => {
    // Filter out items where holidayExperience or countryListID is missing
    const filteredData = tempData.filter(
      (item) =>
        item.holidayExperience && // Ensure holidayExperience exists
        item.holidayExperience.countryListID != null, // Ensure countryListID exists
    );

    // Group photos by countryListID, formatted startDate, and formatted endDate
    const groupedPhotos = filteredData.reduce((acc, item) => {
      const countryListID = item.holidayExperience.countryListID.toString();

      // For grouping, format the date to just the date portion (YYYY-MM-DD)
      const rawStartDate = item.holidayExperience.startDate || 'N/A';
      const rawEndDate = item.holidayExperience.endDate || 'N/A';
      const formattedStartDate =
        rawStartDate !== 'N/A' ? rawStartDate.split('T')[0] : 'N/A';
      const formattedEndDate =
        rawEndDate !== 'N/A' ? rawEndDate.split('T')[0] : 'N/A';

      // Create a composite key using the formatted dates
      const groupKey = `${countryListID}_${formattedStartDate}_${formattedEndDate}`;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});

    // For each group, select the most recent photo based on patientPhotoID
    const latestPhotos = Object.values(groupedPhotos).map((photos) =>
      photos.reduce((latest, current) =>
        current.patientPhotoID > latest.patientPhotoID ? current : latest,
      ),
    );

    return latestPhotos.map((item) => ({
      patientID: item.patientID,
      patientPhotoID: item.patientPhotoID.toString(),
      photoPath: item.photoPath?.toString() || null,
      albumCategoryName: item.albumCategoryName?.toString() || '',
      albumCategoryListID: item.albumCategoryListID?.toString() || '',
      photoDetails: item.photoDetails?.toString() || null,
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
            country: item.holidayExperience.country?.toString() || '',
            // Keep the original full dates (with time) for submission
            startDate: item.holidayExperience.startDate
              ? item.holidayExperience.startDate.toString()
              : 'N/A',
            endDate: item.holidayExperience.endDate
              ? item.holidayExperience.endDate.toString()
              : 'N/A',
          }
        : null,
      // Also add a top-level property for country if needed
      country: item.holidayExperience
        ? item.holidayExperience.country?.toString() || ''
        : '',
    }));
  };

  const parsePhotoDataWithCounts = (tempData) => {
    // Filter out items where holidayExperience or countryListID is missing.
    const filteredData = tempData.filter(
      (item) =>
        item.holidayExperience && item.holidayExperience.countryListID != null,
    );

    // Group photos by countryListID and by the formatted start and end dates (YYYY-MM-DD).
    const groupedPhotos = filteredData.reduce((acc, item) => {
      const he = item.holidayExperience;
      const countryKey = he.countryListID ? he.countryListID.toString() : 'N/A';

      // Format the start and end dates for grouping (use only the date portion).
      const formattedStart = he.startDate ? he.startDate.split('T')[0] : 'N/A';
      const formattedEnd = he.endDate ? he.endDate.split('T')[0] : 'N/A';

      // Composite key for grouping.
      const groupKey = `${countryKey}_${formattedStart}_${formattedEnd}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          // Retain the full original dates for submission.
          holidayExperience: {
            holidayExpID:
              he.holidayExpID != null ? he.holidayExpID.toString() : '',
            countryListID: countryKey,
            country: he.country ? he.country.toString() : '',
            startDate: he.startDate ? he.startDate.toString() : 'N/A',
            endDate: he.endDate ? he.endDate.toString() : 'N/A',
          },
          photos: [],
        };
      }
      acc[groupKey].photos.push(item);
      return acc;
    }, {});

    // Map each group into an object with count and an array of parsed photo objects.
    return Object.values(groupedPhotos).map((group) => ({
      holidayExperience: group.holidayExperience,
      numPhotos: group.photos.length,
      photos: group.photos.map((item) => ({
        patientID: item.patientID,
        patientPhotoID: item.patientPhotoID.toString(),
        photoPath: item.photoPath ? item.photoPath.toString() : null,
        albumCategoryName: item.albumCategoryName
          ? item.albumCategoryName.toString()
          : '',
        albumCategoryListID: item.albumCategoryListID
          ? item.albumCategoryListID.toString()
          : '',
        photoDetails: item.photoDetails ? item.photoDetails.toString() : null,
        // Retain full holidayExperience (with full dates)
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
                : 'N/A',
              endDate: item.holidayExperience.endDate
                ? item.holidayExperience.endDate.toString()
                : 'N/A',
            }
          : null,
      })),
    }));
  };

  const countPhotosByCountry = (parsedData) => {
    const counts = parsedData.reduce((acc, item) => {
      const he = item.holidayExperience;
      const countryListID =
        he?.countryListID?.toString() || 'No Country Provided';

      // Format the stored full date strings to only the date part.
      const formattedStart =
        he && he.startDate && he.startDate.includes('T')
          ? he.startDate.split('T')[0]
          : he.startDate || 'N/A';
      const formattedEnd =
        he && he.endDate && he.endDate.includes('T')
          ? he.endDate.split('T')[0]
          : he.endDate || 'N/A';

      // Composite key based on formatted dates.
      const compositeKey = `${countryListID}_${formattedStart}_${formattedEnd}`;

      acc[compositeKey] = (acc[compositeKey] || 0) + item.numPhotos;
      return acc;
    }, {});
    return counts;
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
        const parsedDataWithCounts = parsePhotoDataWithCounts(responseData);

        // Use the parsedData for counting photos by country
        const photoCount = countPhotosByCountry(parsedDataWithCounts);
        console.log('photoCount try: ', photoCount);
        console.log('parsedData try: ', parsedData);
        console.log('parsedDataWithCounts try: ', parsedDataWithCounts);

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

    setFormData((prevState) => ({
      ...prevState,
      PatientID: patientID,
      PhotoDetails: '',
      AlbumCategoryName: '',
      AlbumCategoryListID: prevState.AlbumCategoryListID || '1',
      PatientPhotoID: '',
      Photo: null,
      IsHoliday: true,
      HolidayExperienceAddDTO: {
        HolidayExpID: holidayExperience?.holidayExpID || '',
        CountryListID: holidayExperience?.countryListID
          ? Number(holidayExperience.countryListID)
          : 1,
        StartDate: holidayExperience?.startDate || new Date(),
        EndDate: holidayExperience?.endDate || new Date(),
      },
    }));
  };

  // Submit data to add album
  const handleModalSubmitAdd = async (tempPhotoData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientPhoto(patientID, tempPhotoData);
    if (result.ok) {
      console.log('submitting holiday data', tempPhotoData);
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added holiday';
    } else {
      const errors = result.data?.message;

      console.log(result);

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error adding holiday';
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

  const onClickAlbum = () => {
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
      holidayExperience,
    });
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
          />
        </View>
      </View>
      <FlatList
        onTouchStart={() => Keyboard.dismiss()}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onRefresh={refreshPhotoData}
        refreshing={isLoading}
        height={'70%'}
        ListEmptyComponent={() =>
          noDataMessage(statusCode, isLoading, isError, 'No albums found', true)
        }
        data={photoData}
        keyboardShouldPersistTaps="handled"
        // Use a composite key to ensure uniqueness
        keyExtractor={(item) =>
          `${item.holidayExperience.countryListID}_${item.holidayExperience.startDate}_${item.holidayExperience.endDate}`
        }
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <Swipeable
              setIsScrolling={setIsScrolling}
              onSwipeRight={() => handleDeleteAlbum(item.patientPhotoID)}
              onSwipeLeft={() => handleEditAlbum(item.patientPhotoID)}
              // underlay={<EditDeleteUnderlay />}
              item={
                <TouchableOpacity
                  style={styles.holidayContainer}
                  activeOpacity={1}
                  disabled={!isScrolling}
                >
                  <HolidayItem
                    patientID={item.patientID}
                    patientPhotoID={item.patientPhotoID}
                    photoPath={item.photoPath}
                    country={
                      item.holidayExperience?.country || 'No Country Provided'
                    }
                    countryListID={
                      item.holidayExperience?.countryListID ||
                      'No Country Provided'
                    }
                    startDate={
                      item.holidayExperience?.startDate ||
                      'Start date not available'
                    }
                    endDate={
                      item.holidayExperience?.endDate ||
                      'End date not available'
                    }
                    photoCount={
                      photoCount[
                        `${
                          item.holidayExperience?.countryListID ||
                          'No Country Provided'
                        }_${
                          item.holidayExperience?.startDate
                            ? item.holidayExperience.startDate.split('T')[0]
                            : 'N/A'
                        }_${
                          item.holidayExperience?.endDate
                            ? item.holidayExperience.endDate.split('T')[0]
                            : 'N/A'
                        }`
                      ] || 0
                    }
                    holidayExperience={item.holidayExperience}
                    handleOnPress={onClickAlbum}
                  />
                </TouchableOpacity>
              }
            />
          );
        }}
      />

      <View style={styles.addBtn}>
        <AddButton title="Add Holiday" onPress={handleOnClickAddLog} />
      </View>
      <AddPatientPhotoModal
        showModal={isModalVisible}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={
          modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit
        }
        patientID={patientID}
        albumCategoryListID={albumCategoryListID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  holidayContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  addBtn: {
    marginTop: '0.01%',
  },
});

export default PatientHoliday;
