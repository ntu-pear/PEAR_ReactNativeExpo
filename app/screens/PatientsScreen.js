// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, FlatList } from 'native-base';
import { StyleSheet, View , RefreshControl, Dimensions, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import BackToTopButton from 'app/components/BackToTopButton';

// Utilities
import { isEmptyObject, noDataMessage, sortFilterInitialState } from 'app/utility/miscFunctions';

function PatientsScreen({ navigation }) {
  
  // Quick guide to adding sort/filter options
  // 1. Sort options:
  // - Add name of sort option to SORT_OPTIONS under the respective viewmode (allPatients/myPatients)
  // - Update SORT_FILTER_MAPPING with mapping between the sort name and the corresponding data field (if required) 
  // 2. Filter options:
  // - Add name of filter option to FILTER_OPTIONS under the respective viewmode (allPatients/myPatients)
  // - Update SORT_FILTER_MAPPING with mapping between the filter name and the corresponding data field (if required) 
  // - Update FILTER_OPTION_DETAILS with the type, options if any, and isFilter
  
  // View modes user can switch between (displayed as tab on top)
  const VIEW_MODES = {
    'My Patients': 'myPatients',
    'All Patients': 'allPatients'
  };
  
  // Options for user to search by
  const SEARCH_OPTIONS = ['Full Name', 'Preferred Name'];
  
  // Sort options based on view mode
  const SORT_OPTIONS = {
    'myPatients': ['Full Name', 'Preferred Name', 'Start Date'],
    'allPatients': ['Full Name', 'Preferred Name', 'Start Date','Caregiver']
  };
  
  // Filter options based on view mode
  const FILTER_OPTIONS = {
    'myPatients': ['Patient Status', 'Start Date'],
    'allPatients': ['Patient Status', 'Caregiver', 'Start Date']
  };
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Full Name': 'fullName', 
    'Preferred Name': 'preferredName', 
    'Caregiver': 'caregiverName', 
    'Start Date': 'startDate',
    'Patient Status': 'isActive' 
  };

  // Scrollview ref used to programmatically scroll to top of list
  const patientListRef = useRef(null);

  // Patient data related states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]); // list of patients after sort, search, filter
  const [patientCountInfo, setPatientCountInfo] = useState({}); // list of patients for each caregiver (differentiated by patient status)
  const [justUpdated, setJustUpdated] = useState(false); 
  const [patientStatus, setPatientStatus] = useState('active'); // active, inactive, ''
  const [tempSelPatientStatus, setTempSelPatientStatus] = useState('active'); // active, inactive, ''
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadPatientList, setIsReloadPatientList] = useState(false);
  const [applySortFilter, setApplySortFilter] = useState(true);

  // Search related states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState('Full Name');
  
  // Sort/filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [dropdown, setDropdown] = useState(sortFilterInitialState);
  const [chip, setChip] = useState(sortFilterInitialState);
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
    'Patient Status': {
      'type': 'chip',
      'options': {'Active': true, 'Inactive': false, 'All': undefined}, // define custom options and map to corresponding values in patient data
      'isFilter': false
    },
    'Start Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {}},
      'isFilter': true
    } 
  });

  // Patient status names (what is displayed to the user) mapped to the actual values in the patient data
  const PATIENT_STATUSES = {
    'Active': 'active',
    'Inactive': 'inactive',
    'All': ''
  };

  // Refresh list when new patient is added or user requests refresh
  // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
  useFocusEffect(
    React.useCallback(() => {
      // console.log('PATIENTS -', 1, 'useFocusEffect [isReloadPatientList]', isReloadPatientList);
      if (isReloadPatientList) {
        // console.log('PATIENTS -', 2, 'useFocusEffect if [isReloadPatientList]', isReloadPatientList);
        refreshPatientData();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Refresh patient data from backend when user switches between 'My Patients' and 'All Patients'
  useEffect(() => {
    // console.log('PATIENTS -', 3, 'useEffect [viemode]', viewMode);
    refreshPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // When user toggles patient status filter, update caregiver filter options
  useEffect(() => {
    // console.log('PATIENTS -', 4, 'useEffect [tempSelectedChipFilters]');

    if(chip['tempSel']['Patient Status'] != undefined && viewMode == 'allPatients' && !justUpdated) {
      console.log('PATIENTS -', 4.5, 'useEffect [tempSelectedChipFilters]');
      let tempPatientStatus = PATIENT_STATUSES[
        !isEmptyObject(chip['tempSel']) 
        ? chip['tempSel']['Patient Status']['label'] 
        : 'Active'
      ]
      if(tempPatientStatus != tempSelPatientStatus) {
        updateCaregiverFilterOptions({tempPatientStatus: tempPatientStatus});
        setApplySortFilter(false);
        setIsDataInitialized(true);
        setTempSelPatientStatus(tempPatientStatus);
      } 
    } else {  
      setJustUpdated(false);
    }
  }, [chip['tempSel']['Patient Status']])

  // Retrieve patient list from backend
  const getListOfPatients = async (status='active') => {   
    // console.log('PATIENTS -', 6, 'getListOfPatients');

    const response =
    viewMode === 'myPatients'
        ? await patientApi.getPatientListByLoggedInCaregiver(undefined, status)
        : await patientApi.getPatientList(undefined, status);

    if(response.ok) {
      const listWithFullName = response.data.data.map(item => ({
        ...item,
        fullName: item.firstName.trim() + ' ' + item.lastName.trim(),
      })); //change type of sort here

      setOriginalListOfPatients([...listWithFullName]);
      setListOfPatients([...listWithFullName])
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

  // Retrieve cargivers patient count list from backend
  const getPatientCountInfo = async(tempPatientStatus=patientStatus) => {
    // console.log('PATIENTS -', 7, 'getPatientCountInfo');

    const response = await patientApi.getPatientStatusCountList();

    if(response.ok) {
      setPatientCountInfo(response.data);
      updateCaregiverFilterOptions({tempPatientCountInfo: response.data, tempPatientStatus: tempPatientStatus});
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  }

  // Set screen to loading wheel when retrieving patient list from backend
  // Note: Once the data is retrieved from backend, setIsLoading is set to false momentarily so SearchFilterBar can render and initialize data
  const refreshPatientData = (tempPatientStatus=patientStatus) => {
    console.log('PATIENTS -', 8, 'refreshPatientData');

    setIsLoading(true);
    const promiseFunction = async () => {
      await getListOfPatients(tempPatientStatus);
      if(viewMode === 'allPatients') {
        await getPatientCountInfo(tempPatientStatus);
      }
      setIsLoading(false);        
      setIsDataInitialized(true);
      setIsLoading(true);        
    };
    promiseFunction();
  }  

  // Update filter options for Caregiver filter based on patient count data from backend
  const updateCaregiverFilterOptions = ({tempPatientCountInfo=patientCountInfo, tempPatientStatus=patientStatus}) => {
    
    let caregiverPatientCount = {};
    for (var caregiverID of Object.keys(tempPatientCountInfo)) {
      const caregiverName = tempPatientCountInfo[caregiverID]['fullName']
      const patientCount = tempPatientStatus == 'active' 
      ? tempPatientCountInfo[caregiverID]['activePatients']
      : tempPatientStatus == 'inactive'
      ? tempPatientCountInfo[caregiverID]['inactivePatients']
      : tempPatientCountInfo[caregiverID]['activePatients'] + tempPatientCountInfo[caregiverID]['inactivePatients']
      
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
    tempSelDatetimeFilters,
    tempSearchMode,
    setFilteredList
  }) => {       
    // console.log('PATIENTS -', 10, 'handleSearchSortFilter', tempSelChipFilters);

    setIsLoading(true);
    setApplySortFilter(true);

    let tempPatientStatus = PATIENT_STATUSES[
      !isEmptyObject(tempSelChipFilters) 
        ? tempSelChipFilters['Patient Status']['label'] 
        : 'Active'
    ]
    
    if(tempPatientStatus != patientStatus) {
      refreshPatientData(tempPatientStatus);
      setPatientStatus(tempPatientStatus); 
      setTempSelPatientStatus(tempPatientStatus);      
    } else {
      setFilteredList({
        text: text, 
        tempSelSort: tempSelSort, 
        tempSelDropdownFilters: tempSelDropdownFilters,
        tempSelChipFilters: tempSelChipFilters, 
        tempSelDatetimeFilters: tempSelDatetimeFilters,
        tempSearchMode: tempSearchMode,
      });
      
      setIsLoading(false);    
    }   
  }
  
  // On click button to add patient
  const handleOnClickAddPatient = () => {
    // console.log('PATIENTS -', 11, 'handleOnClickAddPatient');

    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };
  
  // Navigate to patient profile when patient item is clicked
  const handleOnClickPatientItem = (patientID) => {
    // console.log('PATIENTS -', 12, 'handleOnClickPatientItem');

    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  };

  // Whether to show start date for each patient - depends on whether sort/filter using start date applied
  const showStartDate = () => {
    return (!isEmptyObject(sort['sel']) ? sort['sel']['option']['label'] == 'Start Date' : false) || 
      ('Start Date' in datetime['sel'] ? (
        (datetime['sel']['Start Date']['min'] && datetime['sel']['Start Date']['min'] != null) || 
        (datetime['sel']['Start Date']['max'] && datetime['sel']['Start Date']['max'] != null) 
      ) : false)        
  }

  return (
    <>{isLoading ? (
        <ActivityIndicator testID='patients_loading' visible />
      ) : (
        <View testID='patients' backgroundColor={colors.white_var1}>
          <SearchFilterBar
            testID='patients_searchFilter'
            originalList={originalListOfPatients}
            setList={setListOfPatients}
            setIsLoading={setIsLoading}

            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}

            applySortFilter={applySortFilter}
            setApplySortFilter={setApplySortFilter}

            itemCount={listOfPatients ? listOfPatients.length : null}
            handleSearchSortFilterCustom={handleSearchSortFilter}
            
            VIEW_MODES={VIEW_MODES}
            viewMode={viewMode}
            setViewMode={setViewMode}

            FIELD_MAPPING={FIELD_MAPPING}

            sort={sort}
            setSort={setSort}

            dropdown={dropdown}
            setDropdown={setDropdown}
            
            chip={chip}
            setChip={setChip}

            datetime={datetime}
            setDatetime={setDatetime}
            
            SORT_OPTIONS={SORT_OPTIONS}
            
            FILTER_OPTIONS={FILTER_OPTIONS}
            filterOptionDetails={filterOptionDetails}
            
            SEARCH_OPTIONS={SEARCH_OPTIONS}
            searchOption={searchOption}
            setSearchOption={setSearchOption}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <View style={{height:'85%'}}>
            <FlatList
              ref={patientListRef}
              marginBottom={'20'}
              onRefresh={refreshPatientData}
              refreshing={isLoading}
              ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No patients found', true)}
              data={listOfPatients}
              style={styles.patientListContainer}
              renderItem={({ item, index }) => {
              return (
                <TouchableOpacity 
                  style={styles.patientRowContainer} 
                  key={index}
                  onPress={() => handleOnClickPatientItem(item.patientID)}
                  >
                  <ProfileNameButton
                    profileLineOne={item.preferredName}
                    profileLineTwo={
                      `${item.firstName} ${item.lastName}`
                    }
                    profilePicture={item.profilePicture}
                    handleOnPress={() => handleOnClickPatientItem(item.patientID)}
                    isPatient={true}
                    size={Dimensions.get('window').width / 10}
                    key={index}
                    isVertical={false}
                    isActive={patientStatus == '' ? item.isActive : null}
                    startDate={showStartDate() ? item.startDate : null}
                  />
                  <View style={styles.caregiverNameContainer}>
                    <Text style={styles.caregiverName}>
                      {viewMode === 'allPatients'
                        ? item.caregiverName !== null
                          ? item.caregiverName
                          : 'No Caregiver'
                        : null}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}}
            />
            <Center position="absolute" right="5" bottom="15%">
              <Fab
                testID='addPatients'
                backgroundColor={colors.pink}
                icon={
                  <Icon
                    as={MaterialIcons}
                    color={colors.white}
                    name="person-add-alt"
                    size="lg"
                    placement="bottom-right"
                  />
                }
                onPress={handleOnClickAddPatient}
                renderInPortal={false}
                shadow={2}
                size="sm"
              />
              <BackToTopButton 
                flatListRef={patientListRef}
                position="bottom-right"
                offset={17.5} 
              />
            </Center>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  patientListContainer: {
    paddingHorizontal: '5%',
    zIndex: -1,
  },
  patientRowContainer: {
    marginVertical: '3%',
    width: '100%',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  caregiverNameContainer: {
    marginLeft: '5%',
    justifyContent: 'center',
    alignItem: 'center',
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: 'bold',
  }
});

export default PatientsScreen;
