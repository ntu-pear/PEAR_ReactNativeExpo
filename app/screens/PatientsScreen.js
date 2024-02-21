// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, Divider } from 'native-base';
import { RefreshControl, Dimensions, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import {parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SearchFilterBar from 'app/components/filter/SearchFilterBar';

function PatientsScreen({ navigation }) {
  const patientListRef = useRef(null);

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
  }

  const SEARCH_OPTIONS = parseSelectOptions(['Full Name', 'Preferred Name']);

  // Sort options based on view mode
  const SORT_OPTIONS = {
    'myPatients': ['Full Name', 'Preferred Name', 'Start Date'],
    'allPatients': ['Full Name', 'Preferred Name', 'Start Date','Caregiver']
  };

  // Filter options based on view mode
  const FILTER_OPTIONS = {
    'myPatients': ['Patient Status'],
    'allPatients': ['Patient Status', 'Caregiver']
  }

  // Mapping between sort/filter names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Full Name': 'fullName', 
    'Preferred Name': 'preferredName', 
    'Caregiver': 'caregiverName', 
    'Start Date': 'startDate',
    'Patient Status': 'isActive' 
  }

  // Details of filter options
  // --------------------------
  // type - chip | dropdown | autocomplete (what kind of UI/component to use to display the filter)
  // options - {} | custom dict that maps options for filtering to corresponding values in the patient data
  //                e.g.: {'Active': true, 'Inactive': false, 'All': undefined} for filter corresponding to isActive
  //                      where 'Active' filter option corresponds to isActive=true etc.
  // isFilter - whether the filter is actually to be used for filtering,
  //            since some filters like patient status may be used to make an API call instead of norma; filtering
  // --------------------------
  const FILTER_OPTION_DETAILS = {
    'Caregiver': {
      'type': 'dropdown', 
      'options': {},
      'isFilter': true,
    },
    'Patient Status': {
      'type': 'chip',
      'options': {'Active': true, 'Inactive': false, 'All': undefined}, // define custom options and map to corresponding values in patient data
      'isFilter': false
    } 
  }

  // Patient data related states
  const [isLoading, setIsLoading] = useState(false);
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]) // list of patients after sort, search, filter
  const [patientStatus, setPatientStatus] = useState('Active'); // Active, Inactive, All
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadPatientList, setIsReloadPatientList] = useState(false);
  
  // Search related states
  const [searchOption, setSearchOption] = useState('Full Name');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort related states
  const [sortOptions, setSortOptions] = useState(parseSelectOptions(SORT_OPTIONS[viewMode]))
  const [selectedSort, setSelectedSort] = useState({});

  // Dropdown filter related states
  const [dropdownFilterOptions, setDropdownFilterOptions] = useState({});
  const [selectedDropdownFilters, setSelectedDropdownFilters] = useState({});

  // Autocomplete filter related states
  const [autocompleteFilterOptions, setAutocompleteFilterOptions] = useState({});
  const [selectedAutocompleteFilters, setSelectedAutocompleteFilters] = useState({});
  
  // Chip filter related states
  const [chipFilterOptions, setChipFilterOptions] = useState({}); 
  const [selectedChipFilters, setSelectedChipFilters] = useState({}); 

  // Refresh list when new patient is added or user requests refresh
  // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshListOfPatients();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Get list of patients from backend when user switches between 'My Patients' and 'All Patients'
  // Reset search and filter options
  // Note: not done with function that handles view mode toggling bc of state update latency
  useEffect(() => {
    refreshListOfPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Retrieve patient list from backend
  const getListOfPatients = async (status='active') => {   
    const response =
    viewMode === 'myPatients'
        ? await patientApi.getPatientListByLoggedInCaregiver(undefined, status)
        : await patientApi.getPatientList(undefined, status);

    setOriginalListOfPatients([...response.data.data]);
    setListOfPatients([...response.data.data])
  };
    
  // Set screen to loading wheel when retrieving patient list from backend
  const refreshListOfPatients = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getListOfPatients();
      setIsLoading(false);
    };
    promiseFunction();
  }  

  // On click button to add patient
  const handleOnClickAddPatient = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };
  
  // Navigate to patient profile when patient item is clicked
  const handleOnClickPatientItem = (patientID) => {
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  };

  // Handle searching, sorting, and filtering of patient data based on patient status
  const handleSearchSortFilter = async ({
    text=searchQuery, 
    tempSelSort=selectedSort, 
    tempSelDropdownFilters=selectedDropdownFilters,
    tempSelChipFilters=selectedChipFilters, 
    tempSelAutocompleteFilters=selectedAutocompleteFilters, 
    tempSearchMode=searchOption
  }) => {       
    setIsLoading(true);

    let tempPatientStatus = Object.keys(tempSelChipFilters).length > 0 ? tempSelChipFilters['Patient Status']['label'] : 'active';
    if(tempPatientStatus == 'All') {
      tempPatientStatus = '';
    } 
    tempPatientStatus = tempPatientStatus.toLowerCase();
    
    // If patient status has been updated, get patient list from api
    // Otherwise filter the list of patients
    if(tempPatientStatus != patientStatus.toLowerCase()) {
      console.log(tempPatientStatus, patientStatus)
      await getListOfPatients(tempPatientStatus);
      setPatientStatus(tempPatientStatus);       
    } else {
      setFilteredPatientList(text, tempSelSort, tempSelDropdownFilters, tempSelChipFilters, tempSelAutocompleteFilters, tempSearchMode);
    }   

    setIsLoading(false);
  }

  // Update patient list based on search, sort, and filter criteria
  const setFilteredPatientList = (text, tempSelSort, tempSelDropdownFilters, tempSelChipFilters, tempSelAutocompleteFilters, tempSearchMode) => {
    let filteredListOfPatients = originalListOfPatients.map((obj) => ({
      ...obj,
      fullName: `${obj.firstName.trim()} ${obj.lastName.trim()}`
    }));   

    // Search
    filteredListOfPatients = filteredListOfPatients.filter((item) => {
      return item[FIELD_MAPPING[tempSearchMode]].toLowerCase().includes(text.toLowerCase());
    })
      
    // Sort
    filteredListOfPatients = sortArray(filteredListOfPatients, 
      FIELD_MAPPING[Object.keys(tempSelSort).length == 0 ? 
        sortOptions[0]['label'] : 
        tempSelSort['option']['label']],
      tempSelSort['asc'] != null ? tempSelSort['asc'] : true);
  
    // Dropdown filters
    for (var filter of Object.keys(tempSelDropdownFilters)) {
      if(tempSelDropdownFilters[filter]['label'] != 'All') {
        filteredListOfPatients = filteredListOfPatients.filter((obj) => (
          obj[FIELD_MAPPING[filter]] === tempSelDropdownFilters[filter]['label'])) || []
      }
    }

    // Autocomplete filters
    for (var filter of Object.keys(tempSelAutocompleteFilters)) {
      filteredListOfPatients = filteredListOfPatients.filter((obj) => (
        obj[FIELD_MAPPING[filter]] === tempSelAutocompleteFilters[filter]['title'])) || []
    }

    // Chip Filters
    // Only filter if required
    // For example, patient status is not meant for filtering - it requires new API call, so do not filter
    // Use custom options if declared in FILTER_MAPPING 
    for (var filter of Object.keys(tempSelChipFilters)) {
      if(FILTER_OPTION_DETAILS[filter]['isFilter']){
        if(Object.keys(FILTER_OPTION_DETAILS[filter]['options']).length == 0) {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FIELD_MAPPING[filter]] === tempSelChipFilters[filter]['label'])) || []
        } else {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FIELD_MAPPING[filter]] === FILTER_OPTION_DETAILS[filter]['options'][tempSelChipFilters[filter]['label']])) || []
        }
      }
    }  

    setListOfPatients(filteredListOfPatients);

    // Scroll to top of list
    patientListRef.current?.scrollTo({x: 0, y: 0, animated: true});
  }

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View backgroundColor={colors.white_var1}>
          <SearchFilterBar
            data={originalListOfPatients}
            setIsLoading={setIsLoading}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleSearchSortFilter={handleSearchSortFilter}
            itemCount={listOfPatients ? listOfPatients.length : null}
            constants={{
              VIEW_MODES: VIEW_MODES,
              SEARCH_OPTIONS: SEARCH_OPTIONS,
              SORT_OPTIONS: SORT_OPTIONS,
              FILTER_OPTIONS: FILTER_OPTIONS,
              FILTER_OPTION_DETAILS: FILTER_OPTION_DETAILS,
              FIELD_MAPPING: FIELD_MAPPING,
            }}
            sort= {{
              sortOptions: sortOptions,
              setSortOptions: setSortOptions,
              selectedSort: selectedSort,
              setSelectedSort: setSelectedSort
            }}
            chipFilter={{    
              chipFilterOptions: chipFilterOptions,
              setChipFilterOptions: setChipFilterOptions,
              selectedChipFilters: selectedChipFilters,
              setSelectedChipFilters: setSelectedChipFilters,
            }}
            dropdownFilter={{
              dropdownFilterOptions: dropdownFilterOptions,
              setDropdownFilterOptions: setDropdownFilterOptions,
              selectedDropdownFilters: selectedDropdownFilters,
              setSelectedDropdownFilters: setSelectedDropdownFilters
            }}
            autoCompleteFilter={{
              autocompleteFilterOptions: autocompleteFilterOptions,
              setAutocompleteFilterOptions: setAutocompleteFilterOptions,
              selectedAutocompleteFilters: selectedAutocompleteFilters,
              setSelectedAutocompleteFilters: setAutocompleteFilterOptions,
            }}
            search={{
              setSearchOption: setSearchOption,
              searchQuery: searchQuery,
              setSearchQuery: setSearchQuery
            }}
            />
          <ScrollView
            ref={patientListRef}
            w="100%"
            style={styles.patientListContainer}
            height="90%"
            refreshControl={
              <RefreshControl
                refreshing={isReloadPatientList}
                onRefresh={refreshListOfPatients}
              />
            }
            keyboardShouldPersistTaps='handled'
          >
            <VStack alignItems="flex-start" backgroundColor={'yellow'} marginBottom='10%'>
              {listOfPatients && listOfPatients.length > 0
                ? listOfPatients.map((item, index) => (
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
                        startDate={Object.keys(selectedSort).length > 0 ? selectedSort['option']['label'] == 'Start Date' ? item.startDate : null : null}
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
                  ))
                : (
                  <MessageDisplayCard
                    TextMessage='No patients found'
                    topPaddingSize={'42%'}
                  />
                )}
            </VStack>
          </ScrollView>
          <Center position="absolute" right="5" bottom="5%">
            <Fab
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
          </Center>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    paddingVertical: '1%',
    paddingHorizontal: '2%',
    alignSelf: 'flex-start',
    flexWrap: 'wrap'
  },
  dropDownOptionsAlignment: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  searchBar: {
    flex: 1,    
  },
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
  },
  patientCount: {
    fontSize: 13.5,
    marginLeft: '2%',
    paddingVertical: '1%',
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  tab: {
    padding: '1.5%',
    flex: 0.5,
  },
  tabText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  selectedTab: {
    borderBottomColor: colors.green,
    borderBottomWidth: 3,
  },
  selectedTabText: {
    fontWeight: 'bold',
    color: colors.green,
  }
});

export default PatientsScreen;
