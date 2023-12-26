// Libs
import React, { useState, useEffect, useContext } from 'react';
import { Center, VStack, HStack, ScrollView, Fab, Icon, Divider } from 'native-base';
import { RefreshControl, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContext from 'app/auth/context';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from 'react-native-elements';
import { StyleSheet, View } from 'react-native';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SelectionInputField from 'app/components/SelectionInputField';
import typography from 'app/config/typography';

function PatientsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const { user, setUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  // set default value to my patients
  const [filterValue, setFilterValue] = useState('myPatients');
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]);
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);
  const [dropdownItems, setDropdownItems] = useState([
    {
      label: 'My Patients',
      value: 'myPatients',
    },
    {
      label: 'All Patients',
      value: 'allPatients',
    },
  ]);
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
        : await patientApi.getPatientList();
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

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <Center backgroundColor={colors.white_var1}>
          <HStack style={styles.headerSearchAndDropDownContainer}>
            <View style={styles.headerContainer}>
              <SearchBar
                placeholder="Search"
                onChangeText={handleSearch}
                value={searchQuery}
                lightTheme={true}
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.searchBarInputStyle}
                inputStyle={{ fontSize: 14 }}
                style={styles.searchBar}
              />
            </View>
            <View
              style={[styles.headerContainer, styles.dropDownOptionsAlignment]}
            >
              {/* Standardized Dropdown picker component --- Justin */}
              <SelectionInputField
                onDataChange={setFilterValue}
                value={filterValue}
                dataArray={dropdownItems}
              />
            </View>
          </HStack>
          <View style={styles.patientCount}>
            <Text>{filteredList.length} patients</Text>
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
          <Center position="absolute" right="5" bottom="2%">
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
          </Center>{' '}
        </Center>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerSearchAndDropDownContainer: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 1,
  },
  dropDownOptionsAlignment: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  headerContainer: {
    flex: 1,
    zIndex: 0,
  },
  searchBarContainer: {
    marginLeft: '2%',
    width: '100%',
    backgroundColor: 'white',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBar: {
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },
  searchBarInputStyle: {
    backgroundColor: colors.white,
    marginTop: 4.5,
    borderRadius: 10,
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
  }
});

export default PatientsScreen;
