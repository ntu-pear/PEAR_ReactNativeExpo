import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, Row, Center } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import typography from 'app/config/typography';
import { Chip } from 'react-native-elements';


const FilterModalCard = ({
  modalVisible,
  setModalVisible,
  sortOptions=[],
  filterOptions={},
  selectedSort,
  setSelectedSort,
  selectedFilters,
  setSelectedFilters,
  handleSortFilter,
}) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [tempSelSort, setTempSelSort] = useState({...selectedSort});
  const [tempSelFilters, setTempSelFilters] = useState({...selectedFilters});

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    setTempSelSort(Object.keys(selectedSort).length == 0 ? sortOptions[0] : {...selectedSort});
    setTempSelFilters({...selectedFilters});
    Keyboard.dismiss();
  },[modalVisible])

  // Apply sort and filter values and close modal
  const handleApply = () => {
    setModalVisible(false);
    setSelectedSort({...tempSelSort});
    setSelectedFilters({...tempSelFilters});
    handleSortFilter(undefined, {...tempSelSort}, {...tempSelFilters});
  };
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    setModalVisible(false);
    setSelectedSort(1);
    setSelectedFilters({});
    handleSortFilter(undefined, 1, {});
  };

  // Set display value of filter when item is selected
  const handleOnSelectFilter = (item, filter) => {
    if(item) {
      let tempSelectedFilters = tempSelFilters;
      tempSelectedFilters[filter] = item;
      item && setTempSelFilters(tempSelectedFilters);
    }
  }
    
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
                      onPress={() => setTempSelSort(item)}
                      type={tempSelSort.value == item.value ? 'solid' : 'outline'}
                      containerStyle={styles.sortOption}
                      buttonStyle={{backgroundColor: tempSelSort.value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                      titleStyle={{color: tempSelSort.value == item.value ? colors.white : colors.green}}
                      />
                      ))
                    }
              </View>
            </View>
            ) : null}
          {Object.keys(filterOptions).length > 0 ? (
            <View style={styles.filterContainer}>
              <View>
                {Object.keys(filterOptions).map((filter) => 
                  <View key={filter}>
                    <Text style={styles.textStyle}>{filter}</Text>
                    <AutocompleteDropdown
                      ref={searchRefs[filter]}
                      closeOnBlur={false}
                      dataSet={filterOptions[filter]}
                      onSelectItem={(item) => handleOnSelectFilter(item, filter)}
                      onClear={() => setTempSelFilters({})}
                      textInputProps={{
                        placeholder: 'Enter Caregiver Name',
                        autoCorrect: false,
                        autoCapitalize: 'none',
                      }}

                      initialValue={Object.keys(selectedFilters).includes(filter) ? selectedFilters[filter] : {id: null}}
                      suggestionsListMaxHeight={150} 
                      useFilter={true}
                    />
                  </View>
                )}
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
  filterContainer: {
    marginTop: '3%',
    paddingBottom: 150
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
    paddingBottom: 10,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default FilterModalCard;
