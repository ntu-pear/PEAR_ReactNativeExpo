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
import { isEmptyObject, parseAutoCompleteOptions, parseSelectOptions, sortArray } from 'app/utility/miscFunctions';
import FilterIndicator from 'app/components/filter/FilterIndicator';
import TabBar from '../TabBar';

function SearchFilterBar({
  originalList={},
  setList=()=>{},
  setIsLoading=()=>{},

  initializeData=true,
  onInitialize=()=>{},

  itemCount=null,   
  handleSearchSortFilterCustom,
  
  VIEW_MODES={},
  viewMode=null,
  setViewMode=()=>{},
  
  FIELD_MAPPING={},

  sort,
  setSort,
  filters,
  setFilters,

  dropdown,
  setDropdown,

  chip,
  setChip,
  
  SORT_OPTIONS={},
  selectedSort={},
  setSelectedSort=()=>{},
  tempSelectedSort={},
  setTempSelectedSort,
  
  FILTER_OPTIONS={},
  filterOptionDetails={},
  
  selectedAutocompleteFilters={},
  setSelectedAutocompleteFilters=()=>{},
  tempSelectedAutocompleteFilters={},
  setTempSelectedAutocompleteFilters,

  selectedDateFilters={},
  setSelectedDateFilters=()=>{},
  tempSelectedDateFilters={},
  setTempSelectedDateFilters,
  
  SEARCH_OPTIONS=[],
  searchOption='',
  setSearchOption,
  searchQuery='',
  setSearchQuery,
}) {  
  // Default state to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  
  // Search, sort, and filter related states
  const [sortOptions, setSortOptions] = useState(!isEmptyObject(SORT_OPTIONS) 
  ? parseSelectOptions(isEmptyObject(VIEW_MODES) ? SORT_OPTIONS : SORT_OPTIONS[viewMode]) 
  : {}
  );
  const [autocompleteFilterOptions, setAutocompleteFilterOptions] = useState({});
  const [dateFilterOptions, setDateFilterOptions] = useState({}); 

  const handleSearchSortFilter = ({
    text=searchQuery, 
    tempSelSort=selectedSort, 
    tempSelDropdownFilters=dropdown['tempSel'],
    tempSelChipFilters=chip['tempSel'], 
    tempSelAutocompleteFilters=selectedAutocompleteFilters, 
    tempSearchMode=searchOption,
  }) => {
    // console.log('BAR -', 3, 'handleSearchSortFilter')

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
      setFilteredList({
        text: text, 
        tempSelSort: tempSelSort, 
        tempSelDropdownFilters: tempSelDropdownFilters,
        tempSelChipFilters: tempSelChipFilters, 
        tempSelAutocompleteFilters: tempSelAutocompleteFilters, 
        tempSearchMode: tempSearchMode,
      })
      setIsLoading(false);
    }
  }
  
  // Update list based on search, sort, and filter criteria
  const setFilteredList = ({
    text=searchQuery, 
    tempSelSort=selectedSort, 
    tempSelDropdownFilters=dropdown['sel'],
    tempSelChipFilters=chip['sel'], 
    tempSelAutocompleteFilters=selectedAutocompleteFilters, 
    tempSearchMode=searchOption,
  }) => {
    // console.log('BAR -', 4, 'setFilteredList')

    let filteredList = originalList.map((obj) => ({
      ...obj,
      fullName: `${obj.firstName.trim()} ${obj.lastName.trim()}`
    }));   

    // Search
    filteredList = filteredList.filter((item) => {
      return item[FIELD_MAPPING[tempSearchMode]].toLowerCase().includes(text.toLowerCase());
    })
  
    // Sort
    if(!isEmptyObject(SORT_OPTIONS)) {
      filteredList = sortArray(filteredList, 
        FIELD_MAPPING[isEmptyObject(tempSelSort) ? 
          sortOptions[0]['label'] : 
          tempSelSort['option']['label']],
        tempSelSort['asc'] != null ? tempSelSort['asc'] : true);
    }
  
    // Dropdown filters
    for (var filter of Object.keys(dropdown['tempSel'])) {   
      if(tempSelDropdownFilters[filter]['label'] != 'All') {
        filteredList = getSubFilteredList(filteredList, filter, 'label', tempSelDropdownFilters);
      }      
    }

    // Autocomplete filters
    for (var filter of Object.keys(tempSelAutocompleteFilters)) {
      filteredList = getSubFilteredList(filteredList, filter, 'title', tempSelAutocompleteFilters);
    }

    // Chip Filters
    for (var filter of Object.keys(tempSelChipFilters)) {
      filteredList = getSubFilteredList(filteredList, filter, 'label', tempSelChipFilters);
    }  

    setList(filteredList);
  }

  // Apply filters
  // Only filter if required (isFilter is true)
  // For example, patient status is not meant for filtering - it requires new API call, so do not filter
  // Use custom options if declared in FILTER_MAPPING 
  const getSubFilteredList = (filteredList, filter, id, tempSelFilters) => {
    // console.log('BAR -', 5, 'getSubFilteredList')
    if(filterOptionDetails[filter]['isFilter']){
      if(isEmptyObject(filterOptionDetails[filter]['options'])) {
        filteredList = filteredList.filter((obj) => (
          obj[FIELD_MAPPING[filter]] === tempSelFilters[filter][id])) || []
      } else {
        filteredList = filteredList.filter((obj) => (
          obj[FIELD_MAPPING[filter]] === filterOptionDetails[filter]['options'][tempSelFilters[filter][id]])) || []
      }
    }
    return filteredList;
  }

  // Switch between search modes (full name, preferred name)
  const handleOnToggleSearchOptions = async(item) => {
    // console.log('BAR -', 6, 'handleOnToggleSearchOptions')

    const label = SEARCH_OPTIONS[item-1];
    setSearchOption(label);
    if(searchQuery != '') {
      handleSearchSortFilter({tempSearchMode: label});
    }   
  }

  // Switch between tabs
  // If user clicks on same tab, reset all search/sort/filter options
  const handleOnToggleViewMode = (mode) => {
    // console.log('BAR -', 7, 'handleOnToggleViewMode')

    if(mode!=viewMode) {
      setIsLoading(true);

      // Delete/Reset any sort options/filters that should not be applied to the current tab 
      // if(!isEmptyObject(SORT_OPTIONS)) {
      //   if(!SORT_OPTIONS[mode].includes(!isEmptyObject(selectedSort) ? selectedSort['option']['label'] : sortOptions[0]['label'])) {
      //     setSelectedSort({});
      //   }
      // }

      // for(var filter of Object.keys(dropdown['sel'])) {
      //   if(!FILTER_OPTIONS[mode].includes(filter)) {
      //     delete dropdown['sel'][filter];
      //     delete dropdown['tempSel'][filter];
      //     delete dropdown['filterOptions'][filter];
      //   }
      // }

      // for(var filter of Object.keys(selectedAutocompleteFilters)) {
      //   if(!FILTER_OPTIONS[mode].includes(filter)) {
      //     delete selectedAutocompleteFilters[filter];
      //   }
      // }

      // for(var filter of Object.keys(chip['sel'])) {
      //   if(!FILTER_OPTIONS[mode].includes(filter)) {
      //     delete chip['sel'][filter];
      //     delete chip['tempSel'][filter];
      //     delete chip['filterOptions'][filter];
      //   }
      // }
    }     
  }

  // Update search state and handle searching when user changes search query
  const handleSearch = (text) => {
    // console.log('BAR -', 8, 'handleSearch')

    setSearchQuery(text); 
    handleSearchSortFilter({'text': text})
  }

  return (
    <Center backgroundColor={colors.white_var1} zindex={1}> 
      {!isEmptyObject(VIEW_MODES) ? (
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
          SEARCH_OPTIONS={parseSelectOptions([...SEARCH_OPTIONS])}
          searchOption={SEARCH_OPTIONS.indexOf(searchOption)+1}
        />
        <View>
          <FilterModalCard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}

            SORT_OPTIONS={viewMode ? SORT_OPTIONS[viewMode] : SORT_OPTIONS}
            FILTER_OPTIONS={viewMode ? FILTER_OPTIONS[viewMode] : FILTER_OPTIONS}
            FIELD_MAPPING={FIELD_MAPPING}
            filterOptionDetails={filterOptionDetails}
            originalList={originalList}
            initializeData={initializeData}
            onInitialize={onInitialize}

            sort={sort}
            setSort={setSort}
            filters={filters}
            setFilters={setFilters}
            dropdown={dropdown}
            setDropdown={setDropdown}

            chip={chip}
            setChip={setChip}

            setSortOptions={setSortOptions}
            setAutocompleteFilterOptions={setAutocompleteFilterOptions}
            setDateFilterOptions={setDateFilterOptions}
            
            sortOptions={sortOptions}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
            tempSelectedSort={tempSelectedSort}
            setTempSelectedSort={setTempSelectedSort}
          
            autocompleteFilterOptions={autocompleteFilterOptions}
            selectedAutocompleteFilters={selectedAutocompleteFilters}
            setSelectedAutocompleteFilters={setSelectedAutocompleteFilters}
            tempSelectedAutocompleteFilters={tempSelectedAutocompleteFilters}
            setTempSelectedAutocompleteFilters={setTempSelectedAutocompleteFilters}

            dateFilterOptions={dateFilterOptions}
            selectedDateFilters={selectedDateFilters}
            setSelectedDateFilters={setSelectedDateFilters}
            tempSelectedDateFilters={tempSelectedDateFilters}
            setTempSelectedDateFilters={setTempSelectedDateFilters}

            handleSortFilter={handleSearchSortFilter}
          />
        </View>
      </View>
      <View
        style={[styles.optionsContainer, {paddingTop: 0}]}
      >
        {itemCount != null ? (
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

          sort={sort}
          setSort={setSort}
          filters={filters}
          setFilters={filters}

          dropdown={dropdown}
          chip={chip}

          sortOptions={sortOptions}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          
                    
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
  itemCount: {
    fontSize: 13.5,
    marginLeft: '2%',
    paddingVertical: '1%',
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default SearchFilterBar;
