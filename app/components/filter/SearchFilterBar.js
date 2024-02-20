// Libs
import { Center, Icon, Divider } from 'native-base';
import { Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SearchBar from 'app/components/input-fields/SearchBar';
import FilterModalCard from 'app/components/filter/FilterModalCard';
import { parseAutoCompleteOptions, parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import FilterIndicator from 'app/components/filter/FilterIndicator';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { useEffect, useRef, useState } from 'react';
import SelectionInputField from '../input-fields/SelectionInputField';

function SearchFilterBar({
  data={},
  SORT_OPTIONS={},
  FILTER_OPTIONS={},
  FILTER_OPTION_DETAILS={},
  SORT_FILTER_MAPPING={},
  setIsLoading=()=>{},
  viewMode='myPatients',
  setViewMode=()=>{},
  sort: {
    sortOptions={},
    setSortOptions=()=>{},
    selectedSort={},
    setSelectedSort=()=>{}
  },
  chipFilter: {    
    chipFilterOptions={},
    setChipFilterOptions=()=>{},
    selectedChipFilters={},
    setSelectedChipFilters=()=>{},
  },
  dropdownFilter: {
    dropdownFilterOptions={},
    setDropdownFilterOptions=()=>{},
    selectedDropdownFilters={},
    setSelectedDropdownFilters=()=>{}
  },
  autoCompleteFilter: {
    autocompleteFilterOptions={},
    setAutocompleteFilterOptions=()=>{},
    selectedAutocompleteFilters={},
    setSelectedAutocompleteFilters=()=>{},
  },
  search: {
    setSearchOption=()=>{},
    searchQuery='',
    setSearchQuery=()=>{}
  },
  handleSearchSortFilter=()=>{},
  itemCount=null,   
}) {  
  // Default state to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Constant search options
  const searchOptions = parseSelectOptions(['Full Name', 'Preferred Name']);

  // Whenever data changes, reinitialize sort and filter options
  useEffect(() => {
    initSortFilter();
  }, [data])

  // Initialize sort and filter options based on view mode
  const initSortFilter = () => {
    let tempDropdownFilterOptions = {};
    let tempAutocompleteFilterOptions = {};
    let tempChipFilterOptions = {};

    for(var filter of FILTER_OPTIONS[viewMode]) {
      let tempFilterOptionList;
      
      // If no custom options for a filter, get options from patient list by taking distinct values of the filter property
      // Else use custom options
      if (Object.keys(FILTER_OPTION_DETAILS[filter]['options']).length == 0) {
        tempFilterOptionList = data.map(x => x[SORT_FILTER_MAPPING[filter]]);
        tempFilterOptionList = Array.from(new Set(tempFilterOptionList));        
      } else {
        tempFilterOptionList = Object.keys(FILTER_OPTION_DETAILS[filter]['options'])
      }

      // Parse filter options based on dropdown/chip type
      if(FILTER_OPTION_DETAILS[filter]['type'] == 'dropdown') {
        tempDropdownFilterOptions[filter] = parseSelectOptions(['All', ...tempFilterOptionList]);
      } else if (FILTER_OPTION_DETAILS[filter]['type'] == 'chip') {
        tempChipFilterOptions[filter] = parseSelectOptions(tempFilterOptionList);
      } else if (FILTER_OPTION_DETAILS[filter]['type'] == 'autocomplete') {
        tempAutocompleteFilterOptions[filter] = parseAutoCompleteOptions(tempFilterOptionList);
      }
    }
    setDropdownFilterOptions(tempDropdownFilterOptions);
    setAutocompleteFilterOptions(tempAutocompleteFilterOptions);
    setChipFilterOptions(tempChipFilterOptions);
    setSortOptions(parseSelectOptions(SORT_OPTIONS[viewMode]))
  }
    
  // Reset selected search, sort, and filter options
  const resetSearchSortFilter = () => {
    setSearchOption('Full Name');
    setSearchQuery('');
    setSelectedSort({});
    setSelectedDropdownFilters({});
    setSelectedAutocompleteFilters({});
    setSelectedChipFilters({});
  }

  // Switch between search modes (full name, preferred name)
  const handleOnToggleSearchOptions = async(item) => {
    const label = searchOptions.filter(x=>x.value == item)[0]['label'];
    setSearchOption(label);
    if(searchQuery != '') {
      handleSearchSortFilter({tempSearchMode: label});
    }   
  }

  // Switch between 'My Patients' and 'All Patients'
  const handleOnToggleViewMode = (mode) => {
    if(mode!=viewMode) {
      setIsLoading(true);
      setViewMode(mode);    
      resetSearchSortFilter();
    }
  }

  // Update search state and handle searching when user changes search query
  const handleSearch = (text) => {
    setSearchQuery(text); 
    handleSearchSortFilter({'text': text})
  }

  return (
    <Center backgroundColor={colors.white_var1} zindex={1}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.tab, ...viewMode=='myPatients' ? [styles.selectedTab] : []]}
          onPress={() => handleOnToggleViewMode('myPatients')}
          activeOpacity={1}
          >
            <Text style={[styles.tabText, ...viewMode=='myPatients' ? [styles.selectedTabText] : []]}>My Patients</Text>
        </TouchableOpacity>
        <Divider orientation='vertical' height={5} alignSelf='center'/>
        <TouchableOpacity 
          style={[styles.tab, ...viewMode=='allPatients' ? [styles.selectedTab] : []]}
          onPress={() => handleOnToggleViewMode('allPatients')}
          activeOpacity={1}
          >
            <Text style={[styles.tabText, ...viewMode=='allPatients' ? [styles.selectedTabText] : []]}>All Patients</Text>
        </TouchableOpacity>            
      </View>
      <Divider />
      <View style={styles.optionsContainer}>
        <View style={styles.searchBar}>
          <SearchBar 
            onChangeText={handleSearch}
            value={searchQuery}
            autoCapitalize='characters'
            inputContainerStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 47}}
          />
        </View>
        <View style={{flex: 0.4, zIndex: 1}}>
          {/* <AutocompleteDropdown
            dataSet={parseAutoCompleteOptions(['Full Name', 'Preferred Name'])}
            closeOnBlur={true}              
            initialValue='1'
            useFilter={false}
            showClear={false}
            inputHeight={47}
            onSelectItem={(item) => handleOnToggleSearchOptions(item)}
            inputContainerStyle={{backgroundColor: colors.green, color: colors.white, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
            textInputProps={{color: colors.white, fontSize: 13.5, fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android}}
            suggestionsListContainerStyle={{zIndex: 2}}
            flatListProps={{zIndex: 2}}
            ChevronIconComponent={(
            <Icon 
              as={
                <MaterialIcons 
                name="keyboard-arrow-down" 
                />
              } 
              size={7}
              color={colors.white}
            >
            </Icon>)}

          /> */}
          <SelectionInputField
            dataArray={searchOptions}
            showTitle={false}
            otherProps={{
              backgroundColor: colors.green,
              color: colors.white,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 10, 
              borderBottomRightRadius: 10,
            }}
            onDataChange={handleOnToggleSearchOptions}                        
          />

        </View>
        <View>
          <FilterModalCard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            sort={{
              sortOptions: sortOptions,
              selectedSort: selectedSort,
              setSelectedSort: setSelectedSort,
            }}
            autoCompleteFilter={{
              autocompleteFilterOptions:autocompleteFilterOptions,
              selectedAutocompleteFilters:selectedAutocompleteFilters,
              setSelectedAutocompleteFilters:setSelectedAutocompleteFilters,
            }}
            dropdownFilter={{
              dropdownFilterOptions: dropdownFilterOptions,
              selectedDropdownFilters: selectedDropdownFilters,
              setSelectedDropdownFilters: setSelectedDropdownFilters,
            }}
            chipFilter={{
              chipFilterOptions: chipFilterOptions,
              selectedChipFilters: selectedChipFilters,
              setSelectedChipFilters: setSelectedChipFilters,
            }}
            handleSortFilter={handleSearchSortFilter}
          />
        </View>
      </View>
      <View
        style={[styles.optionsContainer, {paddingTop: 0}]}
      >
        <View style={styles.patientCount}>
          <Text>No. of patients: {itemCount}</Text>
        </View>

        <Divider 
          orientation='vertical' 
          marginHorizontal='2%'
          height={'60%'} 
          alignSelf={'center'}
        />

        <FilterIndicator
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedSort={Object.keys(selectedSort).length > 0 ? selectedSort : {'option': sortOptions[0], 'asc': true}}
          setSelectedSort={setSelectedSort}
          chipFilterOptions={chipFilterOptions}
          selectedChipFilters={selectedChipFilters}
          selectedDropdownFilters={selectedDropdownFilters}
          selectedAutocompleteFilters={selectedAutocompleteFilters}
          handleSortFilter={handleSearchSortFilter}
        />
      </View>
      
      <Divider/>
    </Center>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    paddingVertical: '1%',
    paddingHorizontal: '2%',
    alignSelf: 'flex-start',
    flexWrap: 'wrap'
  },
  dropDownOptionsAlignment: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  searchBar: {
    flex: 1,    
    marginTop: 5
  },
  patientListContainer: {
    paddingHorizontal: '5%',
  },
  patientRowContainer: {
    marginVertical: '3%',
    width: '100%',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  caregiverNameContainer: {
    marginLeft: '5%',
    justifyContent: 'center',
    alignItem: 'center',
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  patientCount: {
    fontSize: 13.5,
    marginLeft: '2%',
    paddingVertical: '1%',
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  tab: {
    padding: '1.5%',
    flex: 0.5,
  },
  tabText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  selectedTab: {
    borderBottomColor: colors.green,
    borderBottomWidth: 3,
  },
  selectedTabText: {
    fontWeight: 'bold',
    color: colors.green,
  }
});

export default SearchFilterBar;
