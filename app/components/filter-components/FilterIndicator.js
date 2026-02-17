// Libs
import React from 'react';
import { ScrollView } from 'native-base';
import { View } from 'react-native';
import { Chip } from 'react-native-elements';

// Configurations
import colors from 'app/config/colors';

// Utilities
import {
  formatDate,
  formatTimeAMPM,
  formatTimeHM24,
} from 'app/utility/miscFunctions';

function FilterIndicator({
  testID = '',
  modalVisible,
  setModalVisible,
  filterOptionDetails,

  sort = {},
  setSort = () => {},
  dropdown = {},
  chip = {},
  setChip = () => {},
  autocomplete = {},
  datetime = {},

  handleSortFilter = () => {},
}) {
  // Cycle chip values for quick toggle (Active -> Inactive -> All)
  const handleChipPress = (filter) => {
    try {
      const options = chip['filterOptions'][filter] || [];
      if (!options.length) return;

      const current = chip['sel'] && chip['sel'][filter] ? chip['sel'][filter] : options[0];
      const idx = options.findIndex((o) => o.label === current.label);
      const next = options[(idx + 1) % options.length];

      // Update both selected and temp selected so UI and filtering apply immediately
      setChip((prev) => ({
        ...prev,
        sel: { ...(prev.sel || {}), [filter]: next },
        tempSel: { ...(prev.tempSel || {}), [filter]: next },
      }));

      // Call filter handler with updated chip temp selection
      const tempSelChipFilters = { ...(chip['tempSel'] || {}), [filter]: next };
      handleSortFilter({ tempSelChipFilters });
    } catch (e) {
      // ignore
    }
  };
  // Toggle sort order (asc/desc)
  const toggleSortOrder = () => {
    // console.log('IND -', 1, 'toggleSortOrder')

    let tempSelSort = sort['sel'];
    tempSelSort['asc'] = !tempSelSort['asc'];
    setSort((prevState) => ({
      ...prevState,
      sel: { ...tempSelSort },
      tempSel: { ...tempSelSort },
    }));

    handleSortFilter({
      tempSelSort: { ...tempSelSort },
    });
  };

  return (
    <ScrollView
      testID={testID}
      horizontal={true}
      flex={1}
      showsHorizontalScrollIndicator={true}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {sort['filterOptions'].length > 0 ? (
          <Chip
            testID={`${testID}_sort_${sort['sel']['option']['label']}`}
            title={'Sort by: ' + sort['sel']['option']['label']}
            type="solid"
            buttonStyle={{ backgroundColor: colors.green }}
            onPress={toggleSortOrder}
            iconRight
            icon={{
              name: sort['sel']['asc'] ? 'long-arrow-up' : 'long-arrow-down',
              type: 'font-awesome',
              size: 13.5,
              color: colors.white,
            }}
          />
        ) : null}

        {Object.keys(chip['filterOptions']).map((filter) => (
          <Chip
            testID={`${testID}_chip_${chip['sel'][filter]['label']}`}
            key={filter}
            title={filter + ': ' + chip['sel'][filter]['label']}
            type="solid"
            buttonStyle={{ backgroundColor: colors.green }}
            containerStyle={{ marginLeft: 5 }}
            onPress={
              // If this filter is a chip and isFilter=true and setChip is available,
              // cycle through options on tap. Otherwise open modal.
              filterOptionDetails &&
              filterOptionDetails[filter] &&
              filterOptionDetails[filter]['type'] === 'chip' &&
              filterOptionDetails[filter]['isFilter'] &&
              setChip
                ? () => handleChipPress(filter)
                : modalVisible != undefined
                ? () => setModalVisible(true)
                : () => {}
            }
            disabled={modalVisible == undefined}
            disabledStyle={{ backgroundColor: colors.green }}
            disabledTitleStyle={{ color: colors.white }}
          />
        ))}

        {Object.keys(dropdown['sel']).map((filter) => {
          if (dropdown['sel'][filter]['label'] != 'All') {
            return (
              <Chip
                testID={`${testID}_dropdown_${dropdown['sel'][filter]['label']}`}
                key={filter}
                title={filter + ': ' + dropdown['sel'][filter]['label']}
                type="solid"
                buttonStyle={{ backgroundColor: colors.green }}
                containerStyle={{ marginLeft: 5 }}
                onPress={
                  modalVisible != undefined
                    ? () => setModalVisible(true)
                    : () => {}
                }
                disabled={modalVisible == undefined}
                disabledStyle={{ backgroundColor: colors.green }}
                disabledTitleStyle={{ color: colors.white }}
              />
            );
          } else {
            return null;
          }
        })}

        {Object.keys(autocomplete['sel']).map((filter) => {
          if (autocomplete['sel'][filter]['title'] != 'All') {
            return (
              <Chip
                testID={`${testID}_autocomplete_${autocomplete['sel'][filter]['title']}`}
                key={filter}
                title={filter + ': ' + autocomplete['sel'][filter]['title']}
                type="solid"
                buttonStyle={{ backgroundColor: colors.green }}
                containerStyle={{ marginLeft: 5 }}
                onPress={
                  modalVisible != undefined
                    ? () => setModalVisible(true)
                    : () => {}
                }
                disabled={modalVisible == undefined}
                disabledStyle={{ backgroundColor: colors.green }}
                disabledTitleStyle={{ color: colors.white }}
              />
            );
          } else {
            return null;
          }
        })}

        {Object.keys(datetime['sel']).map((filter) => (
          <View key={filter} style={{ flexDirection: 'row' }}>
            {datetime['sel'][filter]['min'] &&
            datetime['sel'][filter]['min'] != null &&
            datetime['sel'][filter]['min'] !=
              filterOptionDetails[filter]['options']['min']['default'] ? (
              <Chip
                testID={`${testID}_datetime_min_${datetime['sel'][filter]}`}
                title={
                  filter +
                  ' (from): ' +
                  (filterOptionDetails[filter]['type'] == 'date'
                    ? formatDate(datetime['sel'][filter]['min'], true)
                    : formatTimeAMPM(datetime['sel'][filter]['min']))
                }
                type="solid"
                buttonStyle={{ backgroundColor: colors.green }}
                containerStyle={{ marginLeft: 5 }}
                onPress={
                  modalVisible != undefined
                    ? () => setModalVisible(true)
                    : () => {}
                }
                disabled={modalVisible == undefined}
                disabledStyle={{ backgroundColor: colors.green }}
                disabledTitleStyle={{ color: colors.white }}
              />
            ) : null}
            {datetime['sel'][filter]['max'] &&
            datetime['sel'][filter]['max'] != null &&
            datetime['sel'][filter]['max'] !=
              filterOptionDetails[filter]['options']['max']['default'] ? (
              <Chip
                testID={`${testID}_datetime_max_${datetime['sel'][filter]}`}
                title={
                  filter +
                  ' (to): ' +
                  (filterOptionDetails[filter]['type'] == 'date'
                    ? formatDate(datetime['sel'][filter]['max'], true)
                    : formatTimeAMPM(datetime['sel'][filter]['max']))
                }
                type="solid"
                buttonStyle={{ backgroundColor: colors.green }}
                containerStyle={{ marginLeft: 5 }}
                onPress={
                  modalVisible != undefined
                    ? () => setModalVisible(true)
                    : () => {}
                }
                disabled={modalVisible == undefined}
                disabledStyle={{ backgroundColor: colors.green }}
                disabledTitleStyle={{ color: colors.white }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default FilterIndicator;
