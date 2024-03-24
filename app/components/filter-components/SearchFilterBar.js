// Libs
import { useState } from 'react';
import { Center, Divider } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import SearchBar from 'app/components/input-components/SearchBar';
import FilterModalCard from 'app/components/filter-components/FilterModalCard';
import FilterIndicator from 'app/components/filter-components/FilterIndicator';
import TabBar from '../TabBar';

// Utilities
import { isEmptyObject, parseSelectOptions, setSecondsToZero, sortArray, filterInitialState, sortInitialState } from 'app/utility/miscFunctions';
import DisplayModeComponent from './DisplayModeComponent';

function SearchFilterBar({
  testID='',
  originalList=[],
  setList=()=>{},
  setIsLoading=()=>{},

  initializeData=true,
  onInitialize=()=>{},

  applySortFilter=true,
  setApplySortFilter=()=>{},

  itemCount=null,   
  handleSearchSortFilterCustom,
  
  VIEW_MODES={},
  viewMode=null,
  setViewMode=()=>{},
  
  FIELD_MAPPING={},

  sort=sortInitialState,
  setSort=()=>{},

  dropdown=filterInitialState,
  setDropdown=()=>{},

  chip=filterInitialState,
  setChip=()=>{},
  
  autocomplete=filterInitialState,
  setAutocomplete=()=>{},

  datetime=filterInitialState,
  setDatetime=()=>{},
  
  SORT_OPTIONS={},
  
  FILTER_OPTIONS={},
  filterOptionDetails={},
  
  SEARCH_OPTIONS=[],
  searchOption=SEARCH_OPTIONS.length == 1 ? SEARCH_OPTIONS[0] : '',
  setSearchOption,
  searchQuery='',
  setSearchQuery,

  itemType='patients',

  displayMode='',
  setDisplayMode=()=>{},
  DISPLAY_MODES=[],
  hideIndicator=false,
  hideSearchBar=false,
}) {  
  // Default state to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearchSortFilter = ({
    text=searchQuery, 
    tempSelSort=sort['tempSel'], 
    tempSelDropdownFilters=dropdown['tempSel'],
    tempSelChipFilters=chip['tempSel'], 
    tempSelAutocompleteFilters=autocomplete['tempSel'], 
    tempSelDatetimeFilters=datetime['tempSel'], 
    tempSearchMode=searchOption,
  }) => {
    console.log('BAR 1 - handleSearchSortFilter')

    if(handleSearchSortFilterCustom) {
      handleSearchSortFilterCustom({
        text: text, 
        tempSelSort: tempSelSort, 
        tempSelDropdownFilters: tempSelDropdownFilters,
        tempSelChipFilters: tempSelChipFilters, 
        tempSelAutocompleteFilters: tempSelAutocompleteFilters, 
        tempSelDatetimeFilters: tempSelDatetimeFilters,
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
        tempSelDatetimeFilters: tempSelDatetimeFilters,
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
    tempSelDatetimeFilters=datetime['tempSel'], 
    tempSearchMode=searchOption,
  }) => {
    console.log('BAR 2 - setFilteredList')
    
    let filteredList = [...originalList];

    // Search
    if(!hideSearchBar) {
      filteredList = filteredList.filter((item) => {
        return item[FIELD_MAPPING[tempSearchMode]].toLowerCase().includes(text.toLowerCase());
      })
    }
  
    // Sort
    if(!isEmptyObject(SORT_OPTIONS)) {
      filteredList = sortArray(filteredList, 
        FIELD_MAPPING[isEmptyObject(tempSelSort) ? 
          sort['filterOptions'][0]['label'] : 
          tempSelSort['option']['label']],
        tempSelSort['asc'] != null ? tempSelSort['asc'] : true);
    }
    
    // Dropdown filters
    for (var filter in tempSelDropdownFilters) {   
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
    
    // Datetime filters
    for (var filter in tempSelDatetimeFilters) {
      filteredList = getDatetimeFilteredList(filteredList, filter, tempSelDatetimeFilters);
    }  

    setList(filteredList);
  }  
  
  // Filter list by datetime filter
  const getDatetimeFilteredList = (filteredList, filter, tempSelDatetimeFilters) => {
    const datetimeFilterTypes = ['min', 'max']
    if(filterOptionDetails[filter]['isFilter']) {
      for(var i = 0; i<datetimeFilterTypes.length; i++) {
        const datetimeFilterType = datetimeFilterTypes[i];
        if(datetimeFilterType in tempSelDatetimeFilters[filter] && tempSelDatetimeFilters[filter][datetimeFilterType] != null) {          
          const datetimeType = filterOptionDetails[filter]['type'];
          let selectedDatetime = null;
          if(datetimeType == 'date') {
            selectedDatetime = new Date(tempSelDatetimeFilters[filter][datetimeFilterType].setHours(0,0,0));
          } else if(datetimeType == 'time') {
            selectedDatetime = setSecondsToZero(new Date(tempSelDatetimeFilters[filter][datetimeFilterType]));
          }
          filteredList = filterByDatetime(filteredList, filter, datetimeFilterType, selectedDatetime);
        }
      }
    } else if (filterOptionDetails[filter]['nestedFilter'] != undefined && filterOptionDetails[filter]['nestedFilter'].length > 0) {
      const key = filterOptionDetails[filter]['nestedFilter'];   
      const fieldKey = FIELD_MAPPING[filter];
      const tempFilteredList = [];

      filteredList.forEach((item) => {
        const keyItems = [];
        item[key].forEach((itemObj) => {
          let filterPass = true;
          const datetimeType = filterOptionDetails[filter]['type'];
          if('min' in tempSelDatetimeFilters[filter] && tempSelDatetimeFilters[filter]['min'] != null) {
            let selectedDatetime = null;
            if(datetimeType == 'date') {
              selectedDatetime = new Date(tempSelDatetimeFilters[filter]['min'].setHours(0,0,0));
            } else if(datetimeType == 'time') {
              selectedDatetime = setSecondsToZero(new Date(tempSelDatetimeFilters[filter]['min']));
            }
            if(new Date(itemObj[fieldKey]) < selectedDatetime) {
              filterPass = false;
            }
          }
          if('max' in tempSelDatetimeFilters[filter] && tempSelDatetimeFilters[filter]['max'] != null) {
            let selectedDatetime = null;
            if(datetimeType == 'date') {
              selectedDatetime = new Date(tempSelDatetimeFilters[filter]['max'].setHours(0,0,0));
            } else if(datetimeType == 'time') {
              selectedDatetime = setSecondsToZero(new Date(tempSelDatetimeFilters[filter]['max']));
            }
            if(new Date(itemObj[fieldKey]) > selectedDatetime) {
              filterPass = false;
            }
          }
          if(filterPass) {
            keyItems.push({...itemObj});
          }
        });

        tempFilteredList.push({
          ...item,
          activities: keyItems,
        });
      });

      filteredList = tempFilteredList;
    }
    return filteredList
  }

  // Filter list by specific min/max date filter option
  const filterByDatetime = (filteredList, filter, datetimeFilterType, selectedDatetime) => {    
    const fieldKey = FIELD_MAPPING[filter];

    if(datetimeFilterType == 'min') {
      filteredList = filteredList.filter((obj) => (
        new Date(obj[fieldKey]) >= selectedDatetime)) || []
    } else if(datetimeFilterType == 'max') {
      filteredList = filteredList.filter((obj) => (
        new Date(obj[fieldKey]) <= selectedDatetime)) || []      
    }

    return filteredList;    
  }
      
  // Apply filters
  // Only filter if required (isFilter is true)
  // For example, patient status is not meant for filtering - it requires new API call, so do not filter
  // Use custom options if declared in FILTER_MAPPING 
  const getSubFilteredList = (filteredList, filter, id, tempSelFilters) => {
    console.log('BAR 3 - getSubFilteredList')
    if(filterOptionDetails[filter]['isFilter']){
      const fieldKey = FIELD_MAPPING[filter];
      if(isEmptyObject(filterOptionDetails[filter]['options'])) {
        filteredList = filteredList.filter((obj) => (
          obj[fieldKey] === tempSelFilters[filter][id])) || []
      } else {
        filteredList = filteredList.filter((obj) => (
          obj[fieldKey] === filterOptionDetails[filter]['options'][tempSelFilters[filter][id]])) || []        
      }
    } else if (filterOptionDetails[filter]['nestedFilter'] != undefined && filterOptionDetails[filter]['nestedFilter'].length > 0 ) {
      filteredList = getNestedSubFilteredList(filteredList, filter, id, tempSelFilters);
    }
    return filteredList;
  }

  // If list to be filtered is nested in a larger array of objects  
  // E.g.: [{a: [{b: [{c: 1, d: 2, e: 3}]}]}] => want to filter array corresponding to b by property c
  // i.e. filter [{c: 1, d: 2, e: 3}]
  const getNestedSubFilteredList = (filteredList, filter, id, tempSelFilters) => {
    console.log('BAR 4 - getNestedSubfilteredList')

    const key = filterOptionDetails[filter]['nestedFilter'];      
    const tempFilteredList = [];
    filteredList.forEach((item) => {
      const keyItems = [];
      item[key].forEach((itemObj) => {
        const fieldKey = FIELD_MAPPING[filter];
        if(isEmptyObject(filterOptionDetails[filter]['options'])) {
          if (itemObj[fieldKey] == tempSelFilters[filter][id]) { 
            keyItems.push({...itemObj});
          }
        } else {
          if (itemObj[fieldKey] == filterOptionDetails[filter]['options'][tempSelFilters[filter][id]]) { 
            keyItems.push({...itemObj});
          }
        }
      });

      tempFilteredList.push({
        ...item,
        activities: keyItems,
      });
    });

    return tempFilteredList;
  }

  // Switch between search modes (full name, preferred name)
  const handleOnToggleSearchOptions = async(item) => {
    console.log('BAR 5 - handleOnToggleSearchOptions')

    const label = SEARCH_OPTIONS[item-1];
    setSearchOption(label);
    if(searchQuery != '') {
      handleSearchSortFilter({tempSearchMode: label});
    }   
  }

  // Switch between tabs
  // If user clicks on same tab, reset all search/sort/filter options
  const handleOnToggleViewMode = (mode) => {
    console.log('BAR 6 - handleOnToggleViewMode')

    if(mode!=viewMode) {
      setIsLoading(true);
    }     
  }

  // Update search state and handle searching when user changes search query
  const handleSearch = (text) => {
    console.log('BAR 7 - handleSearch')

    setSearchQuery(text); 
    handleSearchSortFilter({'text': text})
  }

  const filterComponent = () => {
    return (
      <FilterModalCard
        testID={`${testID}_filter`}
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
        
        datetime={datetime}
        setDatetime={setDatetime}

        handleSortFilter={handleSearchSortFilter}
      />
    )
  }

  const countComponent = () => {
    return (
      itemCount != null ? (
        <View style={styles.itemCount} testID={`${testID}_count`}>
          <Text>No. of {itemType}: {itemCount}</Text>
        </View>
      ) : null
    )
  }

  const displayModeComponent = () => {
    return (
      displayMode != '' ? (
        <View style={{justifyContent: 'center'}}>
          <DisplayModeComponent
            testID={`${testID}_displayMode`}
            DISPLAY_MODES={DISPLAY_MODES}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
          />
        </View>
      ) : null
    )
  }

  const searchBarComponent = () => {
    return (
      <SearchBar 
        testID={`${testID}_search`}
        onChangeText={handleSearch}
        value={searchQuery}
        autoCapitalize='characters'
        inputContainerStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 47}}
        handleOnToggleSearchOptions={handleOnToggleSearchOptions}
        SEARCH_OPTIONS={parseSelectOptions([...SEARCH_OPTIONS])}
        searchOption={SEARCH_OPTIONS.indexOf(searchOption)+1}
        placeholder={SEARCH_OPTIONS.length > 1 ? 'Search' : `Search by ${searchOption}`}
      />
    )
  }

  const tabBarComponent = () => {
    return (
      <TabBar
        testID={`${testID}_tabBar`}
        TABS={VIEW_MODES}
        curTab={viewMode}
        setCurTab={setViewMode}
        handleSwitchTab={handleOnToggleViewMode}
      />
    )
  }

  const verticalDividerComponent = () => {
    return (
      <Divider 
        orientation='vertical' 
        marginHorizontal='2%'
        height={'60%'} 
        alignSelf={'center'}
      />
    )
  }

  return (
    <Center testID={testID} backgroundColor={colors.white_var1} zindex={1}> 
      {!isEmptyObject(VIEW_MODES) ? (
        <>
          {tabBarComponent()}
          <Divider />
        </>
      ) : null}
        {hideSearchBar ? (
          <View flexDirection='row' style={{alignItems: 'center', justifyContent: 'space-between', width: '100%'}} >
            {countComponent()}
            {hideIndicator ? null : (
            <View style={{justifyContent: 'center', flex: 1, marginTop: 2, flexDirection: 'row'}}>
              <FilterIndicator
                testID={`${testID}_indicator`}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                filterOptionDetails={filterOptionDetails}
                sort={sort}
                setSort={setSort}
                dropdown={dropdown}
                chip={chip}
                autocomplete={autocomplete}
                datetime={datetime}
                handleSortFilter={handleSearchSortFilter}
              />
            </View>
          )}
            {verticalDividerComponent()}
            {filterComponent()}
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {searchBarComponent()}
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              {filterComponent()}      
              {displayModeComponent()}              
            </View>
          </View>
        )}
      {hideSearchBar ? null : (
        <View
        style={[styles.optionsContainer, {paddingTop: 0}]}
      >
        {countComponent()}
        {verticalDividerComponent()}
        {hideIndicator ? null : (
      <View style={{justifyContent: 'center', flex: 1, marginTop: 2, flexDirection: 'row'}}>
        <FilterIndicator
          testID={`${testID}_indicator`}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          filterOptionDetails={filterOptionDetails}
          sort={sort}
          setSort={setSort}
          dropdown={dropdown}
          chip={chip}
          autocomplete={autocomplete}
          datetime={datetime}
          handleSortFilter={handleSearchSortFilter}
        />
      </View>
    )}
      </View>
      )}      
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
    paddingVertical: '1.5%',
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default SearchFilterBar;
