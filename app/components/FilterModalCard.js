import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, Row, Center } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import typography from 'app/config/typography';
import { Chip } from 'react-native-elements';


const FilterModalCard = ({
  modalVisible,
  setModalVisible,
  sortOptions=[],
  setSortOption,
  sortOption,
  handleSortFilter,
  setSelectedCaregiver,
  caregiverList,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [caregiverFilterList, setCaregiverFilterList] = useState(null);

  const searchRef = useRef(null);
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const onChangeCaregiverName = (value) => {
    console.log(1111, value)
    setSelectedItem(value);
  };

  const onOpenSuggestionsList = () => { 
    const list = [];
    caregiverList.forEach((item, i) => {
      list.push({
        id: i.toString(),
        title: item,
      });
    });

    setCaregiverFilterList(list);
  }

  const handleApply = () => {
    setModalVisible(false);
    handleSortFilter();
    setSelectedCaregiver(selectedItem);
  };

  const handleReset = () => {
    setSortOption(1);
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
          <Text style={styles.headerStyle}>Sort and Filter</Text>
          {sortOptions.length > 0 ? (
            <View>
              <Text style={styles.textStyle}>Sort by</Text>
              <View style={styles.sortOptions}>
                {
                  sortOptions.map((item) => (
                    <Chip
                      key={item.value}
                      title={item.label}
                      onPress={() => setSortOption(item.value)}
                      type={sortOption == item.value ? 'solid' : 'outline'}
                      containerStyle={styles.sortOption}
                      buttonStyle={{backgroundColor: sortOption == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                      titleStyle={{color: sortOption == item.value ? colors.white : colors.green}}
                    />
                  ))
                }
              </View>
            </View>
            ) : null}
          {caregiverList.length > 0 ? (
            <View style={styles.caregiverViewStyle} zIndex={6}>
              <Text style={styles.textStyle}>Filter by Caregiver</Text>
              <View>
                {/* <AutocompleteDropdown
                  ref={searchRef}
                  closeOnBlur={true}
                  closeOnSubmit={false}
                  dataSet={caregiverFilterList}
                  onOpenSuggestionsList={onOpenSuggestionsList}
                  onSelectItem={(item) => {
                    console.log('item is',item)
                    item && setSelectedItem(item.id)
                  }}
                  inputHeight={50}
                  loading={loading}
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
                /> */}
              </View>
            </View>
            ): null}
        </Modal.Body>
        <Modal.Footer backgroundColor={colors.white}>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => {
                handleReset();
              }}
            >
              Reset
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
  sortOptions: {
    flexDirection: 'row'
  },
  sortOption: {
    marginRight: '2%',
  },
  caregiverViewStyle: {
    padding: 5,
    paddingBottom: 30,
  },
    resetViewStyle: {
    alignItems: 'center',
  },
  headerStyle: {
    fontSize: 20,
    alignSelf: 'center',
    padding: 5,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,    
  },
  textStyle: {
    fontSize: 13.5,
    padding: 5,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default FilterModalCard;
