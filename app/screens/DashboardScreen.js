// Libs
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Box,
  Container,
  FlatList,
  HStack,
  ScrollView,
  Image,
  Stack,
  View,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

// API
import scheduleApi from 'app/api/schedule'
import patientApi from 'app/api/patient'

// Configurations
import colors from 'app/config/colors';

// Components
import ActivityCard from 'app/components/ActivityCard';
import DateInputField from 'app/components/DateInputField';
import SearchFilterBar from 'app/components/filter/SearchFilterBar';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import ProfileNameButton from 'app/components/ProfileNameButton';

// Utilities
import globalStyles from 'app/utility/styles.js';
import { formatDate, formatMilitaryTime, isEmptyObject } from 'app/utility/miscFunctions';
import ActivityIndicator from 'app/components/ActivityIndicator';

function DashboardScreen() {
  // View modes user can switch between (displayed as tab on top)
  const VIEW_MODES = {
    'My Patients': 'myPatients',
    'All Patients': 'allPatients'
  };

  // Options for user to search by
  const SEARCH_OPTIONS = ['Full Name', 'Preferred Name'];

  // Patient data related states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [patientInfo, setPatientInfo] = useState({});
  const [originalScheduleWeekly, setOriginalScheduleWeekly] = useState({}); // weekly schedule
  const [originalSchedule, setOriginalSchedule] = useState([]); // day schedule without sort, search, filter
  const [schedule, setSchedule] = useState([]); // day schedule after sort, search, filter
  const [patientCountInfo, setPatientCountInfo] = useState({}); // list of patients for each caregiver (differentiated by patient status) 
  const [justUpdated, setJustUpdated] = useState(false); 
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadSchedule, setIsReloadSchedule] = useState(false);

  // Refresh schedule when new user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadSchedule) {
        refreshSchedule();
        setIsReloadSchedule(false);
      }
    }, [isReloadSchedule]),
  );

  // Refresh schedule from backend when user switches between 'My Patients' and 'All Patients'
  useEffect(() => {
    refreshSchedule();
  }, [viewMode]);

  // Refresh schedule if isRetry is set to true
  useEffect(() => {
    if (isRetry) {
      console.log('Retrying dashboard API call');
      refreshSchedule();
    }
  }, [isRetry]);

  // Set screen to loading wheel when retrieving schedule from backend
  // Note: Once the data is retrieved from backend, setIsLoading is set to false momentarily so SearchFilterBar can render and initialize data
  const refreshSchedule = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getSchedule();
      if(viewMode === 'allPatients') {
        await getPatientCountInfo();
      }
      setIsLoading(false);        
      setIsDataInitialized(true);
      setIsLoading(true);        
    };
    promiseFunction();     
  }  

  const updateSchedule = ({tempScheduleWeekly=originalScheduleWeekly, tempSelectedDate=selectedDate}) => {
    if(!isEmptyObject(tempScheduleWeekly)) {      
      const currentDate = formatDate(tempSelectedDate, true);

      setOriginalSchedule([...tempScheduleWeekly[currentDate]]);
      setSchedule([...tempScheduleWeekly[currentDate]]);
    }
  }

   // Retrieve schedule from backend
   const getSchedule = async() => { 

    const response =
    viewMode === 'myPatients'
        ? await scheduleApi.getSchedule()
        : await scheduleApi.getSchedule();
    
    if(response.ok) {
      parseScheduleData(response.data.data)
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Parse data returned by api to required format to display schedule
  const parseScheduleData = (data) => {
    if(data == null) {
      setOriginalScheduleWeekly({});
      setOriginalSchedule([]);
      setSchedule([]);
    } else {

      setPatientInfo();
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      let tempScheduleWeekly = {};
      
      for(var i = 0; i<data.length; i++) {
        let scheduleDate = new Date(data[0]['startDate']);
        for(var j = 0; j<daysOfWeek.length; j++) {
          const day = daysOfWeek[j];
          const scheduleDateStr = formatDate(scheduleDate, true);
          if(Object.keys(tempScheduleWeekly).length <= j) {
            tempScheduleWeekly[scheduleDateStr] = [];
          }
          
          const patientDailySchedule = {
            patientID: data[i]['patientID'],
            patientName: data[i]['patientName'],
            patientImage: data[i]['patientImage'],
            activities: parseScheduleString(data[i][day], scheduleDate),
            date: scheduleDateStr
          };
          
          scheduleDate.setDate(scheduleDate.getDate() + 1);

          tempScheduleWeekly[scheduleDateStr].push(patientDailySchedule)
          
        }
      }

      setOriginalScheduleWeekly(tempScheduleWeekly);
      updateSchedule({tempScheduleWeekly: tempScheduleWeekly});
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
  const parseScheduleString = (scheduleString, scheduleDate) => {
    let scheduleData = [];
    let startTime = new Date(scheduleDate)
    startTime.setHours(9, 0, 0, 0);
    let endTime = new Date(scheduleDate)
    endTime.setHours(10, 0, 0, 0);

    if(scheduleString.length > 0) {
      
      let timeslotSplit = scheduleString.split('--') // split by timeslot
      for(var i = 0; i<timeslotSplit.length; i++) {
        const activitySplit = timeslotSplit[i].split(' | '); // split to get medication info
        const activityName = activitySplit[0];
        
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
              medName: medName,
              medDosage: medDosage,
              medTime: formatMilitaryTime(medTime),
              medNote: medNote
            })
          }
        }      
        
        let activityData = {
          startTime: startTime,
          endTime: endTime,
          activityName: activityName,
          medications: medications
        };
  
        startTime = new Date(startTime.setHours(startTime.getHours() + 1));
        endTime = new Date(endTime.setHours(endTime.getHours() + 1));
        
        scheduleData.push(activityData);
      }
    }        
    
    return scheduleData;
  }

  // Retrieve cargivers patient count list from backend
  const getPatientCountInfo = async() => {
    const response = await patientApi.getPatientStatusCountList();

    if(response.ok) {
      setPatientCountInfo(response.data);
      updateCaregiverFilterOptions({tempPatientCountInfo: response.data});
    }
  }

  // Update filter options for Caregiver filter based on patient count data from backend
  const updateCaregiverFilterOptions = ({tempPatientCountInfo=patientCountInfo}) => {
    
    let caregiverPatientCount = {};
    for (var caregiverID of Object.keys(tempPatientCountInfo)) {
      const caregiverName = tempPatientCountInfo[caregiverID]['fullName']
      const patientCount = tempPatientCountInfo[caregiverID]['activePatients']      
      caregiverPatientCount[`${caregiverName} (${patientCount})`] = caregiverName
    }
    
    // console.log('PATIENTS -', 9, 'updateCaregiverFilterOptions', caregiverPatientCount);

    setFilterOptionDetails(prevState => ({
      ...prevState,
      Caregiver: {
        ...prevState.Caregiver,
        options: caregiverPatientCount
      }
    }));

    setJustUpdated(true);
  }    

  // Handle searching, sorting, and filtering of patient data based on patient status  
  // If patient status has been updated, get patient list from api
  // Otherwise filter the list of patients
  const handleSearchSortFilter = async ({
    text,
    tempSelSort, 
    tempSelDropdownFilters,
    tempSelChipFilters, 
    tempSearchMode,
    setFilteredList
  }) => {       
    // console.log('PATIENTS -', 10, 'handleSearchSortFilter', tempSelChipFilters);

    setIsLoading(true);
    setApplySortFilter(true);

    setFilteredList({
      text: text, 
      tempSelSort: tempSelSort, 
      tempSelDropdownFilters: tempSelDropdownFilters,
      tempSelChipFilters: tempSelChipFilters, 
      tempSearchMode: tempSearchMode,
    });
    
    // Scroll to top of list
    patientListRef.current?.scrollTo({x: 0, y: 0, animated: true});
    setIsLoading(false);    
       
  }

  const handlePreviousDate = () => {
    const previous = new Date(selectedDate.getTime());
    previous.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previous);
    updateSchedule({tempSelectedDate: previous});
  };

  const handleNextDate = () => {
    const next = new Date(selectedDate.getTime());
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
    updateSchedule({tempSelectedDate: next});
  };

  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      0,
      0,
      0,
    ),
  );
  const [selectedEndTime, setSelectedEndTime] = useState(
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      23,
      59,
      59,
    ),
  );

  const [patientsData, setPatientsData] = useState([]);
  const [filteredPatientsData, setFilteredPatientsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityList, setActivityList] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFilterList, setActivityFilterList] = useState(null);

  const getDefaultStartTime = () =>
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      0,
      0,
      0,
    );

  const getDefaultEndTime = () =>
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      23,
      59,
      59,
    );

  const getActivityList = () => {
    const activities = [];
    patientsData.forEach((patient) => {
      patient.activities.forEach((activity) => {
        if (!activities.includes(activity.activityTitle)) {
          activities.push(activity.activityTitle);
        }
      });
    });
    activities.sort();
    return activities;
  };

  const compareDates = (activityDate, selectedDateLocal) => {
    return (
      activityDate.getFullYear() === selectedDateLocal.getFullYear() &&
      activityDate.getMonth() === selectedDateLocal.getMonth() &&
      activityDate.getDate() === selectedDateLocal.getDate()
    );
  };

  const isSelectedActivity = (activityTitle) => {
    return (
      selectedActivity === null || selectedActivity.title === activityTitle
    );
  };

  const isWithinTimeRange = (activityStart, activityEnd) => {
    if (
      activityStart.getHours() > selectedEndTime.getHours() ||
      activityEnd.getHours() < selectedStartTime.getHours()
    ) {
      return false;
    }
    return !(
      (activityStart.getHours() === selectedEndTime.getHours() &&
        activityStart.getMinutes() > selectedEndTime.getMinutes()) ||
      (activityEnd.getHours() === selectedStartTime.getHours() &&
        activityEnd.getMinutes() < selectedStartTime.getMinutes())
    );
  };


  const noDataMessage = () => {
    // Display error message if API request fails
    let message = '';
    if (isLoading) {
      return <></>;
    }
    if (isError) {
      if (statusCode === 401) {
        message = 'Error: User is not authenticated.';
      } else if (statusCode >= 500) {
        message = 'Error: Server is down. Please try again later.';
      } else {
        message = `${statusCode || 'Some'} error has occured`;
      }
    }
    return (
      <MessageDisplayCard
        TextMessage={isError ? message : 'No schedules found today'}
        topPaddingSize={'42%'}
      />
    );
  };

  const handlePullToRefresh = () => {
    refreshSchedule();
    setCurrentTime(new Date());
  };

  const getMonday = () => {
    let date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const isMonday = () => {
    return selectedDate.toDateString() == new Date(getMonday()).toDateString();
  }

  const getSunday = () => {    
    let date = new Date(getMonday());
    date.setDate(date.getDate() + 6);
    return date;
  }
  
  const isSunday = () => {
    return selectedDate.toDateString() == new Date(getSunday()).toDateString();
  }

  // if(isLoading) {
  //   return (<ActivityIndicator visible/>)
  // } 
  return (
    <View
      style={globalStyles.mainContentContainer}
    >
      <SearchFilterBar
        SEARCH_OPTIONS={SEARCH_OPTIONS}
        VIEW_MODES={VIEW_MODES}
        viewMode={viewMode}
        setViewMode={setViewMode}

        initializeData={isDataInitialized}
        onInitialize={setIsDataInitialized}
      />
      {/* < Day MM dd YYYY > */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        margin="2"
      >
        <View style={styles.dateSelectionContainer}>
          {/* < icon button */}
          <TouchableOpacity 
            onPress={handlePreviousDate} 
            disabled={isMonday()}
            >
            <ChevronLeftIcon 
              size={6}
              marginRight={3}
              color={isMonday() ? colors.light_gray3 : colors.green}
              />           
          </TouchableOpacity>
          <DateInputField
            handleFormData={setSelectedDate}
            value={selectedDate}
            maximumInputDate={getSunday()}
            minimumInputDate={getMonday()}
            />
          {/* > icon button */}
          <TouchableOpacity onPress={handleNextDate}
            disabled={isSunday()}
            >
            <ChevronRightIcon 
              size={6}
              marginLeft={3}
              color={isSunday() ? colors.light_gray3 : colors.green}
            />
          </TouchableOpacity>
        </View>
      </Stack>
      <FlatList
        // onRefresh={handlePullToRefresh}
        // refreshing={isLoading}
        ListEmptyComponent={noDataMessage}
        data={schedule}
        renderItem={({ item, i }) => {
          if(item.activities.length > 0) {
            return (
            <Box style={styles.rowBox} key={item.patientID}>
              <HStack justifyContent="space-between">
                <Container style={styles.patientContainer}>
                  <ProfileNameButton
                    // navigation={navigation}
                    // route={routes.PATIENT_PROFILE}
                    profileLineOne={item.patientName}
                    profilePicture={item.patientImage}
                    isPatient={true}
                  />
                </Container>
                <ScrollView
                  horizontal={true}
                  width="100%"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{flexGrow: 1}}
                >
                  <HStack>
                    {item.activities.map((activity, i) => (
                      <ActivityCard
                        key={i}
                        activityTitle={activity.activityName}
                        activityStartTime={activity.startTime}
                        activityEndTime={activity.endTime}
                        currentTime={currentTime}
                        medications={activity.medications}
                      />
                    ))}
                  </HStack>                
                </ScrollView>
              </HStack>
            </Box>
          )
        } else {
          return (
            <MessageDisplayCard
              TextMessage={isError ? message : 'No schedules found today'}
              topPaddingSize={'42%'}
            />
          )
        }}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dateSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  patientName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    color: colors.black_var1,
    width: 90,
  },
  patientContainer: {
    width: '15%',
    justifyContent: 'center',
    marginVertical: 15,
    alignItems: 'center',
  },
  rowBox: {
    alignSelf: 'center',
    width: '95%',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    padding: 4,
  },
});

export default DashboardScreen;
