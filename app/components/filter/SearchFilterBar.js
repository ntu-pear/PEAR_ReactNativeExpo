// Libs
import { useEffect, useState } from 'react';
import { Center, Divider } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SearchBar from 'app/components/input-fields/SearchBar';
import FilterModalCard from 'app/components/filter/FilterModalCard';
import { parseAutoCompleteOptions, parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import FilterIndicator from 'app/components/filter/FilterIndicator';
import TabBar from '../TabBar';

function SearchFilterBar({
  originalList={},
  setList=()=>{},
  setIsLoading=()=>{},
  viewMode='',
  setViewMode=()=>{},
  handleSearchSortFilterCustom,
  itemCount=null,   
  constants: {
    VIEW_MODES={},
    SEARCH_OPTIONS={},
    SORT_OPTIONS={},
    FILTER_OPTIONS={},
    FILTER_OPTION_DETAILS={},
    FIELD_MAPPING={},
  },
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
    searchOption='',
    setSearchOption=()=>{},
    searchQuery='',
    setSearchQuery=()=>{}
  },
}) {  
  // Default state to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Whenever data changes, reinitialize sort and filter options
  useEffect(() => {
    initSortFilter();
  }, [originalList])

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
        tempFilterOptionList = originalList.map(x => x[FIELD_MAPPING[filter]]);
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

  const handleSearchSortFilter = ({
    text=searchQuery, 
    tempSelSort=selectedSort, 
    tempSelDropdownFilters=selectedDropdownFilters,
    tempSelChipFilters=selectedChipFilters, 
    tempSelAutocompleteFilters=selectedAutocompleteFilters, 
    tempSearchMode=searchOption,
  }) => {
    // console.log(tempSearchMode)
    if(handleSearchSortFilterCustom) {
      handleSearchSortFilterCustom({
        text: text, 
        tempSelSort: tempSelSort, 
        tempSelDropdownFilters: tempSelDropdownFilters,
        tempSelChipFilters: tempSelChipFilters, 
        tempSelAutocompleteFilters: tempSelAutocompleteFilters, 
        tempSearchMode: tempSearchMode,
        setFilteredList
      });
    } else {
      setFilteredList(
        text, 
        tempSelSort, 
        tempSelDropdownFilters,
        tempSelChipFilters, 
        tempSelAutocompleteFilters, 
        tempSearchMode
      )
    }
  }
  
  // Update list based on search, sort, and filter criteria
  const setFilteredList = (
    text, 
    tempSelSort, 
    tempSelDropdownFilters, 
    tempSelChipFilters, 
    tempSelAutocompleteFilters, 
    tempSearchMode
  ) => {
    let filteredListOfPatients = originalList.map((obj) => ({
      ...obj,
      fullName: `${obj.firstName.trim()} ${obj.lastName.trim()}`
    }));   

    // Search
    filteredListOfPatients = filteredListOfPatients.filter((item) => {
      return item[FIELD_MAPPING[tempSearchMode]].toLowerCase().includes(text.toLowerCase());
    })
      
    // Sort
    filteredListOfPatients = sortArray(filteredListOfPatients, 
      FIELD_MAPPING[Object.keys(tempSelSort).length == 0 ? 
        sortOptions[0]['label'] : 
        tempSelSort['option']['label']],
      tempSelSort['asc'] != null ? tempSelSort['asc'] : true);
  
    // Dropdown filters
    for (var filter of Object.keys(tempSelDropdownFilters)) {
      if(tempSelDropdownFilters[filter]['label'] != 'All') {
        filteredListOfPatients = filteredListOfPatients.filter((obj) => (
          obj[FIELD_MAPPING[filter]] === tempSelDropdownFilters[filter]['label'])) || []
      }
    }

    // Autocomplete filters
    for (var filter of Object.keys(tempSelAutocompleteFilters)) {
      filteredListOfPatients = filteredListOfPatients.filter((obj) => (
        obj[FIELD_MAPPING[filter]] === tempSelAutocompleteFilters[filter]['title'])) || []
    }

    // Chip Filters
    // Only filter if required
    // For example, patient status is not meant for filtering - it requires new API call, so do not filter
    // Use custom options if declared in FILTER_MAPPING 
    for (var filter of Object.keys(tempSelChipFilters)) {
      if(FILTER_OPTION_DETAILS[filter]['isFilter']){
        if(Object.keys(FILTER_OPTION_DETAILS[filter]['options']).length == 0) {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FIELD_MAPPING[filter]] === tempSelChipFilters[filter]['label'])) || []
        } else {
          filteredListOfPatients = filteredListOfPatients.filter((obj) => (
            obj[FIELD_MAPPING[filter]] === FILTER_OPTION_DETAILS[filter]['options'][tempSelChipFilters[filter]['label']])) || []
        }
      }
    }  

    setList(filteredListOfPatients);
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
    const label = SEARCH_OPTIONS.filter(x=>x.value == item)[0]['label'];
    setSearchOption(label);
    if(searchQuery != '') {
      handleSearchSortFilter({tempSearchMode: label});
    }   
  }

  // Switch between 'My Patients' and 'All Patients'
  const handleOnToggleViewMode = (mode) => {
    if(mode!=viewMode) {
      setIsLoading(true);
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
      {Object.keys(VIEW_MODES).length > 0 ? (
        <>
          <TabBar
            TABS={VIEW_MODES}
            curTab={viewMode}
            setCurTab={setViewMode}
            handleSwitchTab={handleOnToggleViewMode}
          />
          <Divider />
        </>
      ) : null}
      <View style={styles.optionsContainer}>
        <SearchBar 
          onChangeText={handleSearch}
          value={searchQuery}
          autoCapitalize='characters'
          inputContainerStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 47}}
          handleOnToggleSearchOptions={handleOnToggleSearchOptions}
          SEARCH_OPTIONS={SEARCH_OPTIONS}
        />
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
        {itemCount ? (
          <>
            <View style={styles.itemCount}>
              <Text>No. of patients: {itemCount}</Text>
            </View>

            <Divider 
              orientation='vertical' 
              marginHorizontal='2%'
              height={'60%'} 
              alignSelf={'center'}
            />
          </>
        ) : null}
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
  itemCount: {
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
