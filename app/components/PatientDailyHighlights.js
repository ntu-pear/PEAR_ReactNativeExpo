import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem, SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from 'app/config/colors';
import { FlatList } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import HighlightsCard from 'app/components/HighlightsCard';
import highlightApi from 'app/api/highlight';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientDailyHighlights(props) {
  // Destructure props
  const { modalVisible, setModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const [filteredData, setFilteredData] = useState([]);
  const [highlightsData, setHighlightsData] = useState([]);
  // const [highlightsData, setHighlightsData] = useState([
  //   {
  //     patientInfo: {
  //       patientId: 1,
  //       patientName: 'Alice Lee',
  //       patientPhoto:
  //         'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
  //     },
  //     highlights: [
  //       {
  //         highlightID: 1,
  //         highlightTypeID: 2,
  //         highlightType: 'newAllergy',
  //         highlightJson: {
  //           id: 36,
  //           value: 'New allergy to prawn.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //       {
  //         highlightID: 2,
  //         highlightTypeID: 4,
  //         highlightType: 'abnormalVital',
  //         highlightJson: {
  //           id: 37,
  //           value: 'Heartbeat faster than usual.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //     ],
  //   },
  //   {
  //     patientInfo: {
  //       patientId: 4,
  //       patientName: 'Bi Gong',
  //       patientPhoto:
  //         'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
  //     },
  //     highlights: [
  //       {
  //         highlightID: 3,
  //         highlightTypeID: 1,
  //         highlightType: 'newPrescription',
  //         highlightJson: {
  //           id: 38,
  //           value: 'New prescription for blood pressure.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //       {
  //         highlightID: 4,
  //         highlightTypeID: 6,
  //         highlightType: 'medicalHistory',
  //         highlightJson: {
  //           id: 39,
  //           value: 'New diagnosis for dementia.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //     ],
  //   },
  //   {
  //     patientInfo: {
  //       patientId: 2,
  //       patientName: 'Yan Yi',
  //       patientPhoto:
  //         'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
  //     },
  //     highlights: [
  //       {
  //         highlightID: 5,
  //         highlightTypeID: 4,
  //         highlightType: 'abnormalVital',
  //         highlightJson: {
  //           id: 40,
  //           value: 'Blood pressure lower than usual.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //     ],
  //   },
  //   {
  //     patientInfo: {
  //       patientId: 5,
  //       patientName: 'Hui Wen',
  //       patientPhoto: null,
  //     },
  //     highlights: [
  //       {
  //         highlightID: 5,
  //         highlightTypeID: 3,
  //         highlightType: 'newActivityExclusion',
  //         highlightJson: {
  //           id: 40,
  //           value: 'Should not do jumping activities.',
  //         },
  //         startDate: '2022-12-28T08:21:54.639Z',
  //         endDate: '2022-12-28T08:21:54.639Z',
  //       },
  //     ],
  //   },
  // ]);

  useFocusEffect(
    React.useCallback(() => {
      // Fetches data from highlights api
      getAllHighlights();
    }, []),
  );

  const getAllHighlights = async () => {
    setIsLoading(true);
    setIsError(false);
    const response = await highlightApi.getHighlight();
    if (!response.ok) {
      // return error block
      console.log('Error occurred', response);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      return;
    }
    setIsLoading(false);
    setStatusCode(response.status);
    setHighlightsData(response.data.data);
    console.log(response);
  };

  // Filter data when either searchValue or filterValue changes
  useEffect(() => {
    console.log(searchValue, filterValue);

    // Search by searchValue
    // .toLowerCase() ensures that the search is not case sensitive
    const dataAfterSearch = highlightsData.filter((item) =>
      item.patientInfo.patientName
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );

    // Filter by filterValue (highlight types)
    let dataAfterFilter = highlightsData;
    if (Array.isArray(filterValue) && filterValue.length) {
      console.log('filterValue != []');
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
    setIsRefreshing(true);
    await getAllHighlights();
    setIsRefreshing(false);

    return;
  };

  const noDataMessage = () => {
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
            keyExtractor={(item) => item.patientID}
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
