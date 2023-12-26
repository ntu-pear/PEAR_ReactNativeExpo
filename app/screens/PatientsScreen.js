// Libs
import React, { useState, useEffect, useContext } from 'react';
import { Center, VStack, HStack, ScrollView, Fab, Icon, Divider } from 'native-base';
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

function PatientsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const { user, setUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  // set default value to my patients
  const [filterValue, setFilterValue] = useState('myPatients');
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]);
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);
  
  const SCREEN_WIDTH = Dimensions.get('window').width;
  // Refreshes every time the user navigates to PatientsScreen - OUTDATED
  // Now refresh only when new patient is added or user requested refresh
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
      if (isReloadPatientList) {
        setIsLoading(true);
        const promiseFunction = async () => {
          await getListOfPatients();
          // const response = await getListOfPatients();
          // setListOfPatients(response);
        };
        setIsReloadPatientList(false);
        promiseFunction();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  useEffect(() => {
    getListOfPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  // Changed patientListByUserId API to new getPatientListByLoggedInCaregiver API -- Justin
  const getListOfPatients = async () => {
    setIsLoading(true);
    const response =
      filterValue === 'myPatients'
        ? await patientApi.getPatientListByLoggedInCaregiver()
        : await patientApi.getPatientList(false,'active');
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      // checkExpiredLogOutHook.handleLogOut(response);
      setUser(null);
      // await authStorage.removeToken();
      return;
    }
    setOriginalListOfPatients(response.data.data);
    setListOfPatients(response.data.data);
    setIsLoading(false);
    // console.log(filterValue === 'allPatients' ? response : null);
    // return response.data.data;
  };

  const handleFabOnPress = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };

  // Show all patients as expected when nothing is keyed into the search
  useEffect(() => {
    if (!searchQuery) {
      // console.log(
      //   'Setting list of patients to original list:',
      //   originalListOfPatients,
      // );
      setListOfPatients(originalListOfPatients);
    }
    // added originalListOfPatients into the dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Set the search query to filter patient list
  const handleSearch = (text) => {
    // console.log('Handling search query:', text);
    setSearchQuery(text);
  };

  // Filter patient list with search query by FULL NAME
  // const filteredList = listOfPatients
  //   ? listOfPatients.filter((item) => {
  //       // console.log(item);
  //       const fullName = `${item.firstName} ${item.lastName}`;
  //       return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  //     })
  //   : null;

  // const handleOnPress = (item) => {
  //   navigation.push(routes.PATIENT_PROFILE, { patientProfile: item });
  // };

  // Filter patient list with search query by PREFERRED NAME
  const filteredList = listOfPatients
    ? listOfPatients.filter((item) => {
        return item.preferredName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    : null;

  const handleOnPress = (patientID) => {
    console.log(patientID);
    // navigation.push(routes.PATIENT_PROFILE, { patientProfile: item });
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  };

  const handleTabOnPress = (filterValue) => {
    setFilterValue(filterValue)
  }

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <Center backgroundColor={colors.white_var1}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.tab, ...filterValue=='myPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleTabOnPress('myPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...filterValue=='myPatients' ? [styles.selectedTabText] : []]}>My Patients</Text>
            </TouchableOpacity>
            <Divider orientation='vertical' height={5} alignSelf='center'/>
            <TouchableOpacity 
              style={[styles.tab, ...filterValue=='allPatients' ? [styles.selectedTab] : []]}
              onPress={() => handleTabOnPress('allPatients')}
              activeOpacity={1}
              >
                <Text style={[styles.tabText, ...filterValue=='allPatients' ? [styles.selectedTabText] : []]}>All Patients</Text>
            </TouchableOpacity>            
          </View>
          <Divider style={styles.divider}/>
          <View style={styles.optionsContainer}>
            <View style={styles.searchBar}>
              <SearchBar 
                onChangeText={handleSearch}
                value={searchQuery}
              />
            </View>
            <View style={styles.filterIcon}>
              <Icon 
                as={
                  <MaterialIcons 
                  name="filter-list" 
                  />
                } 
                size={12}
                color={colors.black}
              />
            </View>
          </View>
          <View style={styles.patientCount}>
            <Text>{filteredList ? filteredList.length : null} patients</Text>
          </View>
          <Divider/>
          
          <ScrollView
            w="100%"
            height="93%"
            refreshControl={
              <RefreshControl
                refreshing={isReloadPatientList}
                onRefresh={getListOfPatients}
              />
            }
          >
            <VStack alignItems="flex-start" backgroundColor={'yellow'}>
              {filteredList && filteredList.length > 0
                ? filteredList.map((item, index) => (
                    <View style={styles.patientRowContainer} key={index}>
                      <ProfileNameButton
                        // profileLineOne={`${item.firstName} ${item.lastName}`}
                        profileLineOne={item.preferredName}
                        // patient Mary does not have patientAllocationDTO object?
                        // add caregiverName into the All Patients option
                        profileLineTwo={
                          `${item.firstName} ${item.lastName}`
                          // filterValue === 'allPatients'
                          //   ? item.patientAllocationDTO !== null
                          //     ? item.patientAllocationDTO.caregiverName
                          //     : 'No Caregivers'
                          //   : `${item.firstName} ${item.lastName}`
                        }
                        profilePicture={item.profilePicture}
                        // navigation done by patientID to avoid receiving unnecessary patient info -- Justin
                        handleOnPress={() => handleOnPress(item.patientID)}
                        isPatient={true}
                        size={SCREEN_WIDTH / 10}
                        key={index}
                        isVertical={false}
                      />
                      <View style={styles.guardianNameContainer}>
                        <Text style={styles.guardianName}>
                          {filterValue === 'allPatients'
                            ? item.caregiverName !== null
                              ? item.caregiverName
                              : 'No Caregivers'
                            : null}
                        </Text>
                      </View>
                    </View>
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
  filterIcon: {
    flex: 0,
    marginLeft: '1.5%'
  },
  patientRowContainer: {
    marginLeft: '5%',
    marginVertical: '3%',
    width: '90%',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  guardianNameContainer: {
    marginLeft: '5%',
    justifyContent: 'center',
    alignItem: 'center',
  },
  guardianName: {
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
