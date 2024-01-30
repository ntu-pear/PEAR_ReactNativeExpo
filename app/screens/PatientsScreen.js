// Libs
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, Divider, HStack } from 'native-base';
import { RefreshControl, Dimensions, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContext from 'app/auth/context';
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
import FilterModalCard from 'app/components/FilterModalCard';
import { parseAutoCompleteOptions, parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import { Chip } from 'react-native-elements';
import MessageDisplayCard from 'app/components/MessageDisplayCard';

function PatientsScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const patientListRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [patientStatus, setPatientStatus] = useState('Active'); // Active, Inactive, All
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Patient data
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]) // list of patients after sort, search, filter
  
  // Search, sort, and filter related states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState({});
  const [dropdownFilterOptions, setDropdownFilterOptions] = useState({}); // {'Caregiver' : [{id: 1, title: name1, ...}], ...}
  const [selectedDropdownFilters, setSelectedDropdownFilters] = useState({}); // {'Caregiver': 1, ...}
  const [chipFilterOptions, setChipFilterOptions] = useState({}); 
  const [selectedChipFilters, setSelectedChipFilters] = useState({}); 

  // Constants  
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SORT_OPTIONS = parseSelectOptions(
    ['Full Name', 'Preferred Name', 'Start Date', ...viewMode==='allPatients' ? ['Caregiver'] : []]); // {'Caregiver' : [{id: 1, title: name1, ...}], ...}
  const SORT_MAPPING = {'Full Name': 'fullName', 'Preferred Name': 'preferredName', 'Caregiver': 'caregiverName', 'Start Date': 'startDate' }
  const FILTER_MAPPING = {
    'Caregiver': {
      'id': 'caregiverName', 
      'type': 'dropdown', 
      'options': []
    },
    'Patient Status': {
      'id': 'isActive', 
      'type': 'chip',
      'options': {'Active': true, 'Inactive': false, 'All': undefined},
      'isFilter': false
    } 
  }

  // Refresh list when new patient is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      if (isReloadPatientList) {
        refreshListOfPatients();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Get list of patients from backend when user switches between 'My Patients' and 'All Patients'
  // Reset search and filter options
  useEffect(() => {
    refreshListOfPatients();
    resetSearchSortFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // When user changes patient status filter, update list of patients
  useEffect(() => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await handleSearchSortFilter();
      setIsLoading(false);    
    };
    promiseFunction();
  }, [originalListOfPatients])

  // Reset search, sort, and filter options
  const resetSearchSortFilter = () => {
    setPatientStatus('active');
    setSearchQuery('')
    setSelectedSort({});
    setSelectedDropdownFilters({})
    setSelectedChipFilters({})
  }

  // Retrieve patient list from backend
  const getListOfPatients = async (status='active') => {
    const response =
    viewMode === 'myPatients'
        ? await patientApi.getPatientListByLoggedInCaregiver(undefined, status)
        : await patientApi.getPatientList(undefined, status);

    // Check if token has expired, if yes, proceed to log out
    if (!response.ok) {
      // checkExpiredLogOutHook.handleLogOut(response);
      setUser(null);
      // await authStorage.removeToken();
      return;
    }
    setOriginalListOfPatients([...response.data.data]);
    setListOfPatients([...response.data.data])
    initFilterOptions(response.data.data);    
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

  // Initiaize filter options (dropdown and chip) based on view mode
  const initFilterOptions = (data) => {
    let tempDropdownFilterOptions = {};
    let tempChipFilterOptions = {};

    if(viewMode === 'myPatients') {
      // Set patient status filter
      tempChipFilterOptions['Patient Status'] = parseSelectOptions(Object.keys(FILTER_MAPPING['Patient Status']['options']));
    } else { 
      for(var filter of Object.keys(FILTER_MAPPING)) {
        let tempFilterOptionList;
        
        // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
        // Else use custom options
        if (Object.keys(FILTER_MAPPING[filter]['options']).length == 0) {
          tempFilterOptionList = data.map(x => x[FILTER_MAPPING[filter]['id']]);
          tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        } else {
          tempFilterOptionList = Object.keys(FILTER_MAPPING[filter]['options'])
        }

        // Parse filter options based on dropdown/chip type
        if(FILTER_MAPPING[filter]['type'] == 'dropdown') {
          tempDropdownFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
        } else if (FILTER_MAPPING[filter]['type'] == 'chip') {
          tempChipFilterOptions[filter] = parseSelectOptions(tempFilterOptionList);
        }

      }
    }
    setDropdownFilterOptions(tempDropdownFilterOptions);
    setChipFilterOptions(tempChipFilterOptions);
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
  const handleOnToggleTab = (filterValue) => {
    if(filterValue!=viewMode) {
      setIsLoading(true);
      setViewMode(filterValue)
    }
  }

  // Handle searching, sorting, and filtering of patient data based on patient status
  const handleSearchSortFilter = async (text=searchQuery, tempSelSort=selectedSort, tempSelDropdownFilters=selectedDropdownFilters, tempSelChipFilters=selectedChipFilters) => {       
    setIsLoading(true);
    // Set patient status according to selected patient status
    // if(Object.keys(tempSelChipFilters).length > 0) {
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
        setFilteredPatientList(text, tempSelSort, tempSelDropdownFilters, tempSelChipFilters);
      }      
    // } 
    // else {
    //   setFilteredPatientList(text, tempSelSort, tempSelDropdownFilters, tempSelChipFilters);
    // }  

    setIsLoading(false);
  }

  // Update patient list based on search, sort, and filter criteria
  const setFilteredPatientList = (text, tempSelSort, tempSelDropdownFilters, tempSelChipFilters) => {
    let filteredListOfPatients = originalListOfPatients.map((obj) => ({
      ...obj,
      fullName: `${obj.firstName.trim()} ${obj.lastName.trim()}`
    }));   

    // Search
    filteredListOfPatients = filteredListOfPatients.filter((item) => {
      return item.fullName.toLowerCase().includes(text.toLowerCase());
    })
      
    // Sort
    filteredListOfPatients = sortArray(filteredListOfPatients, 
      SORT_MAPPING[Object.keys(tempSelSort).length == 0 ? 
        SORT_OPTIONS[0]['label'] : 
        tempSelSort['label']]);
  
    // Dropdown filters
    for (var filter of Object.keys(tempSelDropdownFilters)) {
      filteredListOfPatients = filteredListOfPatients.filter((obj) => (
        obj[FILTER_MAPPING[filter]['id']] === tempSelDropdownFilters[filter]['title'])) || []
    }

    // Chip Filters
    // Only filter if required
    // For example, patient status is not meant for filtering - it requires new API call, so do not filter
    // Use custom options if declared in FILTER_MAPPING 
    for (var filter of Object.keys(tempSelChipFilters)) {
      if(FILTER_MAPPING[filter]['isFilter']){
        if(Object.keys(FILTER_MAPPING[filter]['options']).length == 0) {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FILTER_MAPPING[filter]['id']] === tempSelChipFilters[filter]['label'])) || []
        } else {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FILTER_MAPPING[filter]['id']] === FILTER_MAPPING[filter]['options'][tempSelChipFilters[filter]['label']])) || []
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
              onPress={() => handleOnToggleTab('myPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...viewMode=='myPatients' ? [styles.selectedTabText] : []]}>My Patients</Text>
            </TouchableOpacity>
            <Divider orientation='vertical' height={5} alignSelf='center'/>
            <TouchableOpacity 
              style={[styles.tab, ...viewMode=='allPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleOnToggleTab('allPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...viewMode=='allPatients' ? [styles.selectedTabText] : []]}>All Patients</Text>
            </TouchableOpacity>            
          </View>
          <Divider style={styles.divider}/>
          <View style={styles.optionsContainer}>
            <View style={styles.searchBar}>
              <SearchBar 
                onChangeText={(text) => {
                  setSearchQuery(text);
                  handleSearchSortFilter(text);
                }}
                value={searchQuery}
                placeholder='Search by full name'
                autoCapitalize='characters'
              />
            </View>
            
            <FilterModalCard
              sortOptions={SORT_OPTIONS}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              dropdownFilterOptions={dropdownFilterOptions}
              selectedDropdownFilters={selectedDropdownFilters}
              setSelectedDropdownFilters={setSelectedDropdownFilters}
              chipFilterOptions={chipFilterOptions}
              selectedChipFilters={selectedChipFilters}
              setSelectedChipFilters={setSelectedChipFilters}
              handleSortFilter={handleSearchSortFilter}
            />
          </View>
          <View
            style={styles.optionsContainer}
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
            
            <ScrollView
              horizontal={true}
              flex={1}
              showsHorizontalScrollIndicator={false}
            >
              <View
                style={{flexDirection: 'row'}}
              >
                <Chip              
                  title={"Sort by: " + (Object.keys(selectedSort).length > 0 ? selectedSort['label'] : SORT_OPTIONS[0]['label'])}
                  type="solid"
                  buttonStyle={{backgroundColor: colors.green}} 
                />
                
                {Object.keys(chipFilterOptions).map((filter) => (
                    <Chip
                      key={filter}
                      title={filter + ": " + (Object.keys(selectedChipFilters).includes(filter) ? selectedChipFilters[filter]['label'] : chipFilterOptions[filter][0]['label'])}
                      type="solid"
                      buttonStyle={{backgroundColor: colors.green}}
                      containerStyle={{marginLeft: 5}} 
                    /> 
                ))}

                {Object.keys(selectedDropdownFilters).map((filter) => (
                  <Chip
                    key={filter}
                    title={filter + ": " + selectedDropdownFilters[filter]['title']}
                    type="solid"
                    buttonStyle={{backgroundColor: colors.green}}
                    containerStyle={{marginLeft: 5}}
                    icon={{
                      name: "close",
                      type: "material",
                      size: 20,
                      color: "white",
                      }}
                    iconRight
                    onPress={()=>{}}
                  />
                ))}
              </View>
            </ScrollView>
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
                        size={SCREEN_WIDTH / 10}
                        key={index}
                        isVertical={false}
                        isActive={patientStatus == '' ? item.isActive : null}
                        startDate={selectedSort.label == 'Start Date' ? item.startDate : null}
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
    flex: 1
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
