// Libs
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Dimensions, StyleSheet, SectionList, View, Text} from 'react-native';
import routes from 'app/navigation/routes';
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
import AddPatientAllergyModal from 'app/components/AddPatientAllergyModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import LoadingWheel from 'app/components/LoadingWheel';

function ActivityPreferenceScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [showModal, setShowModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  // Patient data related states
  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);
  const [likedItems, setLikedItems] = useState([]);
  const [dislikedItems, setDislikedItems] = useState([]);

  const [emptyData, setEmptyData] = useState([{"activityTitle": "None"}]);
  const [emptyLikesData, setEmptyLikesData] = useState(false);
  const [emptyDislikesData, setEmptyDislikesData] = useState(false);

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshActivityPreference();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  useEffect(() => {
    const getData = async () => {
        setDislikedItems([]);
        setLikedItems([]);
        const response = await activity.getActivityPreference(patientID);

        if (response.data.data !== null) {
            const { likedItems, notLikedItems } = splitData(response.data.data);
            likedItems.length > 0 ? setLikedItems(likedItems) : setEmptyLikesData(true);
            notLikedItems.length > 0 ? setDislikedItems(notLikedItems) : setEmptyDislikesData(true);
        } else {
            setEmptyLikesData(true);
            setEmptyDislikesData(true);
        }
    };

    getData();
}, []);

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

  // Set isLoading to true when retrieving data
  const refreshActivityPreference = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
      await getActivities();
    };
    setIsLoading(false);
    setEmptyLikesData(false);
    setEmptyDislikesData(false); 
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

  const getActivities = async () => {
    // fetch full user profile information by calling api using user ID
    if (patientID) {
      const response = await activity.getActivityPreference(patientID);
      if (response.ok) {
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setIsLoading(false);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      }
    }
  };

  // const handleModalSubmit = async (activityData) => {

  //   let alertTitle = '';
  //   let alertDetails = '';

  //   const result = await activity.addActivityPreference(patientID, activityData);
  //   if (result.ok) {
  //     console.log('submitting activity data', activityData);
  //     getActivities(patientID);
  //     setShowModal(false);

  //     alertTitle = 'Successfully added activity';
  //   } else {
  //     const errors = result.data?.message;

  //     result.data
  //     ? (alertDetails = `\n${errors}\n\nPlease try again.`)
  //     : (alertDetails = 'Please try again.');
      
  //     alertTitle = 'Error adding activity';
  //   }

  //   Alert.alert(alertTitle, alertDetails);
  // };

  const splitData = (data) => {
    const likedItems = data.filter(item => item.isLike);
    const notLikedItems = data.filter(item => !item.isLike);
    
    return { likedItems, notLikedItems };
  };

  return (
    <>{isLoading ? (
      <ActivityIndicator visible />
      ) : (
        <View style={styles.container}>
          <View style={{justifyContent: 'space-between'}}>            
            <View style={{alignSelf: 'center', marginTop: 15, maxHeight: 120}} >
              {!isEmptyObject(patientData) ? (
                  <ProfileNameButton   
                    profilePicture={patientData.profilePicture}
                    profileLineOne={patientData.preferredName}
                    profileLineTwo={(patientData.firstName + ' ' + patientData.lastName)}
                    handleOnPress={onClickProfile}
                    isPatient
                    isVertical={false}
                    size={90}
                    />
              ) : (
                <LoadingWheel/>
                )}
            </View>  
          </View>
          <SectionList 
            sections={[{ title: 'Likes', data: emptyLikesData ? emptyData : likedItems }]}
            renderItem={({ item, section }) => (
              <Text style={emptyLikesData ? styles.noItem : styles.likedItems}>
                {item.activityTitle}
              </Text>
            )}
            renderSectionHeader={({ section }) => (
              <Text style={styles.header}>{section.title}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <SectionList
            sections={[{ title: 'Dislikes', data: emptyDislikesData ? emptyData : dislikedItems }]}
            renderItem={({ item }) => (
              <Text style={emptyDislikesData ? styles.noItem : styles.dislikedItems}>
                {item.activityTitle}
              </Text>
            )}
            renderSectionHeader={({ section }) => (
              <Text style={styles.header}>{section.title}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
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
  likedItems: {
    backgroundColor: '#d1e7dd',
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
  },
  dislikedItems: {
    backgroundColor: '#f8d7da',
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
  },
  noItem: {
    fontSize: 15,
    padding: 20,
    marginVertical: 3,
  },
  header: {
    paddingTop: 15,
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default ActivityPreferenceScreen;
