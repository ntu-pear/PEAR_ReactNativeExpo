import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, Row, Center } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import SearchBar from './input-fields/SearchBar';


const FilterModalCard = ({
  modalVisible,
  setModalVisible,
  filterData,
  setSelectedCaregiver,
  caregiverFilterList,
  setCaregiverFilterList,
}) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const searchRef = useRef(null);

  const onChangeCaregiverName = (value) => {
    console.log(1111, value)
    setSelectedItem(value);
  };

  const handleApply = () => {
    setModalVisible(false);
    filterData();
    setSelectedCaregiver(selectedItem);
  };

  const handleReset = () => {
    setSelectedItem(null);
    // searchRef.current.clear();
  };

  return (
    <Modal
      size={'lg'}
      animationPreset={'slide'}
      isOpen={modalVisible}
      onClose={() => setModalVisible(false)}
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
    >
      <Modal.Content
        backgroundColor={colors.white_var1}
      >
        <Modal.Body>
          {caregiverFilterList ? (
            <View style={styles.caregiverViewStyle} zIndex={6}>
              <Text style={styles.textStyle}>Filter by Caregiver</Text>
              <View>
                <AutocompleteDropdown
                  ref={searchRef}
                  closeOnBlur={true}
                  closeOnSubmit={false}
                  dataSet={caregiverFilterList}
                  onSelectItem={(item) => item && setSelectedItem(item.id)}
                  // inputHeight={50}
                  // loading={loading}
                  onClear={() => {
                    setCaregiverFilterList(null);
                    setSelectedItem(null);
                  }}
                  textInputProps={{
                    placeholder: 'Enter Caregiver Name',
                    autoCorrect: false,
                    autoCapitalize: 'none',
                  }}
                  suggestionsListMaxHeight={200}
                />
              </View>
            </View>
            ): null}
          <View style={styles.resetViewStyle}>
            <Text
              onPress={() => {
                handleReset();
              }}
              textDecorationLine={'underline'}
              color={colors.black}
            >
              Reset
            </Text>
          </View>
        </Modal.Body>
        <Modal.Footer backgroundColor={colors.white}>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => {
                setModalVisible(false);
                handleReset();
              }}
            >
              Cancel
            </Button>
            <Button
              backgroundColor={colors.green}
              onPress={() => {
                handleApply();
              }}
            >
              Apply
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  caregiverViewStyle: {
    padding: 5,
    paddingBottom: 30,
  },
    resetViewStyle: {
    alignItems: 'center',
  },
  textStyle: {
    fontSize: 20,
    padding: 5,
  },
});

export default FilterModalCard;
