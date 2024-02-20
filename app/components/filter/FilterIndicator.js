// Libs
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, Divider, HStack } from 'native-base';
import { StyleSheet, View } from 'react-native';


// Configurations
import colors from 'app/config/colors';

// Components
import { Chip } from 'react-native-elements';

function FilterIndicator({  
  modalVisible,
  setModalVisible,
  selectedSort={},
  setSelectedSort=()=>{},
  chipFilterOptions={},
  selectedChipFilters={},
  selectedDropdownFilters={},
  selectedAutocompleteFilters={},
  handleSortFilter=()=>{},
}) {

  // Toggle sort order (asc/desc) 
  const toggleSortOrder = () => {
    let tempSelSort = selectedSort;
    tempSelSort['asc'] = !tempSelSort['asc']
    setSelectedSort(tempSelSort);
    handleSortFilter({
      'tempSelSort': {...tempSelSort}, 
    });  
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
        {Object.keys(selectedSort).length > 0  ? (
          <Chip              
            title={"Sort by: " + selectedSort['option']['label']}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}} 
            onPress={toggleSortOrder}
            iconRight
            icon={{
              name: Object.keys(selectedSort).length > 0 
                ? selectedSort['asc']
                  ? 'long-arrow-up' 
                  : 'long-arrow-down'
                : 'long-arrow-up', 
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
            onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
            disabled={modalVisible == undefined} 
            disabledStyle={{backgroundColor: colors.green}}
            disabledTitleStyle={{color: colors.white_var1}}
            />
        ))}

        {Object.keys(selectedDropdownFilters).map((filter) => {
          if(selectedDropdownFilters[filter]['label'] != 'All') {
            return (
              <Chip
                key={filter}
                title={filter + ": " + selectedDropdownFilters[filter]['label']}
                type="solid"
                buttonStyle={{backgroundColor: colors.green}}
                containerStyle={{marginLeft: 5}}
                onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
                disabled={modalVisible == undefined} 
                disabledStyle={{backgroundColor: colors.green}}
                disabledTitleStyle={{color: colors.white_var1}}
              />
            )
          } else {
            return null;
          }})}

        {Object.keys(selectedAutocompleteFilters).map((filter) => (
          <Chip
            key={filter}
            title={filter + ": " + selectedAutocompleteFilters[filter]['title']}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}}
            containerStyle={{marginLeft: 5}}
            onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
            disabled={modalVisible == undefined} 
            disabledStyle={{backgroundColor: colors.green}}
            disabledTitleStyle={{color: colors.white_var1}}
          />
        ))}
      </View>
    </ScrollView>          
  );
}

export default FilterIndicator;
