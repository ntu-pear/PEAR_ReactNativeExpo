import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem, SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from 'app/config/colors';
import { FlatList } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HighlightsCard from 'app/components/HighlightsCard';
import highlightApi from 'app/api/highlight';

function PatientDailyHighlights(props) {
  // Destructure props
  const { modalVisible, setModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(['all']);
  const [items, setItems] = useState([
    {
      label: 'New Prescription',
      value: 'newPrescription',
      icon: () => (
        <FontAwesome5 name="pills" size={16} color={colors.black_var1} />
      ),
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
  // const [highlightsData, setHighlightsData] = useState([]);
  const [highlightsData, setHighlightsData] = useState([
    {
      patientName: 'Alice Lee',
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
      patientID: 1,
      highlights: [
        {
          highlightID: 1,
          highlightTypeID: 2,
          highlightType: 'newAllergy',
          highlightJson: {
            id: 36,
            value: 'New allergy to prawn.',
          },
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
        {
          highlightID: 2,
          highlightTypeID: 4,
          highlightType: 'abnormalVital',
          highlightJson: {
            id: 37,
            value: 'Heartbeat faster than usual.',
          },
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
      ],
    },
    {
      patientName: 'Bi Gong',
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
      patientID: 4,
      highlights: [
        {
          highlightID: 3,
          highlightTypeID: 1,
          highlightType: 'newPrescription',
          highlightJson: {
            id: 38,
            value: 'New prescription for blood pressure.',
          },
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
        {
          highlightID: 4,
          highlightTypeID: 6,
          highlightType: 'medicalHistory',
          highlightJson: {
            id: 39,
            value: 'New diagnosis for dementia.',
          },
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
      ],
    },
    {
      patientName: 'Yan Yi',
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
      patientID: 2,
      highlights: [
        {
          highlightID: 5,
          highlightTypeID: 4,
          highlightType: 'abnormalVital',
          highlightJson: {
            id: 40,
            value: 'Blood pressure lower than usual.',
          },
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
      ],
    },
  ]);

  // useEffect(() => {
  //   // Fetches data from highlights api
  //   console.log("Calling API")
  //   getAllHighlights();
  // }, []);

  const getAllHighlights = async () => {
    setIsLoading(true);
    const response = await highlightApi.getHighlight();
    if (!response.ok) {
      // return error block
      console.log('Error occurred', response);
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
    setHighlightsData(response.data.data);
    console.log(response);
  };

  const searchAndRerender = (text) => {
    setSearchValue(text);
    console.log(text);
    // Filter Data
    const data = highlightsData.filter((item) =>
      item.patientName.includes(text),
    );
    // Update Highlights Data with the newly filtered data; to re-render flat list.
    setFilteredData(data);
  };

  const filterAndRerender = (values) => {
    setValue(values);
    console.log(values);
    // Filter Data
    const data = highlightsData.filter((item) =>
      item.highlights.some((h) => values.includes(h.highlightType)),
    );
    // Update Highlights Data with the newly filtered data; to re-render flat list.
    setFilteredData(data);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalHeaderText}>Patients Daily Highlights</Text>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <MaterialCommunityIcons name="close" size="20" />
          </Pressable>
          <View style={{ flexDirection: 'row', width: '100%', zIndex: 1 }}>
            <View style={{ flex: 1 }}>
              <SearchBar
                placeholder="Search"
                lightTheme={true}
                // round={true}
                value={searchValue}
                onChangeText={(text) => searchAndRerender(text)}
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
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                onChangeValue={(text) => filterAndRerender(text)}
                setItems={setItems}
                theme="LIGHT"
                multiple={true}
                mode="BADGE"
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
              />
            </View>
          </View>
          {/* TODO */}
          {filteredData.length == 0 && highlightsData.length == 0 && (
            <Text style={styles.modalText}>
              No patient changes found today.
            </Text>
          )}
          <FlatList
            w="100%"
            showsVerticalScrollIndicator={true}
            data={
              filteredData && filteredData.length > 0
                ? filteredData
                : searchValue.length > 0
                ? []
                : highlightsData
            }
            keyExtractor={(item) => item.patientID}
            // onRefresh={handlePullToRefresh}
            // refreshing={isRefreshing}
            renderItem={({ item }) => (
              /*
               * Issue resolved -- cannot swipe on Android. Soln: Wrap with <GestureHandlerRootView>
               * Ref: https://stackoverflow.com/questions/70545275/react-native-swipeable-gesture-not-working-on-android
               */
              <GestureHandlerRootView>
                <HighlightsCard item={item} />
              </GestureHandlerRootView>
            )}
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
    borderRadius: 10,
    padding: 10,
    elevation: 2,
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
  },
  searchBarContainer: {
    backgroundColor: 'white',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBar: {
    width: '50%',
    // alignItems: "left",
    justifyContent: 'flex-start',
  },
  dropDown: {
    justifyContent: 'flex-end',
    marginTop: 7,
    borderColor: colors.primary_overlay_color,
  },
});

export default PatientDailyHighlights;
