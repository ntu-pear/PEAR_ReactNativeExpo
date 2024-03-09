// Libs
import React from 'react';
import { ScrollView } from 'native-base';
import { View } from 'react-native';
import { Chip } from 'react-native-elements';

// Configurations
import colors from 'app/config/colors';
import { isEmptyObject } from 'app/utility/miscFunctions';

function FilterIndicator({  
  modalVisible,
  setModalVisible,

  sort,
  setSort,
  filters,
  setFilters,
  dropdown={},
  chip={},
  
  sortOptions={},
  selectedSort={},
  setSelectedSort=()=>{},
  selectedAutocompleteFilters={},
  handleSortFilter=()=>{},
}) {

  // Toggle sort order (asc/desc) 
  const toggleSortOrder = () => {
    // console.log('IND -', 1, 'toggleSortOrder')

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
        {!isEmptyObject(sortOptions) ? (
          <Chip              
            title={"Sort by: " + (!isEmptyObject(selectedSort) ? selectedSort['option']['label'] : sortOptions[0]['label'])}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}} 
            onPress={toggleSortOrder}
            iconRight
            icon={{
              name: !isEmptyObject(selectedSort) 
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
        
        {Object.keys(chip['filterOptions']).map((filter) => (
          <Chip
            key={filter}
            title={filter + ": " + (chip['sel'][filter]['label'])}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}}
            containerStyle={{marginLeft: 5}}
            onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
            disabled={modalVisible == undefined} 
            disabledStyle={{backgroundColor: colors.green}}
            disabledTitleStyle={{color: colors.white_var1}}
            />
        ))}

        {!isEmptyObject(dropdown) && Object.keys(dropdown['sel']).map((filter) => {
          if(dropdown['sel'][filter]['label'] != 'All') {
            return (
              <Chip
                key={filter}
                title={filter + ": " + dropdown['sel'][filter]['label']}
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
