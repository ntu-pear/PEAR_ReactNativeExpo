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
  applySortFilter=true,
  setApplySortFilter,

  sort=sortFilterInitialState,
  setSort=()=>{},

  dropdown=sortFilterInitialState,
  setDropdown=()=>{},

  chip=sortFilterInitialState,
  setChip=()=>{},
  
  autocomplete=sortFilterInitialState,
  setAutocomplete=()=>{},
  
  date=sortFilterInitialState,
  setDate=()=>{}, 

  filterIconSize=12,  
  handleSortFilter,
}) => {
  // Types of filter display options
  const FILTER_TYPES = ['chip', 'dropdown', 'autocomplete', 'date', 'tempSelFilters'];

  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const searchRefs = useRef({});

  const [isModalVisible, setIsModalVisible] = useState(modalVisible || true);
  const [isLoading, setIsLoading] = useState(true);

  // State used to keep track of whether initializeData state has changed
  const [localFilterOptionDetails, setLocalFilterOptionDetails] = useState(filterOptionDetails);
    
  // Whenever data changes, reinitialize sort and filter options and apply search, sort, filter
  useEffect(() => {
    // console.log('MODAL -', 1, 'useEffect [initializeData, filterOptionDetails]', initializeData)
    if (initializeData) {
      initSortFilterOptions();
      onInitialize();
    }
  }, [initializeData, filterOptionDetails])

  // Re-initialize sort and filter values to currently applied values whenever modal opens
  useEffect(() => {
    // console.log('MODAL -', 2, 'useEffect [isModalVisible]', isModalVisible)
    setIsLoading(true);

    setSort(prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    }))
    
    setDropdown(prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    }))

    setChip(prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    }))

    setAutocomplete(prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    }))

    setDate(prevState => ({
      ...prevState,
      tempSel: {...prevState.sel}
    }))

    Keyboard.dismiss();
    setIsLoading(false);
  }, [isModalVisible])

  
  // Initialize sort and filteroptions based on view mode
  const initSortFilterOptions = () => {
    // console.log('BAR -', 3, 'initSortOptions')

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
    setSort(tempSort);

    let tempDropdown = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempChip = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempAutocomplete = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};
    let tempDate = {'filterOptions': {}, 'sel': {}, 'tempSel': {}};

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
          case 'date': 
            tempDate['filterOptions'][filter] = {}
            tempDate['sel'][filter] = {}
            tempDate['tempSel'][filter] = {}
            const keys = ['min', 'max'];
            for (var i = 0; i<keys.length; i++) {
              const key = keys[i];
              if(key in filterOptionDetails[filter]['options']) {
                tempDate['filterOptions'][filter][key] = {
                  'default': filterOptionDetails[filter]['options'][key]['default'] || null,
                  'limit': filterOptionDetails[filter]['options'][key]['limit'] || null
                }
                tempDate['sel'][filter][key] = filter in date['sel'] 
                  ? date['sel'][filter][key] 
                  : tempDate['filterOptions'][filter][key]['default']; 
                tempDate['tempSel'][filter][key] = filter in date['tempSel'] 
                ? date['tempSel'][filter][key] 
                : tempDate['filterOptions'][filter][key]['default'];
              }
            }
            break;
        }
      }
    }
    setDropdown(tempDropdown);
    setChip(tempChip);
    setAutocomplete(tempAutocomplete);
    setDate(tempDate)

    // Only apply sort filter if no change to filterOptionDetails
    // For example, if only updating filter options, no need to apply sort/filter
    // if(applySortFilter) {
    //   handleSortFilter({});
    // } else {
    //   setApplySortFilter(true);
    // }
    // For example, if only updating filter options, no need to apply sort/filter
    if(filterOptionDetails == localFilterOptionDetails ) {
      handleSortFilter({
        'tempSelSort': tempSort['tempSel'], 
        'tempSelDropdownFilters': tempDropdown['tempSel'], 
        'tempSelChipFilters': tempChip['tempSel'],
        'tempSelAutocompleteFilters': tempAutocomplete['tempSel'],
        'tempSelDateFilters': tempDate['tempSel'],
      });
    } else {
      setLocalFilterOptionDetails(filterOptionDetails);
    }
  }

  // If filter already selected, set to new filter with same value if exists
  // Otherwise set to first option
  // Note: real time update of tempsel value will not be reflected in autocomplete
  const initSelectedFilters = (temp, filter, og, key='value') => {        
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
    // console.log('MODAL -', 4, 'handleApply', )
    updateState(setIsModalVisible, setModalVisible, false);

    setSort(prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    }))

    setDropdown(prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    }))

    setChip(prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    }))

    setAutocomplete(prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    }))

    setDate(prevState => ({
      ...prevState,
      sel: {...prevState.tempSel}
    }))

    handleSortFilter({
      'tempSelSort': sort['tempSel'], 
      'tempSelDropdownFilters': dropdown['tempSel'], 
      'tempSelChipFilters': chip['tempSel'],
      'tempSelAutocompleteFilters': autocomplete['tempSel'],
      'tempSelDateFilters': date['tempSel'],
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

  const resetDateFilters = (temp) => {
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
    let tempDate = resetDateFilters({...date});

    setSort(prevState => ({
      ...prevState,
      sel: {...tempSortSel},
      tempSel: {...tempSortSel}
    }));
    setDropdown(tempDropdown);
    setChip(tempChip);
    setAutocomplete(tempAutocomplete);
    setDate(tempDate);

    updateState(setIsModalVisible, setModalVisible, false);
    handleSortFilter({
      'tempSelSort': tempSortSel, 
      'tempSelDropdownFilters': tempDropdown['tempSel'], 
      'tempSelChipFilters': tempChip['tempSel'],
      'tempSelAutoCompleteFilters': tempAutocomplete['tempSel'],
      'tempSelDateFilters': tempDate['tempSel'],
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
  const handleOnSelectDateFilter = (dateVal, filter, type) => {
    let tempSelectedDateFilter = {...date['tempSel'][filter]} || {};
 
    if(type == 'min') {
      tempSelectedDateFilter['min'] = dateVal;
    } else {
      tempSelectedDateFilter['max'] = dateVal;      
    }

    setDate(prevState => ({
      ...prevState,
      tempSel: {
        ...prevState['tempSel'],
        [filter]: tempSelectedDateFilter
      }
    }))
  }

  // Set upper limit of date filter
  const setMaxDate = (filter, type) => {
    let maxDate = date['filterOptions'][filter][type]['limit'] ? date['filterOptions'][filter][type]['limit']['max'] : null ;
    if(type == 'min') {
      if('max' in date['tempSel'][filter]) {
        maxDate = date['tempSel'][filter]['max'] == null 
          ? maxDate 
          : maxDate == null
            ? date['tempSel'][filter]['max'] 
            : date['tempSel'][filter]['max'] < maxDate 
              ? date['tempSel'][filter]['max'] 
              : maxDate
      } 
    } 
    return maxDate;    
  }
  // Set lower limit of date filter
  const setMinDate = (filter, type) => {
    let minDate = date['filterOptions'][filter][type]['limit'] ? date['filterOptions'][filter][type]['limit']['min'] : null;
    if(type == 'max') {
      if('min' in date['tempSel'][filter]) {
        minDate = date['tempSel'][filter]['min'] == null 
          ? minDate 
          : minDate == null
            ? date['tempSel'][filter]['min'] 
            : date['tempSel'][filter]['min'] > minDate 
              ? date['tempSel'][filter]['min'] 
              : minDate
      } 
    }
    return minDate;

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
            {!isEmptyObject(date['filterOptions']) ? (
              <View style={styles.filterContainer}>
                {Object.keys(date['filterOptions']).map((filter) => (
                  <View key={filter}>
                    <Text style={styles.textStyle}>{filter}{!('min' in date['filterOptions'][filter]) ? ' (Maximum)' : ''}{!('max' in date['filterOptions'][filter]) ? ' (Minimum)' : ''} </Text>
                    <View style={styles.dateFilterContainer}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {'min' in date['filterOptions'][filter] ? (
                          <View style={{flex:'max' in date['filterOptions'][filter] ? 0.5 : 1 }}>
                            <DateInputField
                              hideDayOfWeek
                              allowNull
                              mode='date'
                              placeholder={'Select date'}
                              value={date['tempSel'][filter]['min']}
                              maximumInputDate={setMaxDate(filter, 'min')}
                              minimumInputDate={setMinDate(filter, 'min')}
                              handleFormData={(date) => handleOnSelectDateFilter(date, filter, 'min')}
                              />                            
                          </View>   
                        ) : null}
                        {'min' in date['filterOptions'][filter] && 'max' in date['filterOptions'][filter] ? (
                          <View style={styles.dateTitle}>
                            <Text style={styles.textStyle}>To</Text>
                          </View>
                        ) : null}
                        {'max' in date['filterOptions'][filter] ? (                      
                          <View style={{flex: 'min' in date['filterOptions'][filter] ? 0.5 : 1}}>
                            <DateInputField
                              hideDayOfWeek
                              allowNull
                              mode='date'
                              placeholder={'Select date'}
                              maximumInputDate={setMaxDate(filter, 'max')}
                              minimumInputDate={setMinDate(filter, 'max')}
                              value={date['tempSel'][filter]['max']}
                              handleFormData={(date) => handleOnSelectDateFilter(date, filter, 'max')}
                            />                            
                          </View> 
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
  dateTitle: {
    paddingHorizontal: 5,
    alignItems: 'center', 
    marginTop: 15
  },
  dateFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  dateText: {
    fontSize: 17
  }
});

export default FilterModalCard;
