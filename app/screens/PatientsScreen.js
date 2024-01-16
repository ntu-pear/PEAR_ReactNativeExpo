// Libs
import React, { useState, useEffect, useContext } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, Divider } from 'native-base';
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

function PatientsScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('myPatients');
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Patient data
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]) // list of patients after sort, search, filter
  
  // Search, sort, and filter related states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({}); // {'Caregiver' : [{id: 1, title: name1, ...}], ...}
  const [selectedSort, setSelectedSort] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({}); // {'Caregiver': 1, ...}
  
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SORT_OPTIONS = parseSelectOptions(
    ['Full Name', 'Preferred Name', ...viewMode==='allPatients' ? ['Caregiver'] : []]); // {'Caregiver' : [{id: 1, title: name1, ...}], ...}
  const SORT_MAPPING = {'Full Name': 'fullName', 'Preferred Name': 'preferredName', 'Caregiver': 'caregiverName' }
  const FILTER_MAPPING = {'Caregiver': 'caregiverName' }

  // Refresh list when new patient is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      if (isReloadPatientList) {
        setIsLoading(true);
        const promiseFunction = async () => {
          await getListOfPatients();
        };
        setIsReloadPatientList(false);
        promiseFunction();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Get list of patients from backend when user switches between 'My Patients' and 'All Patients'
  // Reset search and filter options
  useEffect(() => {
    getListOfPatients();
    resetSearchSortFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Reset search, sort, and filter options
  const resetSearchSortFilter = () => {
    setSearchQuery('')
    setSelectedSort({});
    setSelectedFilters({})
  }

  // Retrieve patient list from backend
  const getListOfPatients = async () => {
    setIsLoading(true);
    const response =
    viewMode === 'myPatients'
        ? await patientApi.getPatientListByLoggedInCaregiver()
        : await patientApi.getPatientList(false,'active');

    // Check if token has expired, if yes, proceed to log out
    if (!response.ok) {
      // checkExpiredLogOutHook.handleLogOut(response);
      setUser(null);
      // await authStorage.removeToken();
      return;
    }
    setOriginalListOfPatients(response.data.data);
    setListOfPatients(response.data.data)
    setIsLoading(false);  
    
    resetSearchSortFilter();
    initFilterOptions(response.data.data);
  };
  
  // Set filter options
  const initFilterOptions = (data) => {
    if(viewMode === 'myPatients') {
      setFilterOptions({});
    } else { 
      let tempFilterOptions = {};
      for(var filter of Object.keys(FILTER_MAPPING)) {
        let tempFilterOptionList = data.map(x => x[FILTER_MAPPING[filter]]);
        tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        tempFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
      }
      setFilterOptions(tempFilterOptions);
    }
  }

  // On click button to add patient
  const handleFabOnPress = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };
  
  // Navigate to patient profile when patient item is clicked
  const handleOnPress = (patientID) => {
    console.log(patientID);
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  };
  
  // Switch between 'My Patients' and 'All Patients'
  const handleTabOnPress = (filterValue) => {
    setViewMode(filterValue)
  }  

  // Handle searching, sorting, and filtering of patient data
  const handleSearchSortFilter = (text=searchQuery, tempSelSort=selectedSort, tempSelFilters=selectedFilters) => {       
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

  
    // Filter
    for (var filter of Object.keys(tempSelFilters)) {
      filteredListOfPatients = filteredListOfPatients.filter((obj) => (
        obj[SORT_MAPPING[filter]] === tempSelFilters[filter]['title'])) || []
    }

    setListOfPatients(filteredListOfPatients);
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
              onPress={() => handleTabOnPress('myPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...viewMode=='myPatients' ? [styles.selectedTabText] : []]}>My Patients</Text>
            </TouchableOpacity>
            <Divider orientation='vertical' height={5} alignSelf='center'/>
            <TouchableOpacity 
              style={[styles.tab, ...viewMode=='allPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleTabOnPress('allPatients')}
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
              />
            </View>
            
            <FilterModalCard
              sortOptions={SORT_OPTIONS}
              filterOptions={filterOptions}
              handleSortFilter={handleSearchSortFilter}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
          </View>
          <View style={styles.patientCount}>
            <Text>No. of patients: {listOfPatients ? listOfPatients.length : null}</Text>
          </View>
          <Divider/>
          
          <ScrollView
            w="100%"
            style={styles.patientListContainer}
            height="93%"
            refreshControl={
              <RefreshControl
                refreshing={isReloadPatientList}
                onRefresh={getListOfPatients}
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
                      onPress={() => handleOnPress(item.patientID)}
                      >
                      <ProfileNameButton
                        profileLineOne={item.preferredName}
                        profileLineTwo={
                          `${item.firstName} ${item.lastName}`
                        }
                        profilePicture={item.profilePicture}
                        handleOnPress={() => handleOnPress(item.patientID)}
                        isPatient={true}
                        size={SCREEN_WIDTH / 10}
                        key={index}
                        isVertical={false}
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
                : null}
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
              onPress={handleFabOnPress}
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
    // backgroundColor: 'black'
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
