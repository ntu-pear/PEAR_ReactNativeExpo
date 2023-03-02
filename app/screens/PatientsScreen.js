import React, { useState, useEffect } from 'react';
import { Center, VStack, HStack, ScrollView, Fab, Icon } from 'native-base';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import patientApi from 'app/api/patient';
import useCheckExpiredThenLogOut from 'app/hooks/useCheckExpiredThenLogOut';
import PatientScreenCard from 'app/components/PatientScreenCard';
import colors from 'app/config/colors';
import ActivityIndicator from 'app/components/ActivityIndicator';
import routes from 'app/navigation/routes';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from 'react-native-elements';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

function PatientsScreen(props) {
  // Destructure props
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation } = props;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // set default value to my patients
  const [filterValue, setFilterValue] = useState('myPatients');

  const [dropdownItems, setDropdownItems] = useState([
    {
      label: 'My Patients',
      value: 'myPatients',
      icon: () => (
        <MaterialCommunityIcons
          name="account-multiple"
          size={18}
          color={colors.black_var1}
        />
      ),
    },
    {
      label: 'All Patients',
      value: 'allPatients',
      icon: () => (
        <MaterialCommunityIcons
          name="account-group"
          size={18}
          color={colors.black_var1}
        />
      ),
    }]);

  // Refreshes every time the user navigates to PatientsScreen
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
      setIsLoading(true);
      const promiseFunction = async () => {
        const response = await getListOfPatients();
        setListOfPatients(response.data);
      };
      promiseFunction();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    getListOfPatients();
  }, [filterValue]);

  const getListOfPatients = async () => {
    setIsLoading(true);
    const response =
      filterValue === 'myPatients'
        ? await patientApi.getPatientListByUserId()
        : await patientApi.getPatientList();
  
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    setOriginalListOfPatients(response.data.data);
    setListOfPatients(response.data.data);
    setIsLoading(false);
    return response;
  };

  const [originalListOfPatients, setOriginalListOfPatients] = useState([]);

  const handleFabOnPress = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
  };
  
  // Show all patients as expected when nothing is keyed into the search
  useEffect(() => {
    if (!searchQuery) {
      console.log("Setting list of patients to original list:", originalListOfPatients);
      setListOfPatients(originalListOfPatients);
    }
  }, [searchQuery]);

  // Set the search query to filter patient list
  const handleSearch = (text) => {
    console.log("Handling search query:", text);
    setSearchQuery(text);
  };

  // Filter patient list with search query
  const filteredList = listOfPatients
    ? listOfPatients.filter((item) => {
        const fullName = `${item.firstName} ${item.lastName}`;
        return fullName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : null;

    const styles = StyleSheet.create({
      
      searchBarContainer: {
        marginLeft: '2%',
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent'
      },
      searchBar: {
        alignContent: 'flex-start',
        justifyContent: 'flex-start'
      },
      dropDown: {
        marginTop: 12,
        marginLeft: '3%',
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
        width: '93%',
        borderColor: colors.primary_overlay_color,
      }
    });

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <Center backgroundColor={colors.white_var1}>
          <HStack style={{ flexDirection: 'row', width: '100%', zIndex: 1 }}>
          <View style={{ flex: 1, zIndex: 0 }}>
          <SearchBar
            placeholder="Search"
            //platform="ios"
            onChangeText={handleSearch}
            value={searchQuery}
            lightTheme={true}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={{
              backgroundColor: colors.white,
              marginTop: 4.5,
              borderRadius: 10
            }}
            inputStyle={{ fontSize: 14 }}
            style={styles.searchBar}
          />
          </View>
          <View style={{ flex: 1, zIndex: 0 }}>
          <DropDownPicker
                open={dropdownOpen}
                value={filterValue}
                items={dropdownItems}
                setOpen={setDropdownOpen}
                setValue={setFilterValue}
                setItems={setDropdownItems}
                onChangeItem={(item) => setFilterValue(item.value)}
                mode="BADGE"
                theme="LIGHT"
                multiple={false}
                style={styles.dropDown}
                itemSeparator={true}
                itemSeparatorStyle={{
                  backgroundColor: colors.primary_gray,
                }}
                dropDownContainerStyle={{
                  height: 85,
                  marginTop: 9,
                  marginLeft: 12.1,
                  width: "93%",
                  backgroundColor: colors.white,
                }}
                listItemLabelStyle={{
                  fontSize: 12,
                }}
                selectedItemContainerStyle={{
                  backgroundColor: colors.primary_gray,
                }}
                placeholderStyle={{
                  color: colors.primary_overlay_color,
                }}
              />
              </View>
              </HStack>
              
          <ScrollView w="100%" height="100%">
            <VStack>
              {filteredList && filteredList.length > 0 
                ? filteredList.map((item, index) => (
                    <PatientScreenCard
                      patientProfile={item}
                      key={index}
                      navigation={navigation}
                    />
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
          </Center>{' '}
        </Center>
      )}
    </>
  );
}

export default PatientsScreen;