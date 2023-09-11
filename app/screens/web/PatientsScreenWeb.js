import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Center,
  VStack,
  HStack,
  ScrollView,
  Fab,
  Icon,
  View,
} from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useNavigate } from 'react-router-dom';

import patientApi from 'app/api/patient';
import useCheckExpiredThenLogOut from 'app/hooks/useCheckExpiredThenLogOut';

import PatientScreenCard from 'app/components/PatientScreenCard';
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import ActivityIndicator from 'app/components/ActivityIndicator';

import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

import { SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';

function PatientsScreenWeb(props) {
  // Destructure props
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation, sidebar } = props;
  const [clickedPatientProfile, setPatientProfile] = useState();

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
    },
  ]);

  // Refreshes every time the user navigates to PatientsScreen
  useFocusEffect(
    React.useCallback(() => {
      // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
      // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
      setIsLoading(true);
      const promiseFunction = async () => {
        const response = await getListOfPatients();
        setListOfPatients(response?.data.data);
        // initialize clicked patient as the first patient TODO: error handling for no patient
        setPatientProfile(response?.data.data[0]);
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

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const handleFabOnPress = () => {
    if (Platform.OS === 'web') {
      navigate('/' + routes.PATIENT_ADD_PATIENT);
    } else {
      navigation.navigate(routes.PATIENT_ADD_PATIENT);
    }
  };

  const handlePatientScreenCardClick = (patientProfile, event) => {
    setPatientProfile(patientProfile);
  };

  // Show all patients as expected when nothing is keyed into the search
  useEffect(() => {
    if (!searchQuery) {
      console.log(
        'Setting list of patients to original list:',
        originalListOfPatients,
      );
      setListOfPatients(originalListOfPatients);
    }
  }, [searchQuery]);

  // Set the search query to filter patient list
  const handleSearch = (text) => {
    console.log('Handling search query:', text);
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
      padding: '2%',
      backgroundColor: 'white',
      borderBottomColor: 'transparent',
      borderTopColor: 'transparent',
    },
    searchBar: {
      alignContent: 'flex-start',
      justifyContent: 'flex-start',
    },
    dropDown: {
      marginTop: 10,
      padding: '5%',
      alignContent: 'flex-end',
      justifyContent: 'flex-end',
      width: '93%',
      display: 'flex',
      flexDirection: 'row',
      borderColor: colors.primary_overlay_color,
    },
  });

  return (
    <>
      {isLoading ? (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: sidebar ? '83vw' : '100vw',
          }}
        >
          <ActivityIndicator visible />
        </View>
      ) : (
        <HStack
          w={sidebar ? '83vw' : '98vw'}
          style={{
            // display: 'flex',
            // flexDirection: 'row',
            // width: '100%',
            zIndex: 1,
          }}
        >
          {/* PatientScreen */}
          <View>
            <Center backgroundColor={colors.white_var1}>
              {/* <HStack
                style={{ flexDirection: 'column', width: '100%', zIndex: 1 }}
              > */}
              <View style={{ zIndex: 1 }}>
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
                      borderRadius: 10,
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
                      marginTop: 13,
                      marginLeft: 12,
                      width: '90%',
                      backgroundColor: colors.white,
                    }}
                    textStyle={{
                      fontSize: 18,
                    }}
                    listItemContainerStyle={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                    selectedItemContainerStyle={{
                      backgroundColor: colors.primary_gray,
                    }}
                    placeholderStyle={{
                      color: colors.primary_overlay_color,
                    }}
                  />
                </View>
              </View>
              {/* </HStack> */}
              <ScrollView h="90vh" w="100%">
                <VStack paddingRight="10">
                  {filteredList && filteredList.length > 0
                    ? filteredList.map((item, index) => (
                        <PatientScreenCard
                          patientProfile={item}
                          key={index}
                          navigation={navigation}
                          onClick={(e) => handlePatientScreenCardClick(item, e)}
                        />
                      ))
                    : null}
                </VStack>
              </ScrollView>
              <Center position="absolute" bottom="8" right="1">
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
          </View>

          {/* PatientProfileScreen */}
          {/*
          This is exactly the same as PatientProfileScreen (mobile) except that it has flex 4,
          uses HStack instead of VStack and uses flex for styles.
           */}
          <Center
            backgroundColor={colors.white_var1}
            style={{ flex: 4, borderLeftWidth: 1 }}
          >
            <ScrollView
              w="100%"
              contentContainerStyle={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <VStack
                justifyContent="center"
                alignItems="center"
                mb="5"
                w="100%"
                style={{ flex: 1 }}
              >
                <View w="100%" style={{ flex: 3 }}>
                  <PatientInformationCard
                    patientProfile={clickedPatientProfile}
                    navigation={navigation}
                    w="100%"
                  />
                </View>

                <HStack
                  space={sidebar ? 3 : 6}
                  mx="3"
                  mt="6"
                  style={{ flex: 2 }}
                  flexWrap="wrap"
                >
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="allergy"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Allergy"
                    navigation={navigation}
                    routes={routes.PATIENT_ALLERGY}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="heart-pulse"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Vital"
                    navigation={navigation}
                    routes={routes.PATIENT_VITAL}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <FontAwesome5
                        name="pills"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Prescription"
                    navigation={navigation}
                    routes={routes.PATIENT_PRESCRIPTION}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <FontAwesome5
                        name="exclamation-triangle"
                        size={28}
                        color={colors.pink}
                      />
                    }
                    text="Problem Log"
                    navigation={navigation}
                    routes={routes.PATIENT_PROBLEM_LOG}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="clipboard-text"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Medical History"
                    navigation={navigation}
                    routes={routes.PATIENT_MEDICAL_HISTORY}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <FontAwesome5
                        name="calendar-day"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Activity"
                    navigation={navigation}
                    routes={routes.PATIENT_ROUTINE}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="emoticon-happy"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Patient Preference"
                    navigation={navigation}
                    routes={routes.PATIENT_PREFERENCE}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialIcons
                        name="insert-photo"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Photo Album"
                    navigation={navigation}
                    routes={routes.PATIENT_PHOTO_ALBUM}
                    patientProfile={clickedPatientProfile}
                  />
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="umbrella-beach"
                        size={60}
                        color={colors.pink}
                      />
                    }
                    text="Holiday"
                    navigation={navigation}
                    routes={routes.PATIENT_HOLIDAY}
                    patientProfile={clickedPatientProfile}
                  />
                </HStack>
              </VStack>
            </ScrollView>
          </Center>
        </HStack>
      )}
    </>
  );
}

export default PatientsScreenWeb;
