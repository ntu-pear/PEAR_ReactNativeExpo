// Libs
import React, { useEffect, useRef, useState } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { Modal, Text, View, Icon, ScrollView, Button } from 'native-base';
import { Keyboard, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SelectionInputField from '../input-fields/SelectionInputField';
import { updateState } from 'app/utility/miscFunctions';

const FilterModalCard = ({
  modalVisible,
  setModalVisible,
  
  sortOptions={},
  selectedSort={},
  setSelectedSort=()=>{},
  tempSelectedSort,
  setTempSelectedSort,
  
  chipFilterOptions={},
  selectedChipFilters={},
  setSelectedChipFilters=()=>{},
  tempSelectedChipFilters,
  setTempSelectedChipFilters,

  dropdownFilterOptions={},
  selectedDropdownFilters={},
  setSelectedDropdownFilters=()=>{},
  tempSelectedDropdownFilters,
  setTempSelectedDropdownFilters,

  autocompleteFilterOptions={},
  selectedAutocompleteFilters={},
  setSelectedAutocompleteFilters=()=>{},
  tempSelectedAutocompleteFilters,
  setTempSelectedAutocompleteFilters,

  filterIconSize=12,  
  handleSortFilter,
}) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [isModalVisible, setIsModalVisible] = useState( false);
  const [isLoading, setIsLoading] = useState(true);

  const [tempSelSort, setTempSelSort] = useState(tempSelectedSort || {});
  const [tempSelChip, setTempSelChip] = useState(tempSelectedChipFilters || {});
  const [tempSelDropdown, setTempSelDropdown] = useState(tempSelectedDropdownFilters || {});
  const [tempSelAutocomplete, setTempSelAutocomplete] = useState(tempSelectedAutocompleteFilters || {});

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    setIsLoading(true);

    setSelectedSort(Object.keys(selectedSort).length == 0 ? {'option': sortOptions[0], 'asc': true} : {...selectedSort});

    updateState(setTempSelSort, setTempSelectedSort, Object.keys(selectedSort).length == 0 ? {'option': sortOptions[0], 'asc': true} : {...selectedSort})
    updateState(setTempSelDropdown, setTempSelectedDropdownFilters, {...selectedDropdownFilters});
    updateState(setTempSelAutocomplete, setTempSelectedAutocompleteFilters, {...selectedAutocompleteFilters});

    var tempSelChipFilters = {...selectedChipFilters};
    for (var filter of Object.keys(chipFilterOptions)) {
      if(!Object.keys(selectedChipFilters).includes(filter)) {
        tempSelChipFilters[filter] = chipFilterOptions[filter][0];
      }
    }
    setSelectedChipFilters(tempSelChipFilters);
    updateState(setTempSelChip, setTempSelectedChipFilters, tempSelChipFilters);

    Keyboard.dismiss();

    setIsLoading(false);
  }, [modalVisible != undefined ? modalVisible : isModalVisible])

  // Update state that controls modal visibility depending on whether parent component controls it or child
  const updateModalVisibility = (val) => {
    if(setModalVisible) {
      setModalVisible(val);
    } else {
      setIsModalVisible(val);
    }
  }

  // Apply sort and filter values and close modal
  const handleApply = () => {
    updateModalVisibility(false);
    setSelectedSort({...tempSelSort});
    setSelectedDropdownFilters({...tempSelDropdown});
    setSelectedAutocompleteFilters({...tempSelAutocomplete});
    setSelectedChipFilters({...tempSelChip});
    handleSortFilter({
      'tempSelSort': {...tempSelSort}, 
      'tempSelDropdownFilters': {...tempSelDropdown}, 
      'tempSelChipFilters': {...tempSelChip},
      'tempSelAutocompleteFilters': {...tempSelAutocomplete}
    });
  };
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    updateModalVisibility(false);
    setSelectedSort({});
    setSelectedDropdownFilters({});
    setSelectedChipFilters({});
    setSelectedAutocompleteFilters({});
    handleSortFilter({
      'tempSelSort': {}, 
      'tempSelDropdownFilters': {}, 
      'tempSelChipFilters': {},
      'tempSelAutoCompleteFilters': {}
    });  };

  // Set display value of sort item is selected
  const handleOnSelectChipSort = (item) => {
    let asc = true;
    if(tempSelSort['option']['value'] == item.value) {
      asc = !tempSelSort['asc'];
    }
    setTempSelSort({'option': item, 'asc': asc});
  }

  // Set display value of dropdown filter when item is selected
  const handleOnSelectDropdownFilter = (index, filter) => {
    let tempSelectedFilters = tempSelDropdown;
    tempSelectedFilters[filter] = dropdownFilterOptions[filter].filter(x=>x.value == index)[0];
    updateState(setTempSelDropdown, setTempSelectedDropdownFilters, tempSelectedFilters);      
  }

  // Set display value of dropdown filter when item is selected
  const handleOnSelectAutocompleteFilter = (item, filter) => {
    if(item) {
      let tempSelectedFilters = tempSelAutocomplete;
      tempSelectedFilters[filter] = item;
      item && updateState(setTempSelAutocomplete, setTempSelectedAutocompleteFilters, tempSelectedFilters);      
    }
  }

  // Set display value of chip filter when item is selected
  const handleOnSelectChipFilter = (item, filter) => {
    let temp = {...tempSelChip};
    temp[filter] = item;
    updateState(setTempSelChip, setTempSelectedChipFilters, temp); 
  }

    return (
    <View>
      <TouchableOpacity 
        style={styles.filterIcon}
        onPress={() => updateModalVisibility(true)}
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
          isOpen={modalVisible != undefined ? modalVisible : isModalVisible}
          onClose={() => updateModalVisibility(false)}
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
                  <ScrollView
                    horizontal={true}
                    flex={1}
                    showsHorizontalScrollIndicator={false}
                    >
                    <View style={styles.chipOptions}>
                      {
                        sortOptions.map((item) => (
                          <Chip
                            key={item.value}
                            title={item.label}
                            onPress={() => handleOnSelectChipSort(item)}
                            type={tempSelSort['option'].value == item.value ? 'solid' : 'outline'}
                            containerStyle={styles.chipOption}
                            buttonStyle={{backgroundColor: tempSelSort['option'].value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                            titleStyle={{color: tempSelSort['option'].value == item.value ? colors.white : colors.green}}
                            iconRight
                            icon={{
                              name: tempSelSort['option'].value == item.value 
                              ? tempSelSort['asc']
                                ? 'long-arrow-up' 
                                : 'long-arrow-down' 
                              : '',
                              type: "font-awesome",
                              size: 13.5,
                              color: 'white',
                              }}
                            />
                            ))
                          }
                    </View>
                  </ScrollView>
                </View>
                ) : null}
              {Object.keys(chipFilterOptions).length > 0 ? (
                <View marginTop={'3%'}>
                  {Object.keys(chipFilterOptions).map((filter) => 
                    <View key={filter}>
                      <Text style={styles.textStyle}>{filter}</Text>
                      <ScrollView
                        horizontal={true}
                        flex={1}
                        showsHorizontalScrollIndicator={false}
                      >
                        <View style={styles.chipOptions}>
                          {
                            chipFilterOptions[filter].map((item) => (
                              <Chip
                                key={item.value}
                                title={item.label}
                                onPress={() => handleOnSelectChipFilter(item, filter)}
                                type={tempSelChip[filter] ? tempSelChip[filter].value == item.value ? 'solid' : 'outline' : chipFilterOptions[filter][0].value == item.value ? 'solid' : 'outline'}
                                containerStyle={styles.chipOption}
                                buttonStyle={{backgroundColor: tempSelChip[filter] ? tempSelChip[filter].value == item.value ? colors.green : 'transparent' : chipFilterOptions[filter][0].value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                                titleStyle={{color: tempSelChip[filter] ? tempSelChip[filter].value == item.value ? colors.white : colors.green  : chipFilterOptions[filter][0].value == item.value ? colors.white : colors.green}}
                                />
                              ))
                            }
                        </View>
                      </ScrollView>
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
                        <SelectionInputField
                          dataArray={dropdownFilterOptions[filter]}
                          showTitle={false}
                          onDataChange={(item) => handleOnSelectDropdownFilter(item, filter)}
                          placeholder='Select caregiver'
                          value={Object.keys(selectedDropdownFilters).includes(filter) ? selectedDropdownFilters[filter].value : null}
                        />                          
                      </View>
                    )}
                  </View>
                </View>
                ): null}
              {Object.keys(autocompleteFilterOptions).length > 0 ? (
                <View style={styles.filterContainer}>
                    {Object.keys(autocompleteFilterOptions).map((filter) => 
                      (<View key={filter}>
                        <Text style={styles.textStyle}>{filter}</Text>
                        <AutocompleteDropdown
                          ref={searchRefs[filter]}
                          closeOnBlur={false}
                          dataSet={autocompleteFilterOptions[filter]}
                          onSelectItem={(item) => handleOnSelectAutocompleteFilter(item, filter)}
                          onClear={() => updateState(setTempSelAutocomplete, setTempSelectedAutocompleteFilters, {})}
                          textInputProps={{
                            placeholder: 'Enter value',
                            autoCorrect: false,
                            autoCapitalize: 'none',
                          }}
                          initialValue={Object.keys(selectedAutocompleteFilters).includes(filter) ? selectedAutocompleteFilters[filter] : {id: null}}
                          suggestionsListMaxHeight={150} 
                          useFilter={true}
                          />                        
                      </View>)
                    )}
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
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chipOption: {
    marginRight: 5,
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
