// Libs
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, Divider, HStack } from 'native-base';
import { StyleSheet, View } from 'react-native';


// Configurations
import colors from 'app/config/colors';

// Components
import { Chip } from 'react-native-elements';

function FilterIndicator({
  selectedSort={},
  setSelectedSort=()=>{},
  SORT_OPTIONS=[],
  chipFilterOptions={},
  selectedChipFilters={},
  selectedDropdownFilters={},
  setSelectedDropdownFilters=()=>{},
  handleSortFilter=()=>{}
}) {

  // Toggle sort order (asc/desc) 
  const toggleSortOrder = () => {
    let tempSelSort = Object.keys(selectedSort).length > 0 ? selectedSort : {'option': SORT_OPTIONS[0], 'order': true};
    tempSelSort['order'] = !tempSelSort['order']
    setSelectedSort(tempSelSort);
    handleSortFilter(undefined, {...tempSelSort});
  }
  
  // Delete dropdown filter when user clicks on it
  const deleteDropdownFilter = (filter) => {
    let tempSelDropdownFilters = {...selectedDropdownFilters};
    delete tempSelDropdownFilters[filter];
    setSelectedDropdownFilters({...tempSelDropdownFilters});
    handleSortFilter(undefined, undefined, {...tempSelDropdownFilters});    
  }

  return (    
    <ScrollView
      horizontal={true}
      flex={1}
      showsHorizontalScrollIndicator={false}
    >
      <View
        style={{flexDirection: 'row'}}
      >
        {SORT_OPTIONS.length > 0 ? (
          <Chip              
            title={"Sort by: " + (Object.keys(selectedSort).length > 0 ? selectedSort['option']['label'] : SORT_OPTIONS[0]['label'])}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}} 
            onPress={toggleSortOrder}
            iconRight
            icon={{
              name: Object.keys(selectedSort).length > 0 
                ? selectedSort['order']
                  ? 'long-arrow-down' 
                  : 'long-arrow-up'
                : 'long-arrow-down', 
              type: "font-awesome",
              size: 13.5,
              color: 'white',
              }}
          />
        ) : null}
        
        {Object.keys(chipFilterOptions).map((filter) => (
          <Chip
            key={filter}
            title={filter + ": " + (Object.keys(selectedChipFilters).includes(filter) ? selectedChipFilters[filter]['label'] : chipFilterOptions[filter][0]['label'])}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}}
            containerStyle={{marginLeft: 5}}
            />
        ))}

        {Object.keys(selectedDropdownFilters).map((filter) => (
          <Chip
            key={filter}
            title={filter + ": " + selectedDropdownFilters[filter]['title']}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}}
            containerStyle={{marginLeft: 5}}
            // icon={{
            //   name: "close",
            //   type: "material",
            //   size: 20,
            //   color: "white",
            //   }}
            // iconRight
            // onPress={()=>deleteDropdownFilter(filter)}
          />
        ))}
      </View>
    </ScrollView>          
  );
}

export default FilterIndicator;
