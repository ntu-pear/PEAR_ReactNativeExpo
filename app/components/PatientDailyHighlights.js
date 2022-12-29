import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ListItem, SearchBar } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from 'app/config/colors';

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
                onChangeText={(text) => setSearchValue(text)}
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
          <Text style={styles.modalText}>No patient changes found today.</Text>
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
