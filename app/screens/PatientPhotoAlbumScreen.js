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
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Auth
import AuthContext from 'app/auth/context';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import AlbumItem from 'app/components/AlbumItem';

function PatientPhotoAlbum(props) {
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
  } = props.route.params;
  if (albumCategoryListId) {
    albumCategoryListID = albumCategoryListId;
  }

  const testID = `photo_album_screen_${patientID}`;

  const navigation = useNavigation();

  // Options for user to search by
  const SEARCH_OPTIONS = ['Album Name'];

  // Sort options
  const SORT_OPTIONS = ['Album Name'];

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

  // Album data related states
  const [originalData, setOriginalData] = useState([]);
  const [photoData, setPhotoData] = useState([]);
  const [formData, setFormData] = useState({
    // for add/edit form
    photoDetails: '',
    albumCategoryName: '',
    albumCategoryListID: 1,
    patientPhotoID: 1,
  });
  const [photoCount, setPhotoCount] = useState([]);

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshPhotoData();
    }, []),
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
      const response = await patientApi.getPatientPhotoV1(photoID);
      if (response.ok) {
        const photoCount = countPhotosByAlbum([...response.data.data]);
        setPhotoCount(photoCount);
        setPhotoData(
          mergeSeededAlbumsWithPhotos(
            parsePhotoData([...response.data.data]),
            seededAlbums,
          ),
        );
        setOriginalData(
          mergeSeededAlbumsWithPhotos(
            parsePhotoData([...response.data.data]),
            seededAlbums,
          ),
        );
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

  // Parse photo album data and return the latest photo per album category
  const parsePhotoData = (tempData) => {
    const groupedPhotos = tempData.reduce((acc, item) => {
      const albumName = item.albumCategoryName.toString();
      if (!acc[albumName]) {
        acc[albumName] = [];
      }
      acc[albumName].push(item);
      return acc;
    }, {});

    // For each album category, select the most recent photo based on the patientPhotoID
    const latestPhotos = Object.values(groupedPhotos).map((photos) => {
      return photos.reduce((latest, current) => {
        return current.patientPhotoID > latest.patientPhotoID
          ? current
          : latest;
      });
    });

    // Return the parsed and filtered photo data with only the latest photos per album
    return latestPhotos.map((item) => ({
      patientID: item.patientID,
      photoPath: item.photoPath.toString() || null, // Handle null values
      albumCategoryName: item.albumCategoryName.toString(),
      albumCategoryListID: item.albumCategoryListID.toString(),
      photoDetails: item.photoDetails.toString() || null,
    }));
  };

  // Function to merge seeded albums with photo data
  const mergeSeededAlbumsWithPhotos = (photoData, seededAlbums) => {
    // Create a map of photoData by albumCategoryListID for quick lookup
    const photoDataMap = photoData.reduce((acc, item) => {
      acc[item.albumCategoryListID] = item;
      return acc;
    }, {});

    // Combine seededAlbums with photoData
    return seededAlbums.map((album) => {
      const photo = photoDataMap[album.albumCategoryListID];
      return {
        albumCategoryListID: album.albumCategoryListID,
        albumCategoryName: album.albumCategoryName,
        patientID: patientID, // Use photo data if available
        photoPath: photo ? photo.photoPath : null, // Use photo data if available
        photoDetails: photo ? photo.photoDetails : null, // Use photo data if available
      };
    });
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

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  // Navigate to photo grid page on click album
  const onClickAlbum = () => {
    navigation.navigate(routes.PATIENT_PHOTO_GRID, {
      patientID,
      albumCategoryListID,
      photoDetails,
      albumCategoryName,
      patientPhotoID,
    });
  };

  // Group photos by albumCategoryListID
  const countPhotosByAlbum = (tempData) => {
    return tempData.reduce((acc, item) => {
      const albumID = item.albumCategoryListID.toString();
      if (!acc[albumID]) {
        acc[albumID] = 0;
      }
      acc[albumID] += 1;
      return acc;
    }, {});
  };

  const seededAlbums = [
    { albumCategoryListID: '1', albumCategoryName: 'Family' },
    { albumCategoryListID: '2', albumCategoryName: 'Friends' },
    { albumCategoryListID: '4', albumCategoryName: 'Pet' },
    { albumCategoryListID: '5', albumCategoryName: 'Food' },
    { albumCategoryListID: '6', albumCategoryName: 'Activity' },
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
        height={'77%'}
        ListEmptyComponent={() =>
          noDataMessage(statusCode, isLoading, isError, 'No albums found', true)
        }
        data={photoData}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.albumCategoryListID}
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <Swipeable
              setIsScrolling={setIsScrolling}
              item={
                <TouchableOpacity
                  style={styles.albumContainer}
                  activeOpacity={1}
                  disabled={!isScrolling}
                >
                  <AlbumItem
                    patientPhotoID={item.patientPhotoID}
                    photoPath={item.photoPath}
                    albumCategoryName={item.albumCategoryName}
                    albumCategoryListID={item.albumCategoryListID}
                    patientID={item.patientID}
                    photoCount={photoCount[item.albumCategoryListID] || 0}
                    handleOnPress={onClickAlbum}
                  />
                </TouchableOpacity>
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  albumContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  addBtn: {
    marginTop: '0.01%',
  },
});

export default PatientPhotoAlbum;
