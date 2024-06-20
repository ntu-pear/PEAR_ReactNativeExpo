// Base
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList, Icon } from 'native-base';

// APIs
import highlightApi from 'app/api/highlight';

// Configs
import colors from 'app/config/colors';
import { Platform } from 'react-native';

// Components
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import HighlightsCard from 'app/components/HighlightsCard';
import SearchBar from './input-components/SearchBar';

function PatientDailyHighlights() {
  // State controlling whether modal is visible or not
  const [modalVisible, setModalVisible] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();

  // highlightsData is all data pulled from backend, filteredData is data displayed
  const [highlightsData, setHighlightsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isRetry, setIsRetry] = useState(false);

  // searchValue for SearchBar, filterValue for DropDownPicker
  const [searchValue, setSearchValue] = useState('');
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
    } else {
      const aggregatedData = aggregateHighlightsByType(response.data.data);
      setHighlightsData(aggregatedData);
      setFilteredData(aggregatedData);
      setIsLoading(false);
      setStatusCode(response.status);
      setIsError(false);
      setIsRetry(false);
    }

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

  const aggregateHighlightsByType = (highlights) => {
    const aggregatedHighlights = [];

    highlights.forEach((highlight) => {
      const { highlights } = highlight; // Assuming this is an array of highlight objects
      const aggregated = {};

      highlights.forEach((h) => {
        if (!aggregated[h.highlightType]) {
          aggregated[h.highlightType] = { ...h, count: 1 }; // Copy the highlight and add a count
        } else {
          aggregated[h.highlightType].count += 1; // Increment the count
        }
      });

      aggregatedHighlights.push({
        ...highlight,
        highlights: Object.values(aggregated), // Replace with aggregated highlights
      });
    });

    return aggregatedHighlights;
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
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(!modalVisible)}
        testID={'highlightsButton'}
        style={{flexDirection: 'row'}}
      >
        <Icon 
          as={
            <MaterialIcons 
            name="announcement" 
            />
          } 
          size={10}
          color={colors.light_gray}
        >
        </Icon>
        {highlightsData.length > 0 ? (          
          <View style={styles.iconNumber}>
            <Text style={{color: colors.white_var1, fontSize: 11, fontWeight: '700'}}>{highlightsData.length}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        testID="highlightsModal"
      >
        <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={() => {setModalVisible(!modalVisible)}} >
          <TouchableWithoutFeedback>
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
                <View style={styles.flex}>
                  <SearchBar
                    value={searchValue}
                    onChangeText={setSearchValue}
                  />
                </View>
                <View style={styles.flex}>
                  <SelectionInputField
                    showTitle={false}
                    value={filterValue}
                    dataArray={dropdownItems}
                    onDataChange={setFilterValue}
                    placeholder={'Select Filter'}
                  />
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
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 18 : null,
    fontSize: 25,
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
    justifyContent: 'space-between',
  },
  flex: {
    flex: 0.49,
  }, 
  iconNumber: {
    borderRadius: 27, 
    height: 27, 
    width: 27, 
    backgroundColor: colors.red, 
    borderColor: colors.white_var1, 
    borderWidth: 3, 
    position: 'absolute',
    top: -11,
    right: -12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default PatientDailyHighlights;
