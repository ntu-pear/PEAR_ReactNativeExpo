import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ListItem, SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from 'app/config/colors';
import { FlatList } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HighlightsCard from 'app/components/HighlightsCard';

function PatientDailyHighlights(props) {
  // Destructure props
  const { modalVisible, setModalVisible } = props;

  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(['all']);
  const [items, setItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Abnormal Vital', value: 'abnormal vital' },
    { label: 'New Activity Exclusion', value: 'new activity exclusion' },
    { label: 'New Allergy', value: 'new allergy' },
    { label: 'New Prescription', value: 'new prescription' },
    { label: 'Problem', value: 'problem' },
  ]);

  const [highlightsData, setHighlightsData] = useState([
    {
      patientName: 'Alice Lee',
      patientID: 1,
      patientGender: 'F',
      highlights: [
        {
          highlightID: 1,
          highlightTypeID: 2,
          highlightType: 'new allergy',
          highlightDescription: 'New allergy to peanuts.',
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
        {
          highlightID: 2,
          highlightTypeID: 4,
          highlightType: 'abnormal vital',
          highlightDescription: 'Heartbeat faster than usual.',
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
      ],
    },
    {
      patientName: 'Daniel Lin',
      patientID: 2,
      patientGender: 'M',
      highlights: [
        {
          highlightID: 3,
          highlightTypeID: 1,
          highlightType: 'new prescription',
          highlightDescription: 'New prescription for blood pressure.',
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
        {
          highlightID: 4,
          highlightTypeID: 2,
          highlightType: 'new allergy',
          highlightDescription: 'New allergy to peanuts.',
          startDate: '2022-12-28T08:21:54.639Z',
          endDate: '2022-12-28T08:21:54.639Z',
        },
      ],
    },
  ]);

  const [filteredData, setFilteredData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filterAndRerender = (text) => {
    setSearchValue(text);
    console.log(text);
    // Filter Data
    const data = highlightsData.filter((item) =>
      item.patientName.includes(text),
    );
    // Update Highlights Data with the newly filtered data; to re-render flat list.
    setFilteredData(data);
  };

  const filterAndRerender2 = (values) => {
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
                round={true}
                value={searchValue}
                onChangeText={(text) => filterAndRerender(text)}
                autoCorrect={false}
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={{ backgroundColor: colors.white }}
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
                onChangeValue={(text) => filterAndRerender2(text)}
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
              />
            </View>
          </View>
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
          {/* TODO */}
          {filteredData.length == 0 && highlightsData.length == 0 && (
            <Text style={styles.modalText}>
              No patient changes found today.
            </Text>
          )}
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
  },
});

export default PatientDailyHighlights;
