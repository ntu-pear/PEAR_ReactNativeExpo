import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, Row, Center, Icon } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import typography from 'app/config/typography';
import { Chip } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';


const FilterModalCard = ({
  filterIconSize=12,
  sortOptions=[],
  selectedSort,
  setSelectedSort,
  dropdownFilterOptions={},
  selectedDropdownFilters,
  setSelectedDropdownFilters,
  chipFilterOptions={},
  selectedChipFilters,
  setSelectedChipFilters,
  handleSortFilter,
}) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tempSelSort, setTempSelSort] = useState({...selectedSort});
  const [tempSelDropdownFilters, setTempSelDropdownFilters] = useState({...selectedDropdownFilters});
  const [tempSelChipFilters, setTempSelChipFilters] = useState({...selectedChipFilters});

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    setIsLoading(true);
    setTempSelSort(Object.keys(selectedSort).length == 0 ? sortOptions[0] : {...selectedSort});
    setTempSelDropdownFilters({...selectedDropdownFilters});

    var tempSelChipFilters = {...selectedChipFilters};
    for (var filter of Object.keys(chipFilterOptions)) {
      if(!Object.keys(selectedChipFilters).includes(filter)) {
        tempSelChipFilters[filter] = chipFilterOptions[filter][0];
      }
    }
    setTempSelChipFilters(tempSelChipFilters);
    // setTempSelChipFilters({...chipFilterOptions});

    Keyboard.dismiss();
    setIsLoading(false);
  },[modalVisible])

  // Apply sort and filter values and close modal
  const handleApply = () => {
    setModalVisible(false);
    setSelectedSort({...tempSelSort});
    setSelectedDropdownFilters({...tempSelDropdownFilters});
    setSelectedChipFilters({...tempSelChipFilters});
    handleSortFilter(undefined, {...tempSelSort}, {...tempSelDropdownFilters}, {...tempSelChipFilters});
  };
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    setModalVisible(false);
    setSelectedSort(1);
    setSelectedDropdownFilters({});
    setSelectedChipFilters({});
    handleSortFilter(undefined, 1, {}, {});
  };

  // Set display value of dropdown filter when item is selected
  const handleOnSelectDropdownFilter = (item, filter) => {
    if(item) {
      let tempSelectedFilters = tempSelDropdownFilters;
      tempSelectedFilters[filter] = item;
      item && setTempSelDropdownFilters(tempSelectedFilters);      
    }
  }

  // Set display value of chip filter when item is selected
  const handleOnSelectChipFilter = (item, filter) => {
    let temp = {...tempSelChipFilters};
    temp[filter] = item;
    setTempSelChipFilters(temp); 
  }
    
  return (
    <View>
      <TouchableOpacity 
        style={styles.filterIcon}
        onPress={() => setModalVisible(true)}
        >
        <Icon 
          as={
            <MaterialIcons 
            name="filter-list" 
            />
          } 
          size={filterIconSize}
          color={colors.green}
        >
        </Icon>
      </TouchableOpacity>
      {!isLoading ? 
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
                  <View style={styles.chipOptions}>
                    {
                      sortOptions.map((item) => (
                        <Chip
                          key={item.value}
                          title={item.label}
                          onPress={() => setTempSelSort(item)}
                          type={tempSelSort.value == item.value ? 'solid' : 'outline'}
                          containerStyle={styles.chipOption}
                          buttonStyle={{backgroundColor: tempSelSort.value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                          titleStyle={{color: tempSelSort.value == item.value ? colors.white : colors.green}}
                          />
                          ))
                        }
                  </View>
                </View>
                ) : null}
              {Object.keys(chipFilterOptions).length > 0 ? (
                <View marginTop={'3%'}>
                  {Object.keys(chipFilterOptions).map((filter) => 
                    <View key={filter}>
                      <Text style={styles.textStyle}>{filter}</Text>
                      <View style={styles.chipOptions}>
                        {
                          chipFilterOptions[filter].map((item) => (
                            <Chip
                              key={item.value}
                              title={item.label}
                              onPress={() => handleOnSelectChipFilter(item, filter)}
                              type={tempSelChipFilters[filter] ? tempSelChipFilters[filter].value == item.value ? 'solid' : 'outline' : chipFilterOptions[filter][0].value == item.value ? 'solid' : 'outline'}
                              containerStyle={styles.chipOption}
                              buttonStyle={{backgroundColor: tempSelChipFilters[filter] ? tempSelChipFilters[filter].value == item.value ? colors.green : 'transparent' : chipFilterOptions[filter][0].value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                              titleStyle={{color: tempSelChipFilters[filter] ? tempSelChipFilters[filter].value == item.value ? colors.white : colors.green  : chipFilterOptions[filter][0].value == item.value ? colors.white : colors.green}}
                              />
                              ))
                            }
                      </View>
                    </View>
                  )}                
                  </View>                
                ): null}
              {Object.keys(dropdownFilterOptions).length > 0 ? (
                <View style={styles.filterContainer}>
                  <View>
                    {Object.keys(dropdownFilterOptions).map((filter) => 
                      <View key={filter}>
                        <Text style={styles.textStyle}>{filter}</Text>
                        <AutocompleteDropdown
                          ref={searchRefs[filter]}
                          closeOnBlur={false}
                          dataSet={dropdownFilterOptions[filter]}
                          onSelectItem={(item) => handleOnSelectDropdownFilter(item, filter)}
                          onClear={() => setTempSelDropdownFilters({})}
                          textInputProps={{
                            placeholder: 'Enter Caregiver Name',
                            autoCorrect: false,
                            autoCapitalize: 'none',
                          }}
                          
                          initialValue={Object.keys(selectedDropdownFilters).includes(filter) ? selectedDropdownFilters[filter] : {id: null}}
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
      : null}
    </View>
  );
};

const styles = StyleSheet.create({
  filterIcon: {
    marginLeft: 8,
  },
  chipOptions: {
    flexDirection: 'row'
  },
  chipOption: {
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
