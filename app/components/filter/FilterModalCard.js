// Libs
import React, { useEffect, useRef, useState } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { Modal, Text, View, Icon, ScrollView, Button } from 'native-base';
import { Keyboard, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SelectionInputField from '../input-fields/SelectionInputField';
import { parseAutoCompleteOptions, parseSelectOptions, updateState } from 'app/utility/miscFunctions';
import { isEmptyObject } from 'app/utility/miscFunctions';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DateInputField from '../DateInputField';


const FilterModalCard = ({
  modalVisible,
  setModalVisible,

  SORT_OPTIONS=[],
  FILTER_OPTIONS=[],
  filterOptionDetails,
  originalList,
  initializeData,
  onInitialize,

  sort,
  setSort,
  filters,
  setFilters,


  setSortOptions,
  setDropdownFilterOptions,
  setChipFilterOptions,
  setAutocompleteFilterOptions,
  
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

  dateFilterOptions={},
  // {'Date Filter Test': {
  //   'min': {
  //     'default': new Date(),
  //     'limit': null,
  //     'value': null,
  //   },
  //   'max': {
  //     'default': null,
  //     'limit': null,
  //     'value': null,
  //   }
  // }},
  selectedDateFilters={},
  setSelectedDateFilters=()=>{},
  tempSelectedDateFilters,
  setTempSelectedDateFilters,

  filterIconSize=12,  
  handleSortFilter,
}) => {
  // Types of filter display options
  const FILTER_TYPES = ['chip', 'dropdown', 'autocomplete'];

  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [isModalVisible, setIsModalVisible] = useState(modalVisible || true);
  const [isLoading, setIsLoading] = useState(true);

  const [tempSelSort, setTempSelSort] = useState(tempSelectedSort || {});
  const [tempSelChip, setTempSelChip] = useState(tempSelectedChipFilters || {});
  const [tempSelDropdown, setTempSelDropdown] = useState(tempSelectedDropdownFilters || {});
  const [tempSelAutocomplete, setTempSelAutocomplete] = useState(tempSelectedAutocompleteFilters || {});
  const [tempSelDate, setTempSelDate] = useState(tempSelectedDateFilters || {});
  const [datePickerDisplay, setDatePickerDisplay] = useState({})
  
  // State used to keep track of whether initializeData state has changed
  const [localFilterOptionDetails, setLocalFilterOptionDetails] = useState(filterOptionDetails);
    
  // Whenever data changes, reinitialize sort and filter options and apply search, sort, filter
  useEffect(() => {
    // console.log('MODAL -', 1, 'useEffect [initializeData, filterOptionDetails]', initializeData)
    if (initializeData) {
      initSortFilter();
      onInitialize();
      
      // Only apply sort filter if no change to filterOptionDetails
      if(filterOptionDetails == localFilterOptionDetails ) {
        handleSortFilter({});
      } else {
        setLocalFilterOptionDetails(filterOptionDetails);
      }
    }
  }, [initializeData, filterOptionDetails])

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    // console.log('MODAL -', 2, 'useEffect [isModalVisible]', isModalVisible)
    setIsLoading(true);

    setSelectedSort(isEmptyObject(selectedSort) ? {'option': sortOptions[0], 'asc': true} : {...selectedSort});

    updateState(setTempSelSort, setTempSelectedSort, isEmptyObject(selectedSort) ? {'option': sortOptions[0], 'asc': true} : {...selectedSort})
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

    updateState(setTempSelDate, setTempSelectedDateFilters, {...selectedDateFilters});

    Keyboard.dismiss();

    setIsLoading(false);
  }, [isModalVisible])

  
  // Initialize sort and filter options based on view mode
  const initSortFilter = () => {
    // console.log('BAR -', 3, 'initSortFilter')

    let filterOptions = {};
    let sel = {}
    let tempSel = {}

    let tempDropdownFilterOptions = {};
    let tempAutocompleteFilterOptions = {};
    let tempChipFilterOptions = {};

    if(FILTER_OPTIONS.length > 0) {
      // Initialize filter data by filter type
      for (var filterType of FILTER_TYPES) {
        filterOptions[filterType] = {};
        sel[filterType] = filters['sel'] ? filters['sel'][filterType] : {};
        tempSel[filterType] = filters['tempSel'] ? filters['tempSel'][filterType] : {};
      }
      
      
      for(var filter of FILTER_OPTIONS) {
        let tempFilterOptionList;
        
        // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
        // Else use custom options
        if (isEmptyObject(filterOptionDetails[filter]['options'])) {
          tempFilterOptionList = originalList.map(x => x[FIELD_MAPPING[filter]]);
          tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        } else {
          tempFilterOptionList = Object.keys(filterOptionDetails[filter]['options'])
        }
        
        // Set default selected filter values if not selected
        const setSel = (filterType) => {
          if(!sel[filterType][filter]) {
            sel[filterType][filter] = filterOptions[filterType][filter][0];
            tempSel[filterType][filter] = filterOptions[filterType][filter][0];
          }


          // might need different implementation for date
        }

        // Parse filter options based on dropdown/chip type
        switch(filterOptionDetails[filter]['type']) {
          case 'chip':
            filterOptions['chip'][filter] = parseSelectOptions(tempFilterOptionList);
            tempChipFilterOptions[filter] = parseSelectOptions(tempFilterOptionList);
            break;
            case 'dropdown':
            tempDropdownFilterOptions[filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
            filterOptions['dropdown'][filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
            break;
          case 'autocomplete':
            filterOptions['autocomplete'][filter] = parseAutoCompleteOptions(tempFilterOptionList);
            tempAutocompleteFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
            break;
        }
        setSel(filterOptionDetails[filter]['type']);
      }
    }
    setDropdownFilterOptions(tempDropdownFilterOptions);
    setAutocompleteFilterOptions(tempAutocompleteFilterOptions);
    setChipFilterOptions(tempChipFilterOptions);
    
    setFilters({
      'sel': sel,
      'tempSel': tempSel,
      'filterOptions': filterOptions,
    })

    setSortOptions(parseSelectOptions(SORT_OPTIONS));
  }

  // Apply sort and filter values and close modal
  const handleApply = () => {
    // console.log('MODAL -', 4, 'handleApply', tempSelDropdown)

    updateState(setIsModalVisible, setModalVisible, false);
    setSelectedSort({...tempSelSort});
    setSelectedDropdownFilters({...tempSelDropdown});
    setSelectedAutocompleteFilters({...tempSelAutocomplete});
    setSelectedDateFilters({...tempSelDate});
    setSelectedChipFilters({...tempSelChip});
    handleSortFilter({
      'tempSelSort': {...tempSelSort}, 
      'tempSelDropdownFilters': {...tempSelDropdown}, 
      'tempSelChipFilters': {...tempSelChip},
      'tempSelAutocompleteFilters': {...tempSelAutocomplete},
      'tempSelDateFilters': {...tempSelDate},
    });
  };
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    // console.log('MODAL -', 5, 'handleReset')

    updateState(setIsModalVisible, setModalVisible, false);
    setSelectedSort({});
    setSelectedDropdownFilters({});
    setSelectedChipFilters({});
    setSelectedAutocompleteFilters({});
    setSelectedDateFilters({});
    handleSortFilter({
      'tempSelSort': {}, 
      'tempSelDropdownFilters': {}, 
      'tempSelChipFilters': {},
      'tempSelAutoCompleteFilters': {},
      'tempSelDateFilters': {},
    });  };

  // Set display value of sort item is selected
  const handleOnSelectChipSort = (item) => {
    // console.log('MODAL -', 6, 'handleOnSelectChipSort')

    let asc = true;
    if(tempSelSort['option']['value'] == item.value) {
      asc = !tempSelSort['asc'];
    }
    setTempSelSort({'option': item, 'asc': asc});
  }

  // Set display value of dropdown filter when item is selected
  const handleOnSelectDropdownFilter = (index, filter) => {
    // console.log('MODAL -', 7, 'handleOnSelectDropdownFilter')

    let tempSelectedFilters = tempSelDropdown;
    tempSelectedFilters[filter] = dropdownFilterOptions[filter].filter(x=>x.value == index)[0];
    updateState(setTempSelDropdown, setTempSelectedDropdownFilters, tempSelectedFilters);      
  }

  // Set display value of dropdown filter when item is selected
  const handleOnSelectAutocompleteFilter = (item, filter) => {
    // console.log('MODAL -', 8, 'handleOnSelectAutocompleteFilter')

    if(item) {
      let tempSelectedFilters = tempSelAutocomplete;
      tempSelectedFilters[filter] = item;
      item && updateState(setTempSelAutocomplete, setTempSelectedAutocompleteFilters, tempSelectedFilters);      
    }
  }

  // Set display value of chip filter when item is selected
  const handleOnSelectChipFilter = (item, filter) => {
    // console.log('MODAL -', 9, 'handleOnSelectChipFilter')

    let temp = {...tempSelChip};
    temp[filter] = item;
    updateState(setTempSelChip, setTempSelectedChipFilters, temp); 
  }

  // Open start time picker component
  const showStartDatePicker = (filter) => {
    let tempDatePickerDisplay = datePickerDisplay;
    if(!(filter in tempDatePickerDisplay)) {
      tempDatePickerDisplay[filter] = {};
    }
    tempDatePickerDisplay[filter]['min'] = true;
  };

  const setStartTime = (datetime, filter) => {
    let tempSelectedDate = tempSelDate;
    if(!(filter in tempSelectedDate)) {
      tempSelectedDate[filter] = {};
    } 
    tempSelectedDate['min'] = datetime;
    setTempSelDate(tempSelectedDate);
  }

  return (
    <View>
      <TouchableOpacity 
        style={styles.filterIcon}
        onPress={() => updateState(setIsModalVisible, setModalVisible, true)}
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
          onClose={() => updateState(setIsModalVisible, setModalVisible, false)}
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
              {!isEmptyObject(chipFilterOptions) ? (
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
              {!isEmptyObject(dropdownFilterOptions) ? (
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
                          value={filter in tempSelDropdown ? tempSelDropdown[filter].value : null}
                        />                          
                      </View>
                    )}
                  </View>
                </View>
              ): null}
              {!isEmptyObject(autocompleteFilterOptions) ? (
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
                          initialValue={filter in selectedAutocompleteFilters ? selectedAutocompleteFilters[filter] : {id: null}}
                          suggestionsListMaxHeight={150} 
                          useFilter={true}
                          />                        
                      </View>)
                    )}
                </View>
              ): null}
            {!isEmptyObject(dateFilterOptions) ? (
              <View>
                {Object.keys(dateFilterOptions).map((filter) => (
                  <View key={filter}>
                    <Text style={styles.textStyle}>{filter}</Text>
                    <View style={styles.dateFilterContainer}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {!'max' in dateFilterOptions[filter] ? (
                          <Text style={[styles.textStyle]}>Before</Text>
                          ) : null}
                        {'min' in dateFilterOptions[filter] ? (              
                          
                          <View style={{flex: 0.5}}>
                            <DateInputField
                            hideDayOfWeek
                            mode='time'
                            />                            
                          </View>   
                        ) : null}
                        {'min' in dateFilterOptions[filter] && 'max' in dateFilterOptions[filter] ? (
                          <Text style={styles.textStyle}>To</Text>
                          ) : null}
                        {!'min' in dateFilterOptions[filter] ? (
                          <Text style={styles.textStyle}>After</Text>
                          ) : null}
                        {'max' in dateFilterOptions[filter] ? (                      
                          <Text style={styles.textStyle}>MAX DATE HERE</Text>
                          ) : null}
                          </LocalizationProvider>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
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
  dateFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  dateText: {
    fontSize: 17
  }
});

export default FilterModalCard;
