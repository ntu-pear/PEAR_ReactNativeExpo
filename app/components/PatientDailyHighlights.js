// Base
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

//Navigation
import highlightApi from 'app/api/highlight';

// Configs
import colors from 'app/config/colors';
import { Platform } from 'react-native';

// Components
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SelectionInputField from 'app/components/SelectionInputField';
import HighlightsCard from 'app/components/HighlightsCard';
import { SearchBar } from 'react-native-elements';
import { FlatList } from 'native-base';

function PatientDailyHighlights(props) {
  // Destructure props
  const { modalVisible, setModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();

  // highlightsData is all data pulled from backend, filteredData is data displayed
  const [highlightsData, setHighlightsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isRetry, setIsRetry] = useState(false);
  // searchValue for SearchBar, filterValue for DropDownPicker
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterValue, setFilterValue] = useState([]);
  const [dropdownItems, setDropdownItems] = useState([
    {
      label: 'All',
      value: [],
    },
    {
      label: 'New Prescription',
      value: 'newPrescription',
    },
    {
      label: 'New Allergy',
      value: 'newAllergy',
    },
    {
      label: 'New Activity Exclusion',
      value: 'newActivityExclusion',
    },
    {
      label: 'Abnormal Vital',
      value: 'abnormalVital',
    },
    {
      label: 'Problem',
      value: 'problem',
    },
    {
      label: 'New Medical Records',
      value: 'medicalHistory',
    },
  ]);

  const navigation = useNavigation();

  // useFocusEffect runs when user navigates to PatientDailyHighlights from another page
  // referencing: https://reactnavigation.org/docs/use-focus-effect/
  useFocusEffect(
    React.useCallback(() => {
      // Fetch data from highlights api
      getAllHighlights();
      // Reset searchValue and filterValue when user navigates away
      setSearchValue('');
      setFilterValue([]);
    }, []),
  );

  useEffect(() => {
    if (isRetry) {
      getAllHighlights();
      setSearchValue('');
      setFilterValue([]);
    }
  }, [isRetry]);

  const getAllHighlights = async () => {
    setIsLoading(true);
    setIsError(false);
    const response = await highlightApi.getHighlight();
    if (!response.ok) {
      // console.log('Request failed with status code: ', response.status);
      setIsLoading(false);
      setIsError(true);
      setIsRetry(true);
      setStatusCode(response.status);
      return;
    }
    setIsLoading(false);
    setStatusCode(response.status);
    setHighlightsData(response.data.data);
    setIsError(false);
    setIsRetry(false);
    // console.log('Request successful with response: ', response);
  };

  // Filter data when either searchValue or filterValue changes
  useEffect(() => {
    // Search by searchValue
    // .toLowerCase() ensures that the search is not case sensitive
    // console.log(filterValue);
    const dataAfterSearch = highlightsData.filter((item) =>
      item.patientInfo.patientName
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );

    // Filter by filterValue (highlight types)
    let dataAfterFilter = highlightsData;
    // Check if a highlight type is chosen
    // If no highlight type chosen, all patients should be displayed
    if (Array.isArray(filterValue) && filterValue.length) {
      dataAfterFilter = highlightsData.filter((item) =>
        item.highlights.some((h) => filterValue.includes(h.highlightType)),
      );
    }

    // Find intersection of dataAfterSearch and dataAfterFilter
    const data = dataAfterSearch.filter((value) =>
      dataAfterFilter.includes(value),
    );

    // Update Highlights Data with the newly filtered data; to re-render flat list.
    setFilteredData(data);
  }, [highlightsData, searchValue, filterValue]);

  const handlePullToRefresh = async () => {
    await getAllHighlights();
    return;
  };

  const noDataMessage = () => {
    if (isLoading) {
      return <></>;
    }

    // Display error message if API request fails
    let message = '';
    if (isError) {
      if (statusCode === 401) {
        message = 'Error: User not Authenticated';
      } else if (statusCode >= 500) {
        message = 'Server is down. Please try again later.';
      } else {
        message = `${statusCode} error has occured`;
      }
    }
    // Display message when there are no new highlights
    return (
      <MessageDisplayCard
        accessibilityLabel="Text"
        TextMessage={isError ? message : 'Nothing to highlight today'}
        topPaddingSize={'32%'}
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
      testID="highlightsModal"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalHeaderText}>Patients Daily Highlights</Text>
          <Pressable
            style={styles.buttonClose}
            onPress={() => setModalVisible(!modalVisible)}
            testID="highlightsCloseButton"
          >
            <MaterialCommunityIcons
              name="close"
              size={Platform.OS === 'web' ? 42 : 20}
            />
          </Pressable>
          <View style={styles.searchBarDropDownView}>
            <View style={styles.searchBarView}>
              <SearchBar
                placeholder="Search"
                lightTheme={true}
                // round={true}
                value={searchValue}
                onChangeText={setSearchValue}
                autoCorrect={false}
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={{
                  backgroundColor: colors.white,
                  borderRadius: 10,
                }}
                inputStyle={{ fontSize: Platform.OS === 'web' ? 18 : 14 }}
                style={styles.searchBar}
              />
            </View>
            <View style={styles.dropDownView}>
              <SelectionInputField
                value={filterValue}
                dataArray={dropdownItems}
                onDataChange={setFilterValue}
                placeholderText={'Select Filter'}
              />
              {/* Standardized Dropdown component --- Justin */}
            </View>
          </View>
          <FlatList
            w="100%"
            showsVerticalScrollIndicator={true}
            data={filteredData}
            keyExtractor={(item) => item.patientInfo.patientId}
            onRefresh={handlePullToRefresh}
            refreshing={isLoading}
            ListEmptyComponent={noDataMessage}
            renderItem={({ item }) => (
              <HighlightsCard
                item={item}
                navigation={navigation}
                setModalVisible={setModalVisible}
              />
            )}
            testID="flatList"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    // backgroundColor: 'yellow',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    height: Platform.OS === 'web' ? '60%' : '70%',
    width: Platform.OS === 'web' ? '65%' : '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    padding: 10,
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  modalHeaderText: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 18 : null,
  },
  modalText: {
    marginTop: Platform.OS === 'web' ? 24 : 15,
    marginLeft: 10,
    fontSize: Platform.OS === 'web' ? 18 : null,
    textAlign: Platform.OS === 'web' ? 'center' : null,
  },
  modalErrorText: {
    color: 'red',
  },
  searchBarDropDownView: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 1,
  },
  searchBarView: {
    flex: 1,
  },
  searchBarContainer: {
    backgroundColor: 'white',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBar: {
    width: '50%',
    justifyContent: 'flex-start',
  },
  dropDownView: {
    flex: 1,
    zIndex: 1,
    marginTop: 5,
  },
  dropDown: {
    justifyContent: 'flex-end',
    marginTop: 7,
  },
  dropDownWeb: {
    justifyContent: 'flex-end',
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: colors.primary_overlay_color,
    display: 'flex',
    flexDirection: 'row',
    width: '95%',
  },
});

export default PatientDailyHighlights;
