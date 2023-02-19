import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import { FlatList } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import HighlightsCard from 'app/components/HighlightsCard';
import highlightApi from 'app/api/highlight';
import colors from 'app/config/colors';

function PatientDailyHighlights(props) {
  // Destructure props
  const { modalVisible, setModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();

  // highlightsData is all data pulled from backend, filteredData is data displayed
  const [highlightsData, setHighlightsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // searchValue for SearchBar, filterValue for DropDownPicker
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterValue, setFilterValue] = useState([]);
  const [dropdownItems, setDropdownItems] = useState([
    {
      label: 'New Prescription',
      value: 'newPrescription',
      icon: () => (
        <FontAwesome5 name="pills" size={16} color={colors.black_var1} />
      ),
      testID: 'newPrescriptionDropdownItem',
    },
    {
      label: 'New Allergy',
      value: 'newAllergy',
      icon: () => (
        <MaterialCommunityIcons
          name="bacteria"
          size={18}
          color={colors.black_var1}
        />
      ),
      testID: 'newAllergyDropdownItem',
    },
    {
      label: 'New Activity Exclusion',
      value: 'newActivityExclusion',
      icon: () => (
        <FontAwesome5 name="ban" size={18} color={colors.black_var1} />
      ),
    },
    {
      label: 'Abnormal Vital',
      value: 'abnormalVital',
      icon: () => (
        <MaterialCommunityIcons
          name="heart-pulse"
          size={18}
          color={colors.black_var1}
        />
      ),
      testID: 'abnormalVitalDropdownItem',
    },
    {
      label: 'Problem',
      value: 'problem',
      icon: () => (
        <FontAwesome5
          name="exclamation-triangle"
          size={18}
          color={colors.black_var1}
        />
      ),
      testID: 'problemDropdownItem',
    },
    {
      label: 'Medical History',
      value: 'medicalHistory',
      icon: () => (
        <MaterialCommunityIcons
          name="clipboard-text"
          size={18}
          color={colors.black_var1}
        />
      ),
    },
  ]);

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

  const getAllHighlights = async () => {
    setIsLoading(true);
    setIsError(false);
    const response = await highlightApi.getHighlight();
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      return;
    }
    setIsLoading(false);
    setStatusCode(response.status);
    setHighlightsData(response.data.data);
    console.log('Request successful with response: ', response);
  };

  // Filter data when either searchValue or filterValue changes
  useEffect(() => {
    // Search by searchValue
    // .toLowerCase() ensures that the search is not case sensitive
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
    // Display error message if API request fails
    if (isError) {
      if (statusCode == 401) {
        return (
          <Text style={[styles.modalText, styles.modalErrorText]}>
            Error: User is not authenticated.
          </Text>
        );
      } else if (statusCode >= 500) {
        return (
          <Text style={[styles.modalText, styles.modalErrorText]}>
            Error: Server is down. Please try again later.
          </Text>
        );
      }
      return (
        <Text style={[styles.modalText, styles.modalErrorText]}>
          {statusCode} error has occurred.
        </Text>
      );
    }

    // Display message when there are no new highlights
    return (
      <Text style={styles.modalText}>No patient changes found today.</Text>
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
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
            testID="highlightsCloseButton"
          >
            <MaterialCommunityIcons name="close" size={20} />
          </Pressable>
          <View style={{ flexDirection: 'row', width: '100%', zIndex: 1 }}>
            <View style={{ flex: 1 }}>
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
                inputStyle={{ fontSize: 14 }}
                style={styles.searchBar}
              />
            </View>
            <View style={{ flex: 1, zIndex: 1 }}>
              <DropDownPicker
                open={dropdownOpen}
                value={filterValue}
                items={dropdownItems}
                setOpen={setDropdownOpen}
                setValue={setFilterValue}
                // onChangeValue={setFilterValue}
                onPress={setDropdownOpen}
                setItems={setDropdownItems}
                mode="BADGE"
                theme="LIGHT"
                multiple={true}
                badgeDotColors={[
                  colors.pink,
                  colors.pink_lighter,
                  colors.red,
                  colors.green,
                  colors.pink,
                  colors.green_lighter,
                ]}
                style={styles.dropDown}
                itemSeparator={true}
                itemSeparatorStyle={{
                  backgroundColor: colors.primary_gray,
                }}
                dropDownContainerStyle={{
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
                testID="dropdownPicker"
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
              /*
               * Issue resolved -- cannot swipe on Android. Soln: Wrap with <GestureHandlerRootView>
               * Ref: https://stackoverflow.com/questions/70545275/react-native-swipeable-gesture-not-working-on-android
               */
              <GestureHandlerRootView>
                <HighlightsCard item={item} />
              </GestureHandlerRootView>
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
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    height: '70%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    padding: 10,
  },
  buttonClose: {
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  modalHeaderText: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginTop: 15,
    marginLeft: 10,
  },
  modalErrorText: {
    color: 'red',
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
  dropDown: {
    justifyContent: 'flex-end',
    marginTop: 7,
    borderColor: colors.primary_overlay_color,
  },
});

export default PatientDailyHighlights;
