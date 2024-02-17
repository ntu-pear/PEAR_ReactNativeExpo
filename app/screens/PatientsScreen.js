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
import SearchBar from 'app/components/input-fields/SearchBar';
import FilterModalCard from 'app/components/filter/FilterModalCard';
import { parseAutoCompleteOptions, parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import FilterIndicator from 'app/components/filter/FilterIndicator';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

function PatientsScreen({ navigation }) {
  const patientListRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  
  // Patient data related states
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]) // list of patients after sort, search, filter
  const [patientStatus, setPatientStatus] = useState('Active'); // Active, Inactive, All
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);
  
  // Search related states
  const [searchOptions, setSearchOptions] = useState('Full Name');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort related states
  const [sortOptions, setSortOptions] = useState(parseSelectOptions(['Full Name', 'Preferred Name', 'Start Date']));
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

  // Constants to map sort/filter names to respective fields in patient data
  const SORTFILTER_MAPPING = {
    'Full Name': 'fullName', 
    'Preferred Name': 'preferredName', 
    'Caregiver': 'caregiverName', 
    'Start Date': 'startDate',
    'Patient Status': 'isActive' 
  }

  // Details related to filter options
  const filterOptionDetails = {
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
    resetSearchSortFilter();
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
    initSortFilter(response.data.data);    
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
  
  // Reset selected search, sort, and filter options
  const resetSearchSortFilter = () => {
    setPatientStatus('active');
    setSearchOptions('Full Name');
    setSearchQuery('');
    setSelectedSort({});
    setSelectedDropdownFilters({});
    setSelectedAutocompleteFilters({});
    setSelectedChipFilters({});
  }

  // Initialize sort and filter options based on view mode
  const initSortFilter = (data) => {
    let tempDropdownFilterOptions = {};
    let tempAutocompleteFilterOptions = {};
    let tempChipFilterOptions = {};

    if(viewMode === 'myPatients') {
      tempChipFilterOptions['Patient Status'] = parseSelectOptions(Object.keys(filterOptionDetails['Patient Status']['options']));
    } else { 
      for(var filter of Object.keys(filterOptionDetails)) {
        let tempFilterOptionList;
        
        // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
        // Else use custom options
        if (Object.keys(filterOptionDetails[filter]['options']).length == 0) {
          tempFilterOptionList = data.map(x => x[SORTFILTER_MAPPING[filter]]);
          tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        } else {
          tempFilterOptionList = Object.keys(filterOptionDetails[filter]['options'])
        }

        // Parse filter options based on dropdown/chip type
        if(filterOptionDetails[filter]['type'] == 'dropdown') {
          tempDropdownFilterOptions[filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
        } else if (filterOptionDetails[filter]['type'] == 'chip') {
          tempChipFilterOptions[filter] = parseSelectOptions(tempFilterOptionList);
        } else if (filterOptionDetails[filter]['type'] == 'autocomplete') {
          tempAutocompleteFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
        }
      }
    }
    setDropdownFilterOptions(tempDropdownFilterOptions);
    setAutocompleteFilterOptions(tempAutocompleteFilterOptions);
    setChipFilterOptions(tempChipFilterOptions);
    setSortOptions(parseSelectOptions(['Full Name', 'Preferred Name', 'Start Date', ...viewMode==='allPatients' ? ['Caregiver'] : []]))
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
  
  // Switch between 'My Patients' and 'All Patients'
  const handleOnToggleViewMode = (mode) => {
    if(mode!=viewMode) {
      setIsLoading(true);
      setViewMode(mode);
    }
  }

  // Switch between search modes (full name, preferred name)
  const handleOnToggleSearchOptions = async(item) => {
    if(item) {      
      item && setSearchOptions(item['title']);
      if(searchQuery != '') {
        handleSearchSortFilter({tempSearchMode: item['title']});
      }   
    }
  }

  // Update search state and handle searching when user changes search query
  const handleSearch = (text) => {
    setSearchQuery(text); 
    handleSearchSortFilter({'text': text})
  }

  // Handle searching, sorting, and filtering of patient data based on patient status
  const handleSearchSortFilter = async ({
    text=searchQuery, 
    tempSelSort=selectedSort, 
    tempSelDropdownFilters=selectedDropdownFilters,
    tempSelChipFilters=selectedChipFilters, 
    tempSelAutocompleteFilters=selectedAutocompleteFilters, 
    tempSearchMode=searchOptions
  }) => {       
    setIsLoading(true);

    let tempPatientStatus = Object.keys(tempSelChipFilters).length > 0 ? tempSelChipFilters['Patient Status']['label'] : 'active';
    if(tempPatientStatus == 'All') {
      tempPatientStatus = '';
    } 
    tempPatientStatus = tempPatientStatus.toLowerCase();
    
    // If patient status has been updated, get patient list from api
    // Otherwise filter the list of patients
    if(tempPatientStatus != patientStatus) {
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
      return item[SORTFILTER_MAPPING[tempSearchMode]].toLowerCase().includes(text.toLowerCase());
    })
      
    // Sort
    filteredListOfPatients = sortArray(filteredListOfPatients, 
      SORTFILTER_MAPPING[Object.keys(tempSelSort).length == 0 ? 
        sortOptions[0]['label'] : 
        tempSelSort['option']['label']],
      tempSelSort['order'] != null ? tempSelSort['order'] : true);
  
    // Dropdown filters
    for (var filter of Object.keys(tempSelDropdownFilters)) {
      if(tempSelDropdownFilters[filter]['label'] != 'All') {
        filteredListOfPatients = filteredListOfPatients.filter((obj) => (
          obj[SORTFILTER_MAPPING[filter]] === tempSelDropdownFilters[filter]['label'])) || []
      }
    }

    // Autocomplete filters
    for (var filter of Object.keys(tempSelAutocompleteFilters)) {
      filteredListOfPatients = filteredListOfPatients.filter((obj) => (
        obj[SORTFILTER_MAPPING[filter]] === tempSelAutocompleteFilters[filter]['title'])) || []
    }

    // Chip Filters
    // Only filter if required
    // For example, patient status is not meant for filtering - it requires new API call, so do not filter
    // Use custom options if declared in FILTER_MAPPING 
    for (var filter of Object.keys(tempSelChipFilters)) {
      if(filterOptionDetails[filter]['isFilter']){
        if(Object.keys(filterOptionDetails[filter]['options']).length == 0) {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[SORTFILTER_MAPPING[filter]] === tempSelChipFilters[filter]['label'])) || []
        } else {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[SORTFILTER_MAPPING[filter]] === filterOptionDetails[filter]['options'][tempSelChipFilters[filter]['label']])) || []
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
        <Center backgroundColor={colors.white_var1}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.tab, ...viewMode=='myPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleOnToggleViewMode('myPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...viewMode=='myPatients' ? [styles.selectedTabText] : []]}>My Patients</Text>
            </TouchableOpacity>
            <Divider orientation='vertical' height={5} alignSelf='center'/>
            <TouchableOpacity 
              style={[styles.tab, ...viewMode=='allPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleOnToggleViewMode('allPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...viewMode=='allPatients' ? [styles.selectedTabText] : []]}>All Patients</Text>
            </TouchableOpacity>            
          </View>
          <Divider style={styles.divider}/>
          <View style={styles.optionsContainer}>
            <View style={styles.searchBar}>
              <SearchBar 
                onChangeText={handleSearch}
                value={searchQuery}
                autoCapitalize='characters'
                inputContainerStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 47}}
              />
            </View>
            <View style={{flex: 0.4}}>
              <AutocompleteDropdown
                dataSet={parseAutoCompleteOptions(['Full Name', 'Preferred Name'])}
                closeOnBlur={true}              
                initialValue='1'
                useFilter={false}
                showClear={false}
                inputHeight={47}
                onSelectItem={(item) => handleOnToggleSearchOptions(item)}
                inputContainerStyle={{backgroundColor: colors.green, color: colors.white, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                textInputProps={{color: colors.white, fontSize: 13.5, fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,}}
                suggestionsListContainerStyle={{zIndex: 100}}
                ChevronIconComponent={(
                <Icon 
                  as={
                    <MaterialIcons 
                    name="keyboard-arrow-down" 
                    />
                  } 
                  size={7}
                  color={colors.white}
                >
                </Icon>)}

              />
            </View>
            <View>
              <FilterModalCard
                sort={{
                  sortOptions: sortOptions,
                  selectedSort: selectedSort,
                  setSelectedSort: setSelectedSort,
                }}
                autoCompleteFilter={{
                  autocompleteFilterOptions:autocompleteFilterOptions,
                  selectedAutocompleteFilters:selectedAutocompleteFilters,
                  setSelectedAutocompleteFilters:setSelectedAutocompleteFilters,
                }}
                dropdownFilter={{
                  dropdownFilterOptions: dropdownFilterOptions,
                  selectedDropdownFilters: selectedDropdownFilters,
                  setSelectedDropdownFilters: setSelectedDropdownFilters,
                }}
                chipFilter={{
                  chipFilterOptions: chipFilterOptions,
                  selectedChipFilters: selectedChipFilters,
                  setSelectedChipFilters: setSelectedChipFilters,
                }}
                handleSortFilter={handleSearchSortFilter}
              />
            </View>
          </View>
          <View
            style={[styles.optionsContainer, {paddingTop: 0}]}
          >
            <View style={styles.patientCount}>
              <Text>No. of patients: {listOfPatients ? listOfPatients.length : null}</Text>
            </View>

            <Divider 
              orientation='vertical' 
              marginHorizontal='2%'
              height={'60%'} 
              alignSelf={'center'}
            />

            <FilterIndicator
              selectedSort={Object.keys(selectedSort).length > 0 ? selectedSort : {'option': sortOptions[0], 'order': true}}
              setSelectedSort={setSelectedSort}
              chipFilterOptions={chipFilterOptions}
              selectedChipFilters={selectedChipFilters}
              selectedDropdownFilters={selectedDropdownFilters}
              setSelectedDropdownFilters={setDropdownFilterOptions}
              handleSortFilter={handleSearchSortFilter}
            />
          </View>
          
          <Divider/>
          
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
        </Center>
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
