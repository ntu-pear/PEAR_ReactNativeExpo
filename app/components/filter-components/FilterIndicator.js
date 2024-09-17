// Libs
import React from 'react';
import { ScrollView } from 'native-base';
import { View } from 'react-native';
import { Chip } from 'react-native-elements';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate, formatTimeAMPM, formatTimeHM24 } from 'app/utility/miscFunctions';

function FilterIndicator({  
  testID='',
  modalVisible,
  setModalVisible,
  filterOptionDetails,

  sort={},
  setSort=()=>{},
  dropdown={},
  chip={},
  autocomplete={},
  datetime={},
  
  handleSortFilter=()=>{},
}) {

  // Toggle sort order (asc/desc) 
  const toggleSortOrder = () => {
    // console.log('IND -', 1, 'toggleSortOrder')

    let tempSelSort = sort['sel'];
    tempSelSort['asc'] = !tempSelSort['asc']
    setSort(prevState => ({
      ...prevState,
      'sel': {...tempSelSort},
      'tempSel': {...tempSelSort}
    }))

    handleSortFilter({
      'tempSelSort': {...tempSelSort}, 
    });  
  }

  return (    
    <ScrollView
      testID={testID}
      horizontal={true}
      flex={1}
      showsHorizontalScrollIndicator={true}
    >
      <View
        style={{flexDirection: 'row', alignItems: 'center'}}
      >
        {sort['filterOptions'].length > 0 ? (
          <Chip  
            testID={`${testID}_sort_${sort['sel']['option']['label']}`}             
            title={"Sort by: " + (sort['sel']['option']['label'])}
            type="solid"
            buttonStyle={{backgroundColor: colors.green}} 
            onPress={toggleSortOrder}
            iconRight
            icon={{
              name: sort['sel']['asc']
                  ? 'long-arrow-up' 
                  : 'long-arrow-down',
              type: "font-awesome",
              size: 13.5,
              color: 'white',
              }}
          />
        ) : null}
        
        {Object.keys(chip['filterOptions']).map((filter) => (
          <Chip
            testID={`${testID}_chip_${chip['sel'][filter]['label']}`}
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

        {Object.keys(dropdown['sel']).map((filter) => {
          if(dropdown['sel'][filter]['label'] != 'All') {
            return (
              <Chip
                testID={`${testID}_dropdown_${dropdown['sel'][filter]['label']}`}
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
          }})
        }

        {Object.keys(autocomplete['sel']).map((filter) => {
          if(autocomplete['sel'][filter]['title'] != 'All') {
            return (
              <Chip
                testID={`${testID}_autocomplete_${autocomplete['sel'][filter]['title']}`}
                key={filter}
                title={filter + ": " + autocomplete['sel'][filter]['title']}
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
          }})
        }

        {Object.keys(datetime['sel']).map((filter) => (
          <View key={filter} style={{flexDirection: 'row'}}>
            {datetime['sel'][filter]['min'] 
              && datetime['sel'][filter]['min'] != null 
              && datetime['sel'][filter]['min'] != filterOptionDetails[filter]['options']['min']['default'] ? (
              <Chip
                testID={`${testID}_datetime_min_${datetime['sel'][filter]}`}
                title={filter + " (from): " + (filterOptionDetails[filter]['type'] == 'date' 
                ? formatDate(datetime['sel'][filter]['min'], true)
                : formatTimeAMPM(datetime['sel'][filter]['min']))}
                type="solid"
                buttonStyle={{backgroundColor: colors.green}}
                containerStyle={{marginLeft: 5}}
                onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
                disabled={modalVisible == undefined} 
                disabledStyle={{backgroundColor: colors.green}}
                disabledTitleStyle={{color: colors.white_var1}}
              />
            ) : null}
            {datetime['sel'][filter]['max'] 
              && datetime['sel'][filter]['max'] != null 
              && datetime['sel'][filter]['max'] != filterOptionDetails[filter]['options']['max']['default'] ? (
              <Chip
                testID={`${testID}_datetime_max_${datetime['sel'][filter]}`}
                title={filter + " (to): " + (filterOptionDetails[filter]['type'] == 'date' 
                  ? formatDate(datetime['sel'][filter]['max'], true)
                  : formatTimeAMPM(datetime['sel'][filter]['max']))}
                type="solid"
                buttonStyle={{backgroundColor: colors.green}}
                containerStyle={{marginLeft: 5}}
                onPress={modalVisible != undefined ? () => setModalVisible(true) : () => {}}
                disabled={modalVisible == undefined} 
                disabledStyle={{backgroundColor: colors.green}}
                disabledTitleStyle={{color: colors.white_var1}}
              />
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>          
  );
}

export default FilterIndicator;
