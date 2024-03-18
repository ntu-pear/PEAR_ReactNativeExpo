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
import routes from 'app/navigation/routes';

// Components
import ActivityCard from 'app/components/ActivityCard';
import DateInputField from 'app/components/input-components/DateInputField';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import ProfileNameButton from 'app/components/ProfileNameButton';
import ActivityIndicator from 'app/components/ActivityIndicator';

// Utilities
import globalStyles from 'app/utility/styles.js';
import { formatDate, formatTimeMilitary, isEmptyObject, sortFilterInitialState } from 'app/utility/miscFunctions';

function DashboardScreen({ navigation }) {
  // View modes user can switch between (displayed as tab on top)
  const VIEW_MODES = {
    'My Patients': 'myPatients',
    'All Patients': 'allPatients'
  };

  // Options for user to search by
  const SEARCH_OPTIONS = ['Full Name', 'Preferred Name'];
  
  // Sort options based on view mode
  const SORT_OPTIONS = {
    'myPatients': ['Full Name', 'Preferred Name', 'Patient Start Date'],
    'allPatients': ['Full Name', 'Preferred Name', 'Patient Start Date', 'Caregiver']
  };
  
  // Filter options based on view mode
  const FILTER_OPTIONS = {
    'myPatients': [ 'Activity Type', 'Patient Start Date', 'Activity Time'],
    'allPatients': ['Caregiver', 'Patient Start Date', 'Activity Type', 'Patient Start Date', 'Activity Time']
  };
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Full Name': 'patientFullName', 
    'Preferred Name': 'patientPreferredName', 
    'Caregiver': 'patientCaregiverName', 
    'Patient Start Date': 'patientStartDate',
    'Activity Type': 'activityTitle',
    'Activity Time': 'startTime'
  };
  
  // Patient ata related states
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
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadSchedule, setIsReloadSchedule] = useState(false);  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Search related states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState('Full Name');
  
  // Sort/filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
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
    'Caregiver': {
      'type': 'dropdown', 
      'options': {},
      'isFilter': true,
    },
    'Patient Start Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {}},
      'isFilter': true,
    },
    'Activity Type': {
      'type': 'dropdown',
      'options': {},
      'isFilter': false,
      'nestedFilter': 'activities'
    },
    'Activity Time': {
      'type': 'time',
      'options': {'min': {}, 'max': {}, 'date': selectedDate},
      'isFilter': false,
      'nestedFilter': 'activities'
    },
  });

  // Refresh schedule when new user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      console.log('DB 1 - useCallback')
      if (isReloadSchedule) {
        console.log('DB 1.5 - useCallback')
        refreshSchedule();
        setIsReloadSchedule(false);
      }
    }, [isReloadSchedule]),
    );
    
  // Refresh schedule from backend when user switches between 'My Patients' and 'All Patients'
  useEffect(() => {
    console.log('DB 2 - useEffect [viewMode]')
    refreshSchedule();
  }, [viewMode]);

  // Refresh schedule if isRetry is set to true
  useEffect(() => {
    console.log('DB 2 - useEffect [isRetry]')
    if (isRetry) {
      console.log('DB 2.5 - useEffect [isRetry]')
      console.log('Retrying dashboard API call');
      refreshSchedule();
    }
  }, [isRetry]);

  // Update activity list when weekly schedule is refreshed
  useEffect(() => {
    console.log('DB 3-1 - useEffect [isRetry]')    
    setFilterOptionDetails(prevState=>({
      ...prevState,
      'Activity Type': {
        ...prevState['Activity Type'],
        options: getActivityList({...originalScheduleWeekly})
      }
    }))
  }, [originalScheduleWeekly]);

  // Set screen to loading wheel when retrieving schedule from backend
  // Note: Once the data is retrieved from backend, setIsLoading is set to false momentarily so SearchFilterBar can render and initialize data
  const refreshSchedule = () => {
    console.log('DB 3 - refreshSchedule')
    setIsLoading(true);
    const promiseFunction = async () => {
      await getData();
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
    console.log('DB 4 - updateSchedule')

    if(!isEmptyObject(tempScheduleWeekly)) {      
      const currentDate = formatDate(tempSelectedDate, true);
      setOriginalSchedule([...tempScheduleWeekly[currentDate]]);
      // if(checkAllEmptySchedules(tempScheduleWeekly[currentDate])) {
      //   setSchedule([]);
      // } else {
        setSchedule([...tempScheduleWeekly[currentDate]]);
      // }
    }
  }

  // Retrieve schedule from backend
  const getSchedule = async(tempPatientInfo=patientInfo) => { 
    console.log('DB 5 - getSchedule')

    const response =
    viewMode === 'myPatients'
        ? await scheduleApi.getSchedule()
        : await scheduleApi.getSchedule();
    
    if(response.ok) {
      parseScheduleData({tempPatientInfo:tempPatientInfo, tempSchedule:response.data.data})
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Retrieve patient list from backend
  const getData = async () => {   
    console.log('DB 6 - getListOfPatients');

    const response =
    viewMode === 'myPatients'
        // ? await patientApi.getPatientListByLoggedInCaregiver(undefined, status)
        ? await patientApi.getPatientList(undefined, '') // actually supposed to be active patients only but rn schedule returns for inactive patiens also
        : await patientApi.getPatientList(undefined, '');
    
    if(response.ok) {
      setPatientInfo([...response.data.data])
      await getSchedule([...response.data.data]);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Parse data returned by api to required format to display schedule
  const parseScheduleData = ({tempPatientInfo, tempSchedule}) => {
    console.log('DB 7 - parseScheduleData')

    if(tempSchedule == null) {
      setOriginalScheduleWeekly({});
      setOriginalSchedule([]);
      setSchedule([]);
    } else {
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      let tempScheduleWeekly = {};
      
      for(var i = 0; i<tempSchedule.length; i++) {
        let scheduleDate = new Date(tempSchedule[0]['startDate']);
        for(var j = 0; j<daysOfWeek.length; j++) {
          const day = daysOfWeek[j];
          const scheduleDateStr = formatDate(scheduleDate, true);
          if(Object.keys(tempScheduleWeekly).length <= j) {
            tempScheduleWeekly[scheduleDateStr] = [];
          }
          const patientData = tempPatientInfo.filter(x=>x.patientID == tempSchedule[i]['patientID'])[0];
          // console.log(patientData.startDate)
          
          const patientDailySchedule = {
            patientID: tempSchedule[i]['patientID'],
            patientName: tempSchedule[i]['patientName'],
            patientStartDate: patientData['startDate'],
            patientFullName: patientData['firstName'] + " " + patientData['lastName'],
            patientPreferredName: patientData['preferredName'],
            patientCaregiverName: patientData['caregiverName'],
            patientImage: tempSchedule[i]['patientImage'],
            activities: parseScheduleString(tempSchedule[i][day], scheduleDate),
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
    // console.log('DB 8 - parseScheduleString')

    let scheduleData = [];
    let startTime = new Date(scheduleDate)
    startTime.setHours(9, 0, 0, 0);
    let endTime = new Date(scheduleDate)
    endTime.setHours(10, 0, 0, 0);

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
              medName: medName,
              medDosage: medDosage,
              medTime: formatTimeMilitary(medTime),
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
    console.log('DB 14 - getActivityList');

    const activities = [];
    Object.keys(tempWeeklySchedule).forEach((day) => {
      tempWeeklySchedule[day].forEach((item) => {
        item.activities.forEach((activity) => {
          if (!activities.includes(activity.activityTitle)) {
            activities.push(activity.activityTitle);
          }
        });
      });
    })
    activities.sort();
     
    const dictActivities = activities.reduce((acc, currentValue) => {
      acc[currentValue] = currentValue;
      return acc;
    }, {});

    return dictActivities;
  };

  // Retrieve cargivers patient count list from backend
  const getPatientCountInfo = async() => {
    console.log('DB 9 - getPatientCountInfo')

    const response = await patientApi.getPatientStatusCountList();

    if(response.ok) {
      setPatientCountInfo(response.data);
      updateCaregiverFilterOptions({tempPatientCountInfo: response.data});
    }
  }

  // Update filter options for Caregiver filter based on patient count data from backend
  const updateCaregiverFilterOptions = ({tempPatientCountInfo=patientCountInfo}) => {
    console.log('DB 10 - updateCaregiverFilterOptions')
    
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
  }    

  // Handle searching, sorting, and filtering of patient data based on patient status  
  // If patient status has been updated, get patient list from api
  // Otherwise filter the list of patients
  const handleSearchSortFilter = async ({
    text,
    tempSelSort, 
    tempSelDropdownFilters,
    tempSelDateFilters,
    tempSearchMode,
    setFilteredList
  }) => {       
    console.log('DB 11 - handleSearchSortFilter');

    setIsLoading(true);

    setFilteredList({
      text: text, 
      tempSelSort: tempSelSort, 
      tempSelDropdownFilters: tempSelDropdownFilters, 
      tempSelDateFilters: tempSelDateFilters,
      tempSearchMode: tempSearchMode,
    });

    if(checkAllEmptySchedules(schedule)) {
      setSchedule([]);
    }

    setIsLoading(false);    
  }

  const handlePreviousDate = () => {
    console.log('DB 12 - handlePreviousDate');

    let previous = new Date(selectedDate.setDate(selectedDate.getDate() - 1));
    setSelectedDate(previous);
    updateSchedule({tempSelectedDate: previous});
    onToggleSelectedDate(previous);
    // setIsLoading(true);
    setIsDataInitialized(true);
  };

  const handleNextDate = () => {
    console.log('DB 13 - handleNextDate');
    
    let next = new Date(selectedDate.setDate(selectedDate.getDate() + 1));
    setSelectedDate(next);
    updateSchedule({tempSelectedDate: next});
    onToggleSelectedDate(next);
    setIsDataInitialized(true);
    // setIsLoading(true);
  };

  // When user toggles date, update filter details and selected datetime filter accordingly
  const onToggleSelectedDate = (newDate) => {
    setFilterOptionDetails(prevState=>({
      ...prevState,
      'Activity Time': {
        ...prevState['Activity Time'],
        options: {
          ...prevState['Activity Time']['options'],
          date: newDate
        }
      }
    }))

    const minActivityTime = datetime['sel']['Activity Time']['min'] ? new Date(datetime['sel']['Activity Time']['min']) : null;
    const maxActivityTime = datetime['sel']['Activity Time']['max'] ? new Date(datetime['sel']['Activity Time']['max']) : null;

    setDatetime(prevState=>({
      ...prevState,
      'sel': {
        ...prevState['sel'],
        'Activity Time': {
          'min': minActivityTime ? new Date(newDate.setHours(minActivityTime.getHours(), minActivityTime.getMinutes(), 0)) : null,
          'max': maxActivityTime ? new Date(newDate.setHours(maxActivityTime.getHours(), maxActivityTime.getMinutes(), 0)) : null
        }
      },
      'tempSel': {
        ...prevState['tempSel'],
        'Activity Time': {
          'min': minActivityTime ? new Date(newDate.setHours(minActivityTime.getHours(), minActivityTime.getMinutes(), 0)) : null,
          'max': maxActivityTime ? new Date(newDate.setHours(maxActivityTime.getHours(), maxActivityTime.getMinutes(), 0)) : null
        }
      },
    }));
  }

  // Check if all schedules are empty
  const checkAllEmptySchedules = (tempSchedule) => {
    for(var i = 0; i<schedule.length; i++) {
      if(schedule[i]['activities'].length > 0) {
        return false
      }
    }
    return true;
  }

  // Returns message to display if api call error or no data to display
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
        TextMessage={isError ? message : 'No schedules found'}
        topPaddingSize={'36%'}
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

  const onClickPatientProfile = (patientID) => {
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  }

  const showStartDate = () => {
    return (!isEmptyObject(sort['sel']) ? sort['sel']['option']['label'] == 'Patient Start Date' : false) || 
      'Patient Start Date' in datetime['sel'] ? (
        (datetime['sel']['Patient Start Date']['min'] && datetime['sel']['Patient Start Date']['min'] != null) || 
        (datetime['sel']['Patient Start Date']['max'] && datetime['sel']['Patient Start Date']['max'] != null) 
      ) : false    
  }

  return (
    <>{isLoading ? (
      <ActivityIndicator visible />
    ) : (
      <View
        style={globalStyles.mainContentContainer}
      >
        <SearchFilterBar
          originalList={originalSchedule}
          setList={setSchedule}
          setIsLoading={setIsLoading}

          initializeData={isDataInitialized}
          onInitialize={() => setIsDataInitialized(false)}

          itemCount={schedule ? schedule.length : null}
          handleSearchSortFilterCustom={handleSearchSortFilter}
          
          VIEW_MODES={VIEW_MODES}
          viewMode={viewMode}
          setViewMode={setViewMode}

          FIELD_MAPPING={FIELD_MAPPING}

          SORT_OPTIONS={SORT_OPTIONS}
          sort={sort}
          setSort={setSort}
          
          FILTER_OPTIONS={FILTER_OPTIONS}
          filterOptionDetails={filterOptionDetails}
          
          dropdown={dropdown}
          setDropdown={setDropdown}

          datetime={datetime}
          setDatetime={setDatetime}    
          
          SEARCH_OPTIONS={SEARCH_OPTIONS}
          searchOption={searchOption}
          setSearchOption={setSearchOption}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
          onRefresh={handlePullToRefresh}
          refreshing={isLoading}
          ListEmptyComponent={noDataMessage}
          data={schedule}
          renderItem={({ item, i }) => {
              return (
              <Box style={styles.rowBox} key={item.patientID}>
                <HStack justifyContent="space-between">
                  <Container style={styles.patientContainer}>
                    <ProfileNameButton
                      handleOnPress={() => onClickPatientProfile(item.patientID)}
                      profileLineOne={item.patientPreferredName}
                      profilePicture={item.patientImage}
                      isPatient={true}
                    />
                    {viewMode == 'allPatients' ? (
                      <>
                        <Text style={{textAlign: 'center'}}>Caregiver:</Text>
                        <Text style={{textAlign: 'center'}}>{item.patientCaregiverName}</Text>
                      </>
                    ) : null}
                    {showStartDate() ? (
                      <>
                        <Text style={{textAlign: 'center'}}>Patient Start Date:</Text>
                        <Text style={{textAlign: 'center'}}>{formatDate(new Date(item.patientStartDate), true)}</Text>
                      </>
                    ) : null}
                  </Container>
                  <ScrollView
                    horizontal={true}
                    width="100%"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{flexGrow: 1, alignItems: 'center', justifyContent: item.activities.length > 0 ? 'flex-start': 'center'}}
                  >
                    <HStack>
                      {item.activities.map((activity, i) => (
                        <ActivityCard
                          key={i}
                          activityTitle={activity.activityTitle}
                          activityStartTime={activity.startTime}
                          activityEndTime={activity.endTime}
                          currentTime={currentTime}
                          medications={activity.medications}
                          patientName={item.patientName}
                          patientID={item.patientID}
                          date={item.date}
                          navigation={navigation}
                        />
                      ))}
                    </HStack>                
                  </ScrollView>
                </HStack>
              </Box>
            )
          }}
        />
      </View>
      )}
    </>
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
