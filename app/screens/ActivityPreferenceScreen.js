// Libs
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, StyleSheet, SectionList, View, Text, Alert, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Utilities
import { formatTimeHM24, convertTimeMilitary, isEmptyObject, noDataMessage, sortFilterInitialState, formatMilitaryToAMPM, formatDate, formatTimeAMPM } from 'app/utility/miscFunctions';

//API
import activity from 'app/api/activity';
import patientApi from 'app/api/patient';

//Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddActivityPreferenceModal from 'app/components/AddActivityPreferenceModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import LoadingWheel from 'app/components/LoadingWheel';

function ActivityPreferenceScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [patientActivityIDs, setPatientActivityIDs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  // Patient data related states
  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);
  const [likedItems, setLikedItems] = useState([]);
  const [dislikedItems, setDislikedItems] = useState([]);

  const [emptyData, setEmptyData] = useState([{ "activityTitle": "None" }]);

  // Refresh list when new activity is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshActivityPreference();
        setIsReloadPatientList(false);
      }
    }, [isReloadPatientList]),
  );

  useEffect(() => {
    const getData = async () => {
      setDislikedItems([]);
      setLikedItems([]);
      const response = await activity.getActivityPreference(patientID);

      if (response.data.data !== null) {
        const { likedItems, notLikedItems } = splitData(response.data.data);
        setLikedItems(likedItems.length > 0 ? likedItems : emptyData);
        setDislikedItems(notLikedItems.length > 0 ? notLikedItems : emptyData);
      } else {
        setLikedItems(emptyData);
        setDislikedItems(emptyData);
      }
    };

    getData();
  }, [isReloadPatientList]);

  useEffect(() => {
    if (props.route.params.patientId) {
      getPatientActivity(patientID);
      console.log('patient ID Log: ', patientID);
    }
  }, [isReloadPatientList]);

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

  // Set isLoading to true when retrieving data
  const refreshActivityPreference = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
    };
    promiseFunction();
  }

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

  // Get patient activity data
  const getPatientActivity = async (id) => {
    const response = await activity.getActivityPreference(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      setIsLoading(false);
      return;
    }

    const activityIDs = response.data.data?.map(
      (activity) => activity.centreActivityID,
    );
    setPatientActivityIDs(activityIDs);
    setIsLoading(false);
  };

  const handleAddActivity = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (activityData) => {
    let alertTitle = '';
    let alertDetails = '';

    const result = await activity.addActivityPreference(patientID, activityData);
    if (result.ok) {
      await getPatientActivity(patientID);
      setShowModal(false);
      setIsReloadPatientList(true);
      
      alertTitle = 'Successfully added activity';
    } else {
      const errors = result.data?.message;

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding activity';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  const handleDeleteActivity = async (activityID) => {
    Alert.alert(
      'Are you sure you wish to delete this item?',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const result = await activity.deleteActivityPreference(activityID);
            if (result.ok) {
              Alert.alert('Success', 'Activity preference deleted successfully');
              setIsReloadPatientList(true);
            } else {
              Alert.alert('Error', 'Failed to delete activity preference');
            }
          },
        },
      ],
    );
  };

  // Split the array into different sections for SectionList
  const splitData = (data) => {
    const likedItems = data.filter(item => item.isLike);
    const notLikedItems = data.filter(item => !item.isLike);
    return { likedItems, notLikedItems };
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={item.activityTitle === "None" ? styles.noItem : item.isLike ? styles.likedItems : styles.dislikedItems}>
        {item.activityTitle}
      </Text>
      {item.activityTitle !== "None" && (
        <TouchableOpacity onPress={() => handleDeleteActivity(item)}>
          <MaterialCommunityIcons name="delete" size={35} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>{isLoading ? (
      <ActivityIndicator visible />
    ) : (
      <View style={styles.container}>
        <View style={{ justifyContent: 'space-between' }}>
          <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }} >
            {!isEmptyObject(patientData) ? (
              <ProfileNameButton
                profilePicture={patientData.profilePicture}
                profileLineOne={patientData.preferredName}
                profileLineTwo={`${patientData.firstName} ${patientData.lastName}`}
                handleOnPress={onClickProfile}
                isPatient
                isVertical={false}
                size={90}
              />
            ) : (
              <LoadingWheel />
            )}
          </View>
        </View>
        {(likedItems.length > 0 || dislikedItems.length > 0) && (
          <SectionList
            sections={[
              { title: 'Activities liked', data: likedItems },
              { title: 'Activities disliked', data: dislikedItems }
            ]}
            renderItem={renderItem}
            renderSectionHeader={({ section }) => (
              <Text style={styles.header}>{section.title}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}

        <View style={styles.button}>
          <AddButton title="Add Activity Preference" onPress={handleAddActivity} />
          <AddActivityPreferenceModal
            showModal={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleModalSubmit}
            existingActivityIDs={patientActivityIDs}
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likedItems: {
    backgroundColor: '#C6EBC5',
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
    borderRadius: 30,
    flex: 1,
  },
  dislikedItems: {
    backgroundColor: '#FF8F8F',
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
    borderRadius: 30,
    flex: 1,
  },
  noItem: {
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
    flex: 1,
  },
  header: {
    paddingTop: 15,
    fontSize: 30,
    fontWeight: 'bold',
  },
  button: {
    paddingTop: 30,
  }
});

export default ActivityPreferenceScreen;
