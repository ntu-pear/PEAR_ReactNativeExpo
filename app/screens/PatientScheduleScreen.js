// Libs
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, FlatList, HStack, ScrollView, View, Text, Divider } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';
import scheduleApi from 'app/api/schedule';

// Utilities
import { isEmptyObject, noDataMessage, sortFilterInitialState, formatDate, convertTimeMilitary } from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import ActivityCard from 'app/components/ActivityCard';

function PatientScheduleScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const navigation = useNavigation();
  
  // Ref used to programmatically scroll to beginning of list
  const scheduleRef = useRef(null);
  
  // Filter options 
  const FILTER_OPTIONS = [ 'Activity Type', 'Activity Time'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Activity Type': 'activityTitle',
    'Activity Time': 'startTime'
  };
  
  // Sort/filter related states
  const [dropdown, setDropdown] = useState(sortFilterInitialState);
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
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    'Activity Type': {
      'type': 'dropdown',
      'options': {},
      'isFilter': false,
      'nestedFilter': 'activities'
    },
    'Activity Time': {
      'type': 'time',
      'options': {'min': {}, 'max': {}},
      'isFilter': false,
      'nestedFilter': 'activities'
    },
  });


  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadSchedule, setIsReloadSchedule] = useState(true);

  // Schedule data related states
  const [originalScheduleWeekly, setOriginalScheduleWeekly] = useState([]);
  const [scheduleWeekly, setScheduleWeekly] = useState([]);  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Patient data related states
  const [patientInfo, setPatientInfo] = useState({});
  
  // Refresh list when user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadSchedule) {
        refreshSchedule();
        setIsReloadSchedule(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadSchedule]),
  );

  // Update activity list when weekly schedule is refreshed
  useEffect(() => {
    setFilterOptionDetails(prevState=>({
      ...prevState,
      'Activity Type': {
        ...prevState['Activity Type'],
        options: getActivityList([...originalScheduleWeekly])
      }
    }))
  }, [originalScheduleWeekly]);
  
  // Set isLoading to true when retrieving data
  const refreshSchedule = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
      if(!isError) {
        setIsLoading(false);        
        setIsDataInitialized(true);
        // setIsLoading(true);        
      } else {
        setIsLoading(false);
      }
    };
    promiseFunction();
  }    
  
  // Get problem log data from backend
  const getSchedule = async (tempPatientInfo=patientInfo) => {
    const response = await scheduleApi.getPatientWeeklySchedule([patientID]);
    if (response.ok) {
      parseScheduleData({tempPatientInfo:tempPatientInfo, tempSchedule:response.data.data})
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      console.log('Request failed with status code: ', response.status);
      setOriginalScheduleWeekly([]);
      setScheduleWeekly([]);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Get medication data from backend
  const getPatientData = async () => {
    if (patientID) {
      const response = await patientApi.getPatient(patientID);
      if (response.ok) {
        setPatientInfo({...response.data.data})
        await getSchedule({...response.data.data});
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setPatientInfo({});
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data returned by api to required format to display schedule
  const parseScheduleData = ({tempPatientInfo, tempSchedule}) => {
    if(tempSchedule == null) {
      setOriginalScheduleWeekly([]);
      setScheduleWeekly([]);
    } else {
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      let tempScheduleWeekly = [];
      
      let scheduleDate = new Date(tempSchedule[0]['startDate']);
      for(var j = 0; j<daysOfWeek.length; j++) {
        const day = daysOfWeek[j];
        const patientDailySchedule = {
          patientID: tempSchedule[0]['patientID'],
          patientName: tempSchedule[0]['patientName'],
          patientStartDate: tempPatientInfo['startDate'],
          patientFullName: tempPatientInfo['firstName'] + " " + tempPatientInfo['lastName'],
          patientPreferredName: tempPatientInfo['preferredName'],
          patientCaregiverName: tempPatientInfo['patientAllocationDTO']['caregiverName'],
          activities: parseScheduleString(tempSchedule[0][day], scheduleDate, tempSchedule[0]['patientID'], tempSchedule[0]['patientName']),
          date: new Date(scheduleDate)
        };
        
        scheduleDate.setDate(scheduleDate.getDate() + 1);

        tempScheduleWeekly.push(patientDailySchedule)
      }

      setOriginalScheduleWeekly(tempScheduleWeekly);
      setScheduleWeekly(tempScheduleWeekly);
    }
  }

  // Parse schedule of a patient for a specific date 
  // Notes:
  // Activity timings range from 9 am to 5 pm
  // Time slot duration is 1 hour
  // '--' represents start of next activity/timeslot
  // ' | ' represents medication to be administered during a timeslot
  // '@abcd' represents timing of medication
  // '**' represents notes/instructions for medication
  // ', ' represents another medication following
  // Example input: Breathing+Vital Check | Give Medication@0930: Diphenhydramine(2 tabs)**Always leave at least 4 hours between doses
  const parseScheduleString = (scheduleString, scheduleDate, patientID, patientName) => {
    let scheduleData = [];
    let startTime = new Date(scheduleDate)
    startTime.setHours(8, 0, 0, 0);
    let endTime = new Date(scheduleDate)
    endTime.setHours(9, 0, 0, 0);

    if(scheduleString.length > 0) {      
      let timeslotSplit = scheduleString.split('--') // split by timeslot
      for(var i = 0; i<timeslotSplit.length; i++) {
        const activitySplit = timeslotSplit[i].split(' | '); // split to get medication info
        const activityTitle = activitySplit[0];
        
        let medications = [];
        if(activitySplit.length > 1) {
          let medicationSplit = activitySplit[1].split(', '); // split to get list of medications
          for(var k = 0; k <medicationSplit.length; k++) {  
            const medicationInfo = medicationSplit[k].split('@')[1]; // spli to get time + medname + notes
            
            const med = medicationInfo.split(": ")[1].split("**")[0];
            const medName = med.split("(")[0];
            const medDosage = med.split("(")[1].split(")")[0];
            const medTime = medicationInfo.split(":")[0];
            const medNote = medicationInfo.split("**")[1];
            
            medications.push({
              patientID: patientID,
              patientName: patientName,
              medID: 0, // to return with API so in future can save administration
              medName: medName,
              medDosage: medDosage,
              medTime: convertTimeMilitary(medTime),
              medNote: medNote
            })
          }
        }      
        
        let activityData = {
          startTime: startTime,
          endTime: endTime,
          activityTitle: activityTitle,
          medications: medications
        };
  
        startTime = new Date(startTime.setHours(startTime.getHours() + 1));
        endTime = new Date(endTime.setHours(endTime.getHours() + 1));
        
        scheduleData.push(activityData);
      }
    }        
    
    return scheduleData;
  }
  
   // Get list of activities from patient data
   const getActivityList = (tempWeeklySchedule=originalScheduleWeekly) => {
    const activities = [];
    console.log(tempWeeklySchedule)
    tempWeeklySchedule.forEach((item) => {
      item.activities.forEach((activity) => {
        if (!activities.includes(activity.activityTitle)) {
          activities.push(activity.activityTitle);
        }
      });
    });
    activities.sort();
     
    const dictActivities = activities.reduce((acc, currentValue) => {
      acc[currentValue] = currentValue;
      return acc;
    }, {});

    return dictActivities;

  };
  // Handle searching, sorting, and filtering of schedule
  const handleSearchSortFilter = async ({
    text,
    tempSelSort, 
    tempSelDropdownFilters,
    tempSelDateFilters,
    tempSearchMode,
    setFilteredList
  }) => {       
    setIsLoading(true);

    setFilteredList({
      text: text, 
      tempSelSort: tempSelSort, 
      tempSelDropdownFilters: tempSelDropdownFilters, 
      tempSelDateFilters: tempSelDateFilters,
      tempSearchMode: tempSearchMode,
    });

    scheduleRef.current?.scrollToOffset({offset: 0, animated: true});
    setIsLoading(false);    
  }

  const handlePullToRefresh = () => {
    refreshSchedule();
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

   // Check if all schedules are empty
   const checkAllEmptySchedules = () => {
    for(var i = 0; i<scheduleWeekly.length; i++) {
      if(scheduleWeekly[i]['activities'].length > 0) {
        return false
      }
    }
    return true;
  }

  return (
    isLoading ? (
      <ActivityIndicator visible />
    ) : (
      <View style={styles.container}>  
        <View style={{justifyContent: 'space-between'}}>            
          <View style={{alignSelf: 'center', marginTop: 15, maxHeight: 120}} >
            {!isEmptyObject(patientInfo) ? (
              <ProfileNameButton   
                profilePicture={patientInfo.profilePicture}
                profileLineOne={patientInfo.preferredName}
                profileLineTwo={(patientInfo.firstName + ' ' + patientInfo.lastName)}
                handleOnPress={onClickProfile}
                isPatient
                isVertical={false}
                size={90}
                />
          ) : (
            <LoadingWheel/>
            )}
        </View>  
        <Divider width={'94%'} alignSelf={'center'}/>
        <View marginRight={'3%'} marginLeft={'3%'}>
          <SearchFilterBar
            originalList={originalScheduleWeekly}
            setList={setScheduleWeekly}
            FIELD_MAPPING={FIELD_MAPPING}
            FILTER_OPTIONS={FILTER_OPTIONS}
            filterOptionDetails={filterOptionDetails}
            datetime={datetime}
            setDatetime={setDatetime}
            dropdown={dropdown}
            setDropdown={setDropdown}
            initializeData={isDataInitialized}
            onInitialize={()=>setIsDataInitialized(false)}
            hideSearchBar
            /> 
        </View>
      </View>      
      <FlatList
        ref={scheduleRef}
        marginLeft={'4%'}
        marginRight={'4%'}
        marginBottom={'4%'}
        marginTop={'1%'}
        horizontal    
        height={'80%'}    
        // onRefresh={handlePullToRefresh}
        // refreshing={isLoading}
        ListEmptyComponent={()=>(
          <View width={Dimensions.get('window').width-85} height='80%'>
            {noDataMessage(statusCode, isLoading, isError, 'No schedules found')}
          </View>
        )}
        data={checkAllEmptySchedules() ? [] : scheduleWeekly}
        renderItem={({ item, i }) => {
            return (
            <View style={styles.col} key={i}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(new Date(item.date), false)}</Text>
              </View>
              <ScrollView
                width="100%"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{flexGrow: 1, alignItems: 'center', justifyContent: item.activities.length > 0 ? 'flex-start': 'center'}}
              >
                {item.activities.map((activity, i) => (
                  <ActivityCard
                    key={i}
                    activityTitle={activity.activityTitle}
                    activityStartTime={activity.startTime}
                    activityEndTime={activity.endTime}
                    currentTime={new Date()}
                    medications={activity.medications}
                    patientName={item.patientName}
                    patientID={item.patientID}
                    date={formatDate(new Date(item.date), true)}
                    navigation={navigation}
                  />
                ))}
              </ScrollView>
            </View>
          )
        }}
      />
    </View>
    )
  );
}

const styles = StyleSheet.create({
  col: {
    justifyContent: 'center',
    borderRightColor: colors.gray,
    borderRightWidth: 0.5,
  },
  dateText: {
    color: colors.white_var1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateContainer: {
    backgroundColor: colors.green,
    width: 210,
    alignSelf: 'center',
    alignItems: "center",
    paddingVertical: 10
  }
});

export default PatientScheduleScreen;
