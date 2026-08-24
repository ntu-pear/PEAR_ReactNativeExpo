// Libs;
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { StyleSheet, SectionList, View, Text, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Utilities
import {
  isEmptyObject,
  sortFilterInitialState,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// API
import activity, { mergeCataloguePreferences } from 'app/api/activity';
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';
import { patientFromApiResponse, patientProfileLines } from 'app/utility/patientHeader';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddActivityPreferenceModal from 'app/components/AddActivityPreferenceModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import LoadingWheel from 'app/components/LoadingWheel';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';

function ActivityPreferenceScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const testID = `activity_preference_screen_${patientID}`;
  const navigation = useNavigation();
  const { user } = useContext(AuthContext) || {};
  const roleName = (user?.roleName || user?.role || '').toUpperCase();
  const canManagePreferences =
    roleName === 'SUPERVISOR' || roleName === 'CAREGIVER';

  // Modal and API state
  const [showModal, setShowModal] = useState(false);
  const [patientActivityIDs, setPatientActivityIDs] = useState([]);
  const [patientActivityPreferences, setPatientActivityPreferences] = useState(
    [],
  );
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Search, sort, and filter options
  const SEARCH_OPTIONS = ['Activity Name'];
  const SORT_OPTIONS = ['Preference'];
  // const FILTER_OPTIONS = ['Preference'];
  const FIELD_MAPPING = {
    'Activity Name': 'activityTitle',
    Preference: 'isLike',
  };

  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  // Patient data state
  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Grouped activity preference arrays (for SectionList)
  const [likedItems, setLikedItems] = useState([]);
  const [dislikedItems, setDislikedItems] = useState([]);
  const [neutralItems, setNeutralItems] = useState([]);
  const [emptyData, setEmptyData] = useState([{ activityTitle: 'None' }]);

  // Data for filtering (flat list)
  const [originalData, setOriginalData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  // Fetch patient activity preferences when reloading
  useFocusEffect(
    useCallback(() => {
      if (isReloadPatientList) {
        refreshActivityPreference();
        setIsReloadPatientList(false);
      }
    }, [isReloadPatientList]),
  );

  // Fetch activity preference data for filtering
  useEffect(() => {
    const getData = async () => {
      const response = await activity.getActivityPreference(patientID);
      if (response.data.data !== null) {
        const data = await withActivityTitles(response.data.data);
        setOriginalData(data);
        setActivityData(data);
        setIsDataInitialized(true);
      } else {
        setOriginalData([]);
        setActivityData([]);
        setIsDataInitialized(true);
      }
    };
    getData();
  }, [isReloadPatientList]);

  // Update grouped sections when activityData changes
  useEffect(() => {
    if (activityData && activityData.length) {
      const { likedItems, neutralItems, dislikedItems } =
        splitData(activityData);
      setLikedItems(likedItems.length > 0 ? likedItems : emptyData);
      setNeutralItems(neutralItems.length > 0 ? neutralItems : emptyData);
      setDislikedItems(dislikedItems.length > 0 ? dislikedItems : emptyData);
    } else {
      setLikedItems(emptyData);
      setNeutralItems(emptyData);
      setDislikedItems(emptyData);
    }
  }, [activityData]);

  // Get patient data (for profile info)
  useEffect(() => {
    if (patientID) {
      getPatientData();
    }
  }, []);

  // Also get patient activity preferences mapping when reloading
  useEffect(() => {
    if (props.route.params.patientId) {
      getPatientActivity(patientID);
    }
  }, [isReloadPatientList]);

  // Navigate to profile
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  // Set isLoading to true when retrieving data
  const refreshActivityPreference = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
      await getPatientActivity(patientID);
    };
    promiseFunction();
  };

  const withActivityTitles = async (rows) => {
    const [centreRes, activitiesRes] = await Promise.all([
      activity.getCentreActivities(),
      activity.getActivities(),
    ]);
    return mergeCataloguePreferences(
      centreRes?.ok ? centreRes.data?.data || [] : [],
      activitiesRes?.ok ? activitiesRes.data?.data || [] : [],
      rows || [],
    );
  };

  // Get patient data from backend
  const getPatientData = async () => {
    if (patientID) {
      const response = await patientApi.getPatient(patientID);
      if (response.ok) {
        setPatientData(patientFromApiResponse(response));
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

  // Get patient activity preferences and mapping
  const getPatientActivity = async (id = patientID) => {
    const response = await activity.getActivityPreference(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      setIsLoading(false);
      return;
    }
    const data = await withActivityTitles(response.data.data || []);
    setOriginalData(data);
    setActivityData(data);
    setIsDataInitialized(true);
    // Extract array of CentreActivityIDs
    const activityIDs = data.map((activity) => activity.centreActivityID);
    setPatientActivityIDs(activityIDs);
    // Build mapping array with both CentreActivityID and CentreActivityPreferenceID
    const preferencesMapping = data.map((activity) => ({
      CentreActivityID: activity.centreActivityID,
      isLike: activity.isLike,
      CentreActivityPreferenceID: activity.centreActivityPreferenceID,
    }));
    setPatientActivityPreferences(preferencesMapping);
    setIsLoading(false);
  };

  const handleAddActivity = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (activityArray) => {
    let alertTitle = '';
    let alertDetails = '';
    let successCount = 0;
    let failCount = 0;

    for (const item of activityArray) {
      try {
        // Build payload consistently
        const payload = {
          patientID: patientID,
          centreActivityID: item.centreActivityID,
          isLike: item.isLike,
        };

        const existingPref = patientActivityPreferences.find(
          (pref) => pref.CentreActivityID === item.centreActivityID,
        );

        if (existingPref?.CentreActivityPreferenceID) {
          // Preference exists: update with PUT
          const updatePayload = {
            PatientID: patientID,
            CentreActivityID: item.centreActivityID,
            IsLike: item.isLike,
            CentreActivityPreferenceID: existingPref.CentreActivityPreferenceID,
          };
          const result = await activity.updateActivityPreference(updatePayload);
          if (result.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          const result = await activity.addActivityPreference(
            patientID,
            payload,
          );
          if (result.ok) {
            successCount++;
          } else {
            failCount++;
          }
        }
      } catch (error) {
        console.error(
          'Error processing preference for activity',
          item.centreActivityID,
          error,
        );
        failCount++;
      }
    }

    await getPatientActivity(patientID);
    setShowModal(false);
    setIsReloadPatientList(true);

    if (failCount === 0) {
      alertTitle = 'Success';
      alertDetails = `Successfully processed ${successCount} preferences.`;
    } else {
      alertTitle = 'Some errors occurred';
      alertDetails = `Processed ${successCount} preferences, but ${failCount} failed. Please try again.`;
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // const handleDeleteActivity = async (activityID) => {
  //   Alert.alert('Are you sure you wish to delete this item?', '', [
  //     {
  //       text: 'Cancel',
  //       onPress: () => {},
  //       style: 'cancel',
  //     },
  //     {
  //       text: 'OK',
  //       onPress: async () => {
  //         const result = await activity.deleteActivityPreference(activityID);
  //         if (result.ok) {
  //           Alert.alert('Success', 'Activity preference deleted successfully');
  //           setIsReloadPatientList(true);
  //         } else {
  //           Alert.alert('Error', 'Failed to delete activity preference');
  //         }
  //       },
  //     },
  //   ]);
  // };

  const splitData = (data) => {
    const likedItems = data.filter((item) => item.isLike === 1);
    const neutralItems = data.filter((item) => item.isLike === 0);
    const dislikedItems = data.filter((item) => item.isLike === -1);
    return { likedItems, neutralItems, dislikedItems };
  };

  const ascending = sort?.sel?.asc ?? true;

  const sections = useMemo(() => {
    // If ascending, liked → neutral → disliked
    if (ascending) {
      return [
        {
          title: 'Liked Activities',
          data: likedItems.length ? [likedItems] : [],
        },
        {
          title: 'Neutral Activities',
          data: neutralItems.length ? [neutralItems] : [],
        },
        {
          title: 'Disliked Activities',
          data: dislikedItems.length ? [dislikedItems] : [],
        },
      ];
    }
    // If descending, disliked → neutral → liked
    else {
      return [
        {
          title: 'Disliked Activities',
          data: dislikedItems.length ? [dislikedItems] : [],
        },
        {
          title: 'Neutral Activities',
          data: neutralItems.length ? [neutralItems] : [],
        },
        {
          title: 'Liked Activities',
          data: likedItems.length ? [likedItems] : [],
        },
      ];
    }
  }, [ascending, likedItems, neutralItems, dislikedItems]);

  const renderItem = ({ item }) => {
    // `item` is an array of activities
    return (
      <View style={styles.wrapContainer}>
        {item.map((activity, index) => (
          <View
            key={
              activity.centreActivityID
                ? activity.centreActivityID
                : `placeholder-${index}`
            }
            style={styles.gridItem}
          >
            <Text
              style={[
                styles.activityText,
                activity.activityTitle === 'None'
                  ? styles.noItem
                  : activity.isLike === 1
                  ? styles.likedItems
                  : activity.isLike === 0
                  ? styles.neutralItems
                  : styles.dislikedItems,
              ]}
            >
              {activity.activityTitle}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // const renderItem = ({ item }) => {
  //   // `item` is an array of activities (e.g., all neutral activities)
  //   return (
  //     <View style={styles.wrapContainer}>
  //       {item.map((activity) => (
  //         <View key={activity.centreActivityID} style={styles.gridItem}>
  //           <Text
  //             style={[
  //               styles.activityText,
  //               activity.activityTitle === 'None'
  //                 ? styles.noItem
  //                 : activity.isLike === 1
  //                 ? styles.likedItems
  //                 : activity.isLike === 0
  //                 ? styles.neutralItems
  //                 : styles.dislikedItems,
  //             ]}
  //           >
  //             {activity.activityTitle}
  //           </Text>
  //         </View>
  //       ))}
  //     </View>
  //   );
  // };

  const renderSectionHeader = ({ section }) => {
    // section.data is an array with one element: the array of items
    let total = section.data.length ? section.data[0].length : 0;
    // If the only item is the default placeholder ("None"), count as 0
    if (total === 1 && section.data[0][0]?.activityTitle === 'None') {
      total = 0;
    }

    return (
      <Text style={styles.header}>
        {section.title} ({total})
      </Text>
    );
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View style={styles.container}>
          <View style={{ justifyContent: 'space-between' }}>
            <View
              style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}
            >
              {!isEmptyObject(patientData) ? (
                <ProfileNameButton
                  profilePicture={patientData.profilePicture}
                  profileLineOne={patientProfileLines(patientData).line1}
                  profileLineTwo={patientProfileLines(patientData).line2}
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
                setList={setActivityData}
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
                itemType="activity"
                itemCount={activityData.length}
              />
            </View>
          </View>
          {(likedItems.length > 0 ||
            neutralItems.length > 0 ||
            dislikedItems.length > 0) && (
            <SectionList
              onRefresh={refreshActivityPreference}
              refreshing={isLoading}
              sections={sections}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item, index) => `${index}`}
            />
          )}
          <View style={styles.button}>
            {canManagePreferences && (
              <AddButton
                title="Edit Activity Preference"
                onPress={handleAddActivity}
                iconName="pencil"
              />
            )}
            <AddActivityPreferenceModal
              showModal={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleModalSubmit}
              existingActivityIDs={patientActivityIDs}
              existingActivityPreferences={patientActivityPreferences}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 1,
  },
  header: {
    paddingLeft: 10,
    paddingTop: 15,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 6,
  },
  button: {
    paddingTop: 30,
  },

  // Container for each row of activities in a section
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  gridItem: {
    alignSelf: 'flex-start',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  activityText: {
    ...typography.subheading1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    textAlign: 'center',
  },
  likedItems: {
    backgroundColor: colors.green_lightest,
  },
  neutralItems: {
    backgroundColor: colors.grey_lightest,
  },
  dislikedItems: {
    backgroundColor: colors.pink_lightest,
  },
  noItem: {
    backgroundColor: colors.grey,
    color: colors.white,
  },
});

export default ActivityPreferenceScreen;
