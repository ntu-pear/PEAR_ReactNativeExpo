// Libs
import React, { useEffect, useRef, useState } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { Modal, Text, View, Icon, ScrollView, Button } from 'native-base';
import { Keyboard, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SelectionInputField from '../input-fields/SelectionInputField';
import DateInputField from '../DateInputField';

// Utilities
import { isEmptyObject, parseAutoCompleteOptions, parseSelectOptions, sortFilterInitialState, updateState } from 'app/utility/miscFunctions';

const FilterModalCard = ({
  modalVisible,
  setModalVisible,

  SORT_OPTIONS=[],
  FILTER_OPTIONS=[],
  FIELD_MAPPING={},
  filterOptionDetails={},
  originalList=[],
  initializeData,
  onInitialize,
  applySortFilter,
  setApplySortFilter,

  sort=sortFilterInitialState,
  setSort=()=>{},

  dropdown=sortFilterInitialState,
  setDropdown=()=>{},

  chip=sortFilterInitialState,
  setChip=()=>{},
  
  autocomplete=sortFilterInitialState,
  setAutocomplete=()=>{},
  
  datetime=sortFilterInitialState,
  setDatetime=()=>{}, 

  time=sortFilterInitialState,
  setTime=()=>{}, 

  filterIconSize=12,  
  handleSortFilter,
}) => {
  
  // Types of filter display options
  const FILTER_TYPES = ['chip', 'dropdown', 'autocomplete', 'date', 'time'];

  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [isModalVisible, setIsModalVisible] = useState(modalVisible || true);
  const [isLoading, setIsLoading] = useState(true);

  // State used to keep track of whether initializeData state has changed
  const [localFilterOptionDetails, setLocalFilterOptionDetails] = useState(filterOptionDetails);
    
  // Whenever data changes, reinitialize sort and filter options and apply search, sort, filter
  useEffect(() => {
    console.log('MODAL 1 - useEffect [initializeData, filterOptionDetails]', initializeData)
    if (initializeData) {
      console.log('MODAL 1.5 - useEffect [initializeData, filterOptionDetails]')
      initSortFilterOptions();
      onInitialize();
    }
  }, [initializeData])

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    console.log('MODAL 2 - useEffect [isModalVisible]')
    setIsLoading(true);

    const update = prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    })

    setSort(prevState => update(prevState))    
    setDropdown(prevState => update(prevState))
    setChip(prevState => update(prevState))
    setAutocomplete(prevState => update(prevState))
    setDatetime(prevState => update(prevState))
    setTime(prevState => update(prevState))

    Keyboard.dismiss();
    setIsLoading(false);
  }, [isModalVisible])

  
  // Initialize sort and filteroptions based on view mode
  const initSortFilterOptions = () => {
    console.log('MODAL 3 - initSortOptions')

    let tempSort = initSort();
    setSort(tempSort);

    let tempFilters = initFilterOptions();
    let tempChip = tempFilters.tempChip;
    let tempDropdown = tempFilters.tempDropdown;
    let tempAutocomplete = tempFilters.tempAutocomplete;
    let tempDatetime = tempFilters.tempDatetime;
    setDropdown(tempDropdown);
    setChip(tempChip);
    setAutocomplete(tempAutocomplete);
    setDatetime(tempDatetime)

    // Do not sort/filter if applySortFilter is false
    // For example, if only temporarily updating filter options when modal is open, no need to apply sort/filter
    if(applySortFilter) {
      handleSortFilter({
        'tempSelSort': tempSort['tempSel'], 
        'tempSelDropdownFilters': tempDropdown['tempSel'], 
        'tempSelChipFilters': tempChip['tempSel'],
        'tempSelAutocompleteFilters': tempAutocomplete['tempSel'],
        'tempSelDatetimeFilters': tempDatetime['tempSel'],
      });
    } else {
      setApplySortFilter(true);
    }
  }

  // Initialize sort state
  const initSort = () => {
    let tempSort = {'filterOptions': parseSelectOptions(SORT_OPTIONS), 'sel': {}, 'tempSel': {}};

    const keys = ['sel', 'tempSel'];
    for(var i = 0; i<keys.length; i++) {
      const key = keys[i];
      if('option' in sort[key]) {
        let label = sort[key]['option']['label'];
  
        if (sort['filterOptions'].find(x => x['label'] == label)) {
          tempSort[key] = {
            'option': sort['filterOptions'].find(x => x['label'] == label),
            'asc': sort[key]['asc']
          }
        } else {
          tempSort[key] = {
            'option': sort['filterOptions'][0],
            'asc': true
          }
        }
      } else {
        tempSort[key] = {
          'option': tempSort['filterOptions'][0],
          'asc': true
        }
      }
    }    
    return tempSort
  }

  // Initialize filter states
  const initFilterOptions = () => {
    let tempDropdown = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempChip = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempAutocomplete = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempDatetime = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};

    if(FILTER_OPTIONS.length > 0) {
      
      for(var filter of FILTER_OPTIONS) {
        let tempFilterOptionList;
        
        // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
        if (isEmptyObject(filterOptionDetails[filter]['options'])) {
          tempFilterOptionList = originalList.map(x => x[FIELD_MAPPING[filter]]);
          tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
        }

        // Parse filter options based on dropdown/chip type
        switch(filterOptionDetails[filter]['type']) {
          case 'chip':
            if(!isEmptyObject(filterOptionDetails[filter]['options'])) {
              tempFilterOptionList = Object.keys(filterOptionDetails[filter]['options'])
            }            
            tempChip['filterOptions'][filter] = parseSelectOptions(tempFilterOptionList);
            tempChip = initSelectedFilters(tempChip, filter, chip);           
            break;
          case 'dropdown':
            if(!isEmptyObject(filterOptionDetails[filter]['options'])) {
              tempDropdown.filterOptions[filter] = [{'label': 'All', 'value': 'All'}, ...Object.entries(filterOptionDetails[filter]['options'])
              .map(([key, label]) => ({
                value: label,
                label: key,
              }))];
            } else {
              tempDropdown['filterOptions'][filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
            }            
            tempDropdown = initSelectedFilters(tempDropdown, filter, dropdown);            
            break;
          case 'autocomplete':
            if(!isEmptyObject(filterOptionDetails[filter]['options'])) {
              tempAutocomplete.filterOptions[filter] = [{'title': 'All', 'id': 'All'}, ...Object.entries(filterOptionDetails[filter]['options'])
              .map(([key, value]) => ({
                id: value,
                title: key,
              }))];
            } else {
              tempAutocomplete['filterOptions'][filter] = parseAutoCompleteOptions(['All', ...tempFilterOptionList]);
            }            
            tempAutocomplete = initSelectedFilters(tempAutocomplete, filter, autocomplete, 'id');            
            break;
          case 'time':
          case 'date': 
            tempDatetime['filterOptions'][filter] = {}
            tempDatetime['sel'][filter] = {}
            tempDatetime['tempSel'][filter] = {}
            const keys = ['min', 'max'];
            for (var i = 0; i<keys.length; i++) {
              const key = keys[i];
              if(key in filterOptionDetails[filter]['options']) {
                tempDatetime['filterOptions'][filter][key] = {
                  'default': filterOptionDetails[filter]['options'][key]['default'] || null,
                  'limit': filterOptionDetails[filter]['options'][key]['limit'] || null
                }
                tempDatetime['sel'][filter][key] = filter in datetime['sel'] 
                  ? datetime['sel'][filter][key] 
                  : tempDatetime['filterOptions'][filter][key]['default']; 
                tempDatetime['tempSel'][filter][key] = filter in datetime['tempSel'] 
                ? datetime['tempSel'][filter][key] 
                : tempDatetime['filterOptions'][filter][key]['default'];
              }
            }
            break;
        }
      }
    }
    return {tempChip, tempDropdown, tempAutocomplete, tempDatetime};
  }
  
  // If filter already selected, set to new filter with same value if exists
  // Otherwise set to first option
  // Note: real time update of tempsel value will not be reflected in autocomplete
  const initSelectedFilters = (temp, filter, og, key='value') => {        
    console.log('MODAL 4 - initSelectedFilters', )
    if(filter in og['tempSel']) {
      let sel = og['sel'][filter][key];
      temp['sel'][filter] = temp['filterOptions'][filter].find(x => x[key] == sel) || temp['filterOptions'][filter][0];
      let tempSel = og['tempSel'][filter][key];
      temp['tempSel'][filter] = temp['filterOptions'][filter].find(x => x[key] == tempSel) || temp['filterOptions'][filter][0];
    } else {
      temp['sel'][filter] = temp['filterOptions'][filter][0];
      temp['tempSel'][filter] = temp['filterOptions'][filter][0];
    }
    return temp;
  }

  // Apply sort and filter values and close modal
  const handleApply = () => {
    console.log('MODAL 5 - handleApply', )
    updateState(setIsModalVisible, setModalVisible, false);
    const update = prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    })

    setSort(prevState => update(prevState));
    setDropdown(prevState => update(prevState));
    setChip(prevState => update(prevState));
    setAutocomplete(prevState => update(prevState));
    setDatetime(prevState => update(prevState));

    handleSortFilter({
      'tempSelSort': sort['tempSel'], 
      'tempSelDropdownFilters': dropdown['tempSel'], 
      'tempSelChipFilters': chip['tempSel'],
      'tempSelAutocompleteFilters': autocomplete['tempSel'],
      'tempSelDatetimeFilters': datetime['tempSel'],
    });
  };

  // Set selected and temporary selected options for each filter to the default (first option)
  const resetFilters = (temp, filters) => {
    for (var filter in filters ? {[filters]: null} : temp['filterOptions']) {
      temp['sel'][filter] = temp['filterOptions'][filter][0];
      temp['tempSel'][filter] = temp['filterOptions'][filter][0];
    }
    return temp;
  }  

  const resetDatetimeFilters = (temp) => {
    for(var filter in temp['filterOptions']) {
      if('min' in temp['filterOptions'][filter]) {
        temp['sel'][filter]['min'] = temp['filterOptions'][filter]['min']['default'];
        temp['tempSel'][filter]['min'] = temp['filterOptions'][filter]['min']['default'];
      }
      if('max' in temp['filterOptions'][filter]) {
        temp['sel'][filter]['max'] = temp['filterOptions'][filter]['max']['default'];
        temp['tempSel'][filter]['max'] = temp['filterOptions'][filter]['max']['default'];
      }
    }
    return temp;
  }
  
  // Reset sort and filter values and close modal
  const handleReset = () => {
    // console.log('MODAL -', 5, 'handleReset')

    let tempDropdown = resetFilters({...dropdown});
    let tempChip = resetFilters({...chip});
    let tempAutocomplete = resetFilters({...autocomplete});
    let tempSortSel = {
      'option': {...sort.filterOptions[0]},
      'asc': true,
    }
    let tempDatetime = resetDatetimeFilters({...datetime});

    setSort(prevState => ({
      ...prevState,
      sel: {...tempSortSel},
      tempSel: {...tempSortSel}
    }));
    setDropdown(tempDropdown);
    setChip(tempChip);
    setAutocomplete(tempAutocomplete);
    setDatetime(tempDatetime);

    updateState(setIsModalVisible, setModalVisible, false);
    handleSortFilter({
      'tempSelSort': tempSortSel, 
      'tempSelDropdownFilters': tempDropdown['tempSel'], 
      'tempSelChipFilters': tempChip['tempSel'],
      'tempSelAutoCompleteFilters': tempAutocomplete['tempSel'],
      'tempSelDatetimeFilters': tempDatetime['tempSel'],
    });  };

  // Set display value of sort item is selected
  const handleOnSelectChipSort = (item) => {
    // console.log('MODAL -', 6, 'handleOnSelectChipSort')

    let asc = true;
    if(sort['tempSel']['option']['value'] == item.value) {
      asc = !sort['tempSel']['asc'];
    }
    setSort(prevState => ({
      ...prevState,
      tempSel: {
        'option': item,
        'asc': asc
      }
    }))
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
      let tempSelectedFilters = autocomplete['tempSel'];
      tempSelectedFilters[filter] = item;
      item && setAutocomplete(prevState => ({
        ...prevState,
        tempSel: tempSelectedFilters
      }))
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
  
  // Set display value of date filter when item is selected
  const handleOnSelectDatetimeFilter = (datetimeVal, filter, type) => {
    console.log(datetimeVal)
    let tempSelectedDatetimeFilter = {...datetime['tempSel'][filter]} || {};
 
    if(type == 'min') {
      tempSelectedDatetimeFilter['min'] = datetimeVal;
    } else if(type == 'max'){
      tempSelectedDatetimeFilter['max'] = datetimeVal;      
    }

    setDatetime(prevState => ({
      ...prevState,
      tempSel: {
        ...prevState['tempSel'],
        [filter]: tempSelectedDatetimeFilter
      }
    }))
  }

  // Set upper limit of date filter
  const setMaxDate = (filter, type) => {
    let maxDate = datetime['filterOptions'][filter][type]['limit'] ? datetime['filterOptions'][filter][type]['limit']['max'] : null ;
    if(type == 'min') {
      if('max' in datetime['tempSel'][filter]) {
        maxDate = datetime['tempSel'][filter]['max'] == null 
          ? maxDate 
          : maxDate == null
            ? datetime['tempSel'][filter]['max'] 
            : datetime['tempSel'][filter]['max'] < maxDate 
              ? datetime['tempSel'][filter]['max'] 
              : maxDate
      } 
    } 
    return maxDate;    
  }
  // Set lower limit of date filter
  const setMinDate = (filter, type) => {
    let minDate = datetime['filterOptions'][filter][type]['limit'] ? datetime['filterOptions'][filter][type]['limit']['min'] : null;
    if(type == 'max') {
      if('min' in datetime['tempSel'][filter]) {
        minDate = datetime['tempSel'][filter]['min'] == null 
        ? minDate 
        : minDate == null
        ? datetime['tempSel'][filter]['min'] 
        : datetime['tempSel'][filter]['min'] > minDate 
        ? datetime['tempSel'][filter]['min'] 
        : minDate
      } 
    }
    return minDate;
  }
  
  // For time filters where user has input both min and max time, ensure that min time is less than max time
  // Else show error and disable submit button
  const checkTimeFilterError = (filter) => {
    let err = false;
    if ('min' in datetime['filterOptions'][filter] && 'max' in datetime['filterOptions'][filter]) {
      if(datetime['tempSel'][filter]['min'] != null && datetime['tempSel'][filter]['max'] != null) {
        if(datetime['tempSel'][filter]['min'] > datetime['tempSel'][filter]['max']) {
          err = true;
        }
      }
    }
    return err;
  }

  const checkFilterError = () => {
    let err = false;
    for(var filter in datetime['filterOptions']) {
      if(filterOptionDetails[filter]['type'] == 'time') {
        err = checkTimeFilterError(filter) || false;
      }
    }
    return err;
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
              {sort['filterOptions'].length > 0 ? (
                <View>
                  <Text style={styles.textStyle}>Sort by</Text>
                  <ScrollView
                    horizontal={true}
                    flex={1}
                    showsHorizontalScrollIndicator={false}
                    >
                    <View style={styles.chipOptions}>
                      {
                        sort['filterOptions'].map((item) => (
                          <Chip
                            key={item.value}
                            title={item.label}
                            onPress={() => handleOnSelectChipSort(item)}
                            type={sort['tempSel']['option'].value == item.value ? 'solid' : 'outline'}
                            containerStyle={styles.chipOption}
                            buttonStyle={{backgroundColor: sort['tempSel']['option'].value == item.value ? colors.green : 'transparent', borderColor: colors.green}}
                            titleStyle={{color: sort['tempSel']['option'].value == item.value ? colors.white : colors.green}}
                            iconRight
                            icon={{
                              name: sort['tempSel']['option'].value == item.value 
                              ? sort['tempSel']['asc']
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
                <View style={styles.filterContainer}>
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
              {!isEmptyObject(autocomplete['filterOptions']) ? (
                <View style={styles.filterContainer}>
                    {Object.keys(autocomplete['filterOptions']).map((filter) => 
                      (<View key={filter}>
                        <Text style={styles.textStyle}>{filter}</Text>
                        <AutocompleteDropdown
                          ref={searchRefs[filter]}
                          closeOnBlur={false}
                          dataSet={autocomplete['filterOptions'][filter]}
                          onSelectItem={(item) => handleOnSelectAutocompleteFilter(item, filter)}
                          onClear={() => resetFilters(autocomplete, filter)}
                          textInputProps={{
                            placeholder: 'Enter value',
                            autoCorrect: false,
                            autoCapitalize: 'none',
                          }}
                          initialValue={autocomplete['sel'][filter]}
                          suggestionsListMaxHeight={150} 
                          useFilter={true}
                          />                        
                      </View>)
                    )}
                </View>
              ): null}
            {!isEmptyObject(datetime['filterOptions']) ? (
              <View style={styles.filterContainer}>
                {Object.keys(datetime['filterOptions']).map((filter) => (
                  <View key={filter}>
                    <Text style={styles.textStyle}>{filter}{!('min' in datetime['filterOptions'][filter]) ? ' (Maximum)' : ''}{!('max' in datetime['filterOptions'][filter]) ? ' (Minimum)' : ''} </Text>
                    <View style={styles.datetimeFilterContainer}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {'min' in datetime['filterOptions'][filter] ? (
                          <View style={{flex:'max' in datetime['filterOptions'][filter] ? 0.5 : 1 }}>
                            <DateInputField
                              hideDayOfWeek
                              allowNull
                              mode={filterOptionDetails[filter]['type']}
                              placeholder={filterOptionDetails[filter]['type'] == 'date' ? 'Select date' : 'Select time'}
                              value={datetime['tempSel'][filter]['min']}
                              maximumInputDate={setMaxDate(filter, 'min')}
                              minimumInputDate={setMinDate(filter, 'min')}
                              handleFormData={(date) => handleOnSelectDatetimeFilter(date, filter, 'min')}
                              dateForTime={filterOptionDetails[filter]['options']['date']}
                              />                            
                          </View>   
                        ) : null}
                        {'min' in datetime['filterOptions'][filter] && 'max' in datetime['filterOptions'][filter] ? (
                          <View style={styles.dateTitle}>
                            <Text style={styles.textStyle}>To</Text>
                          </View>
                        ) : null}
                        {'max' in datetime['filterOptions'][filter] ? (                      
                          <View style={{flex: 'min' in datetime['filterOptions'][filter] ? 0.5 : 1}}>
                            <DateInputField
                              hideDayOfWeek
                              allowNull
                              mode={filterOptionDetails[filter]['type']}
                              placeholder={filterOptionDetails[filter]['type'] == 'date' ? 'Select date' : 'Select time'}
                              maximumInputDate={setMaxDate(filter, 'max')}
                              minimumInputDate={setMinDate(filter, 'max')}
                              value={datetime['tempSel'][filter]['max']}
                              handleFormData={(date) => handleOnSelectDatetimeFilter(date, filter, 'max')}
                              dateForTime={filterOptionDetails[filter]['options']['date']}
                              />                            
                          </View> 
                        ) : null}
                      </LocalizationProvider>
                    </View>
                    {checkTimeFilterError(filter) ? (
                      <Text style={styles.errorMsg}>Start time cannot be greater than end time</Text>
                    ) : null}
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
                  backgroundColor={checkFilterError() ? colors.gray : colors.green}
                  onPress={() => {
                    handleApply();
                  }}
                  disabled={checkFilterError()}
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
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  dateTitle: {
    paddingHorizontal: 5,
    alignItems: 'center', 
    marginTop: 15
  },
  datetimeFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 17
  },
  errorMsg: {
    color: colors.red
  }
});

export default FilterModalCard;
