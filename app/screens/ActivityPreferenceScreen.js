// Libs;
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { StyleSheet, SectionList, View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Utilities
import {
  isEmptyObject,
  sortFilterInitialState,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// API
import activity from 'app/api/activity';
import usePatientActivityData from 'app/hooks/usePatientActivityData';
import AuthContext from 'app/auth/context';
import { patientProfileLines } from 'app/utility/patientHeader';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddActivityPreferenceModal from 'app/components/AddActivityPreferenceModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
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

  const {
    isLoading,
    patientData,
    preferences,
    errors,
    refresh: refreshActivityPreference,
  } = usePatientActivityData(patientID);

  // Grouped activity preference arrays (for SectionList)
  const [likedItems, setLikedItems] = useState([]);
  const [dislikedItems, setDislikedItems] = useState([]);
  const [neutralItems, setNeutralItems] = useState([]);
  const emptyData = useMemo(() => [{ activityTitle: 'None' }], []);

  // Data for filtering (flat list)
  const [originalData, setOriginalData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    setOriginalData(preferences);
    setActivityData(preferences);
    setIsDataInitialized(true);
    setPatientActivityIDs(preferences.map((item) => item.centreActivityID));
    setPatientActivityPreferences(
      preferences.map((item) => ({
        CentreActivityID: item.centreActivityID,
        isLike: item.isLike,
        CentreActivityPreferenceID: item.centreActivityPreferenceID,
      })),
    );
  }, [preferences]);

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
  }, [activityData, emptyData]);

  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
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

    setShowModal(false);
    await refreshActivityPreference();

    if (failCount === 0) {
      alertTitle = 'Success';
      alertDetails = `Successfully processed ${successCount} preferences.`;
    } else {
      alertTitle = 'Some errors occurred';
      alertDetails = `Processed ${successCount} preferences, but ${failCount} failed. Please try again.`;
    }

    Alert.alert(alertTitle, alertDetails);
  };

  function splitData(data) {
    const likedItems = data.filter((item) => Number(item.isLike) === 1);
    const neutralItems = data.filter((item) => Number(item.isLike) === 0);
    const dislikedItems = data.filter((item) => Number(item.isLike) === -1);
    return { likedItems, neutralItems, dislikedItems };
  }

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
          {errors.length > 0 && (
            <Text testID={`${testID}_load_error`}>
              Could not load {errors.join(', ')}. Pull to refresh.
            </Text>
          )}
          <View style={{ justifyContent: 'space-between' }}>
            <View
              style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}
            >
              {!isEmptyObject(patientData) ? (
                <ProfileNameButton
                  testID={`${testID}_profileNameButton`}
                  profilePicture={patientData.profilePicture}
                  profileLineOne={patientProfileLines(patientData).line1}
                  profileLineTwo={patientProfileLines(patientData).line2}
                  handleOnPress={onClickProfile}
                  isPatient
                  isVertical={false}
                  size={90}
                />
              ) : (
                <Text>Patient information unavailable. Pull to refresh.</Text>
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
              style={{ flex: 1 }}
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
    flex: 1,
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
    paddingTop: 12,
    paddingBottom: 12,
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
    color: colors.black_darker,
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
    backgroundColor: colors.grey_lightest,
    color: colors.black,
  },
});

export default ActivityPreferenceScreen;
