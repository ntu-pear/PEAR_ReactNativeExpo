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
import PhotoGridItem from 'app/components/PhotoGridItem';

function PatientPhotoAlbum(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const testID = `photo_album_screen_${patientID}`;

  const navigation = useNavigation();

  // // User ID for edit/add operations
  // const { user } = useContext(AuthContext);
  // const userID = user ? user.userID : null;

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // Options for user to search by
  const SEARCH_OPTIONS = ['Album Name'];

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  // Sort options
  const SORT_OPTIONS = ['Album Name'];

  // // Filter options
  // const FILTER_OPTIONS = ['Date'];

  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Album Name': 'albumCategoryName',
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

  // const [patientAlbumIDs, setPatientAlbumIDs] = useState([]);
  const [patientPhotoIDs, setPatientPhotoIDs] = useState([]);

  // //MODIFIED
  // const [photoItems, setPhotoItems] = useState([]);

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

  // useEffect(() => {
  //   console.log("Updated photoData:", photoData);
  // }, [photoData]);

  //////////////////////////////////////////////////////////////
  //MODIFIED FOR PHOTO

  // // Set isLoading to true when retrieving data
  // const refreshPhotoData = () => {
  //   setIsLoading(true);
  //   const promiseFunction = async () => {
  //     await getPhotoData();
  //     await getPatientData();
  //   };
  //   promiseFunction();
  // };

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
        console.log('...response.data.data: ', [...response.data.data]);
        console.log(
          'parsed response.data.data: ',
          parsePhotoData([...response.data.data]),
        );
        // setPatientPhoto(response.data.data); // Store photo data separately
        setOriginalData(parsePhotoData([...response.data.data]));
        setPhotoData(parsePhotoData([...response.data.data]));
        // Extract existing photo IDs
        const photoIDs = response.data.data.map(
          (photo) => photo.patientPhotoID,
        );
        setPatientPhotoIDs(photoIDs); //testing
        setIsDataInitialized(true);
        setIsLoading(false);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalData([]);
        setPhotoData([]);
        // setPatientPhoto(null); // Reset photo data in case of an error
        setPatientPhotoIDs([]); // testing
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse photo album data
  const parsePhotoData = (tempData) => {
    return tempData.map((item) => ({
      patientPhotoID: item.patientPhotoID.toString(),
      photoPath: item.photoPath.toString() || null, // Handle null values
      albumCategoryName: item.albumCategoryName.toString(),
      albumCategoryListID: item.albumCategoryListID.toString(),
      // startDate: item.holidayExperience
      //   ? item.holidayExperience.startDate
      //   : null,
      photoDetails: item.photoDetails.toString() || null,
    }));
  };

  //////////////////////////////////////////////////////////////

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
      console.log('submitting problem log data', tempPhotoData);
      refreshPhotoData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added photo';
    } else {
      const errors = result.data?.message;

      console.log(result);

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

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
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

  const staticData = [
    {
      albumCategoryName: 'Family',
      patientPhotoID: '15',
      photoDetails: 'apple logo',
      photoPath:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1730400494/Patient/Yan_Yi_Sxxxx148C/Family/tygjuwvopmrafe59rkfq.jpg',
    },
    {
      albumCategoryName: 'Family',
      patientPhotoID: '16',
      photoDetails: 'apple logo',
      photoPath:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1730400494/Patient/Yan_Yi_Sxxxx148C/Family/tygjuwvopmrafe59rkfq.jpg',
    },
  ];

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
            itemType="photo"
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
          keyExtractor={(item) => item.patientPhotoID.toString()}
          renderItem={({ item }) => {
            console.log('Rendering item:', item);
            console.log('Rendering item:', item.patientPhotoID.toString());
            console.log('Rendering item:', item.photoPath);
            console.log('Rendering item:', item.albumCategoryName);
            console.log('Rendering item:', item.photoDetails);
            console.log('Length of photoData INSIDE:', photoData.length);
            return (
              <Swipeable
                setIsScrolling={setIsScrolling}
                onSwipeRight={() => handleDeletePhoto(item.patientPhotoID)}
                onSwipeLeft={() => handleEditPhoto(item.patientPhotoID)}
                underlay={<EditDeleteUnderlay />}
                item={
                  <TouchableOpacity
                    style={styles.logContainer}
                    activeOpacity={1}
                    disabled={!isScrolling}
                  >
                    {/* <ProblemLogItem
                        problemLogRemarks={item.problemLogRemarks}
                        authorName={item.authorName}
                        problemLogListDesc={item.problemLogListDesc}
                        createdDateTime={item.createdDateTime}
                        onDelete={()=>handleDeleteLog(item.problemLogID)}
                        onEdit={()=>handleEditLog(item.problemLogID)}
                        /> */}
                    <PhotoGridItem
                      patientPhotoID={item.patientPhotoID.toString()}
                      photoPath={item.photoPath}
                      albumCategoryName={item.albumCategoryName}
                      photoDetails={item.photoDetails}
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
      <View style={styles.addBtn}>
        <AddButton title="Add Album" onPress={handleOnClickAddLog} />
      </View>
      <AddPatientProblemLogModal
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

export default PatientPhotoAlbum;
