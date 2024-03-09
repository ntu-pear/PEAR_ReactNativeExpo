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
  FIELD_MAPPING={},
  filterOptionDetails,
  originalList,
  initializeData,
  onInitialize,

  sort,
  setSort,

  dropdown={'filterOptions': {}, 'sel': {}, 'tempSel': {}},
  setDropdown=()=>{},

  chip={'filterOptions': {}, 'sel': {}, 'tempSel': {}},
  setChip=()=>{},


  setSortOptions,
  setAutocompleteFilterOptions,
  setDateFilterOptions,
  
  sortOptions={},
  selectedSort={},
  setSelectedSort=()=>{},
  tempSelectedSort,
  setTempSelectedSort,

  autocompleteFilterOptions={},
  selectedAutocompleteFilters={},
  setSelectedAutocompleteFilters=()=>{},
  tempSelectedAutocompleteFilters,
  setTempSelectedAutocompleteFilters,

  dateFilterOptions={},
  selectedDateFilters={},
  setSelectedDateFilters=()=>{},
  tempSelectedDateFilters,
  setTempSelectedDateFilters,

  filterIconSize=12,  
  handleSortFilter,
}) => {
  // Types of filter display options
  const FILTER_TYPES = ['chip', 'dropdown', 'autocomplete', 'date'];

  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [isModalVisible, setIsModalVisible] = useState(modalVisible || true);
  const [isLoading, setIsLoading] = useState(true);

  const [tempSelSort, setTempSelSort] = useState(tempSelectedSort || {});
  const [tempSelAutocomplete, setTempSelAutocomplete] = useState(tempSelectedAutocompleteFilters || {});
  const [tempSelDate, setTempSelDate] = useState(tempSelectedDateFilters || {});
  
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

    setDropdown(prevState => ({
      ...prevState,
      tempSel: prevState.sel
    }))

    setChip(prevState => ({
      ...prevState,
      tempSel: prevState.sel
    }))

    updateState(setTempSelSort, setTempSelectedSort, isEmptyObject(selectedSort) ? {'option': sortOptions[0], 'asc': true} : {...selectedSort})
    updateState(setTempSelAutocomplete, setTempSelectedAutocompleteFilters, {...selectedAutocompleteFilters});

   
    updateState(setTempSelDate, setTempSelectedDateFilters, {...selectedDateFilters});

    Keyboard.dismiss();

    setIsLoading(false);
  }, [isModalVisible])

  
  // Initialize sort and filter options based on view mode
  const initSortFilter = () => {
    // console.log('BAR -', 3, 'initSortFilter')

    let tempAutocompleteFilterOptions = {};
    let tempDateFilterOptions = {};

    let tempDropdown = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempChip = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};

    if(FILTER_OPTIONS.length > 0) {     
      
      for(var filter of FILTER_OPTIONS) {
        let tempFilterOptionList;
        
        // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
        if (isEmptyObject(filterOptionDetails[filter]['options'])) {
          tempFilterOptionList = originalList.map(x => x[FIELD_MAPPING[filter]]);
          tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        }

        // If filter already selected, set to new filter with same value if exists
        // Otherwise set to first option
        const setSel = (temp, filter, og) => {          
          if(filter in og['tempSel']) {
            let value = og['sel'][filter]['value'];
            temp['sel'][filter] = temp['filterOptions'][filter].find(x => x.value == value) || temp['filterOptions'][filter][0];
            value = og['tempSel'][filter]['value'];
            temp['tempSel'][filter] = temp['filterOptions'][filter].find(x => x.value == value) || temp['filterOptions'][filter][0];
          } else {
            temp['sel'][filter] = temp['filterOptions'][filter][0];
            temp['tempSel'][filter] = temp['filterOptions'][filter][0];
          }
          return temp;
        }
        
        // Parse filter options based on dropdown/chip type
        switch(filterOptionDetails[filter]['type']) {
          case 'chip':
            if(!isEmptyObject(filterOptionDetails[filter]['options'])) {
              tempFilterOptionList = Object.keys(filterOptionDetails[filter]['options'])
            }            
            tempChip['filterOptions'][filter] = parseSelectOptions(tempFilterOptionList);
            tempChip = setSel(tempChip, filter, chip);           
            break;
          case 'dropdown':
            if(!isEmptyObject(filterOptionDetails[filter]['options'])) {
              tempDropdown.filterOptions[filter] = tempFilterOptionList = [{'label': 'All', 'value': 'All'}, ...Object.entries(filterOptionDetails[filter]['options'])
              .map(([key, label]) => ({
                value: label,
                label: key,
              }))];
            } else {
              tempDropdown['filterOptions'][filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
            }            
            tempDropdown = setSel(tempDropdown, filter, dropdown);            
            break;
          case 'autocomplete':
            tempAutocompleteFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
            break;
          case 'date': 
            tempDateFilterOptions[filter] = filterOptionDetails[filter]['options'];
            break;
        }
      }
    }
    setDropdown(tempDropdown);
    setChip(tempChip);

    setAutocompleteFilterOptions(tempAutocompleteFilterOptions);
    setDateFilterOptions(tempDateFilterOptions);
    setSortOptions(parseSelectOptions(SORT_OPTIONS));
  }

  // Apply sort and filter values and close modal
  const handleApply = () => {
    // console.log('MODAL -', 4, 'handleApply', tempSelDropdown)

    setDropdown(prevState => ({
      ...prevState,
      sel: prevState.tempSel
    }))

    setChip(prevState => ({
      ...prevState,
      sel: prevState.tempSel
    }))

    updateState(setIsModalVisible, setModalVisible, false);
    setSelectedSort({...tempSelSort});
    setSelectedAutocompleteFilters({...tempSelAutocomplete});
    setSelectedDateFilters({...tempSelDate});
    handleSortFilter({
      'tempSelSort': {...tempSelSort}, 
      'tempSelDropdownFilters': dropdown['tempSel'], 
      'tempSelChipFilters': chip['tempSel'],
      'tempSelAutocompleteFilters': {...tempSelAutocomplete},
      'tempSelDateFilters': {...tempSelDate},
    });
  };
  
  const resetFilters = (temp) => {
    for (var filter in temp['filterOptions']) {
      temp['sel'][filter] = temp['filterOptions'][filter][0];
      temp['tempSel'][filter] = temp['filterOptions'][filter][0];
    }
    return temp;
  }
  
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    // console.log('MODAL -', 5, 'handleReset')

    setDropdown(resetFilters({...dropdown}));
    setChip(resetFilters({...chip}));

    updateState(setIsModalVisible, setModalVisible, false);
    setSelectedSort({});
    setSelectedAutocompleteFilters({});
    setSelectedDateFilters({});
    handleSortFilter({
      'tempSelSort': {}, 
      'tempSelDropdownFilters': dropdown['tempSel'], 
      'tempSelChipFilters': chip['tempSel'],
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

    let tempSelectedFilters = {...dropdown['tempSel']};
    tempSelectedFilters[filter] = dropdown['filterOptions'][filter].filter(x=>x.value == index)[0];
    setDropdown(prevState => ({
      ...prevState,
      tempSel: tempSelectedFilters
    }))
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

    let tempSelectedFilters = {...chip['tempSel']};
    tempSelectedFilters[filter] = item;
    setChip(prevState => ({
      ...prevState,
      tempSel: {...tempSelectedFilters}
    }))
  }

  const handleOnSelectDateFilter = (date, filter, type) => {
    let tempSelectedDate = tempSelDate;
    if(!(filter in tempSelectedDate)) {
      tempSelectedDate[filter] = {};
    } 
    if(type == 'min') {
      tempSelectedDate[filter]['min'] = date;
    } else {
      tempSelectedDate[filter]['max'] = date;      
    }
    // console.log(tempSelectedDate)
    updateState(setTempSelDate, setTempSelectedDateFilters, tempSelectedDate);      
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
              {!isEmptyObject(chip['filterOptions']) ? (
                <View marginTop={'3%'}>
                  {Object.keys(chip['sel']).map((filter) => 
                    <View key={filter}>
                      <Text style={styles.textStyle}>{filter}</Text>
                      <ScrollView
                        horizontal={true}
                        flex={1}
                        showsHorizontalScrollIndicator={false}
                      >
                        <View style={styles.chipOptions}>
                          {
                            chip['filterOptions'][filter].map((item) => (
                              <Chip
                                key={item.value}
                                title={item.label}
                                onPress={() => handleOnSelectChipFilter(item, filter)}
                                type={chip['tempSel'][filter] ? chip['tempSel'][filter].value == item.value ? 'solid' : 'outline' : chip['filterOptions'][filter][0].value == item.value ? 'solid' : 'outline'}
                                containerStyle={styles.chipOption}
                                buttonStyle={{backgroundColor: chip['tempSel'][filter] ? chip['tempSel'][filter].value == item.value ? colors.green : 'transparent' : chip['filterOptions'][filter][0].value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                                titleStyle={{color: chip['tempSel'][filter] ? chip['tempSel'][filter].value == item.value ? colors.white : colors.green  : chip['filterOptions'][filter][0].value == item.value ? colors.white : colors.green}}
                              />
                              ))
                            }
                        </View>
                      </ScrollView>
                    </View>
                  )}                
                </View>                
              ): null}
              {!isEmptyObject(dropdown['filterOptions']) ? (
                <View style={styles.filterContainer}>
                  <View>
                    {Object.keys(dropdown['filterOptions']).map((filter) => 
                      <View key={filter}>
                        <Text style={styles.textStyle}>{filter}</Text>
                        <SelectionInputField
                          dataArray={dropdown['filterOptions'][filter]}
                          showTitle={false}
                          onDataChange={(item) => handleOnSelectDropdownFilter(item, filter)}
                          placeholder='Select caregiver'
                          value={dropdown['tempSel'][filter].value}
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
              <View style={styles.filterContainer}>
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
                            mode='date'
                            // placeholder={filter in tempSelDate ? null : 'Select date'}
                            value={filter in tempSelDate ? tempSelDate[filter]['min'] : undefined}
                            handleFormData={(date) => handleOnSelectDateFilter(date, filter, 'min')}
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
