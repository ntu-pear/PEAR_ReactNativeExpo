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
import { isEmptyObject, parseAutoCompleteOptions, parseSelectOptions, sortArray, sortFilterInitialState } from 'app/utility/miscFunctions';
import FilterIndicator from 'app/components/filter/FilterIndicator';
import TabBar from '../TabBar';

function SearchFilterBar({
  originalList={},
  setList=()=>{},
  setIsLoading=()=>{},

  initializeData=true,
  onInitialize=()=>{},

  applySortFilter,
  setApplySortFilter,

  itemCount=null,   
  handleSearchSortFilterCustom,
  
  VIEW_MODES={},
  viewMode=null,
  setViewMode=()=>{},
  
  FIELD_MAPPING={},

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
  
  SORT_OPTIONS={},
  
  FILTER_OPTIONS={},
  filterOptionDetails={},
  
  SEARCH_OPTIONS=[],
  searchOption='',
  setSearchOption,
  searchQuery='',
  setSearchQuery,
}) {  
  // Default state to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearchSortFilter = ({
    text=searchQuery, 
    tempSelSort=sort['tempSel'], 
    tempSelDropdownFilters=dropdown['tempSel'],
    tempSelChipFilters=chip['tempSel'], 
    tempSelAutocompleteFilters=autocomplete['tempSel'], 
    tempSelDateFilters=date['tempSel'], 
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
        tempSelDateFilters: tempSelDateFilters,
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
        tempSelDateFilters: tempSelDateFilters,
        tempSearchMode: tempSearchMode,
      })
      setIsLoading(false);
    }
  }
  
  // Update list based on search, sort, and filter criteria
  const setFilteredList = ({
    text=searchQuery, 
    tempSelSort=sort['tempSel'], 
    tempSelDropdownFilters=dropdown['tempSel'],
    tempSelChipFilters=chip['tempSel'], 
    tempSelAutocompleteFilters=autocomplete['tempSel'], 
    tempSelDateFilters=date['tempSel'], 
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
          sort['filterOptions'][0]['label'] : 
          tempSelSort['option']['label']],
        tempSelSort['asc'] != null ? tempSelSort['asc'] : true);
    }
  
    // Dropdown filters
    for (var filter in dropdown['tempSel']) {   
      if(tempSelDropdownFilters[filter]['label'] != 'All') {
        filteredList = getSubFilteredList(filteredList, filter, 'label', tempSelDropdownFilters);
      }      
    }

    // Autocomplete filters
    for (var filter in tempSelAutocompleteFilters) {
      if(tempSelAutocompleteFilters[filter]['title'] != 'All') {
        filteredList = getSubFilteredList(filteredList, filter, 'title', tempSelAutocompleteFilters);
      }      
    }

    // Chip Filters
    for (var filter in tempSelChipFilters) {
      filteredList = getSubFilteredList(filteredList, filter, 'label', tempSelChipFilters);
    }  

    // Date filters
    for (var filter in tempSelDateFilters) {
      if('min' in tempSelDateFilters[filter] && tempSelDateFilters[filter]['min'] != null) {
        filteredList = filteredList.filter((obj) => (
          new Date(obj[FIELD_MAPPING[filter]]) >= tempSelDateFilters[filter]['min'])) || []
      }
      if('max' in tempSelDateFilters[filter] && tempSelDateFilters[filter]['max'] != null) {
        filteredList = filteredList.filter((obj) => (
          new Date (obj[FIELD_MAPPING[filter]]) <= tempSelDateFilters[filter]['max'])) || []
      }
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

            applySortFilter={applySortFilter}
            setApplySortFilter={setApplySortFilter}
            
            sort={sort}
            setSort={setSort}
            
            dropdown={dropdown}
            setDropdown={setDropdown}
            
            chip={chip}
            setChip={setChip}

            autocomplete={autocomplete}
            setAutocomplete={setAutocomplete}

            
            date={date}
            setDate={setDate}

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
          dropdown={dropdown}
          chip={chip}
          autocomplete={autocomplete}
          date={date}
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
