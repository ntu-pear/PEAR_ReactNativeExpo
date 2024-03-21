// Libs
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

function DisplayModeComponent({ 
  ICON_MAPPING={'list': 'format-list-bulleted', 'table': 'grid-on', 'rows': 'view-list', 'grid': 'grid-view'},
  DISPLAY_MODES=[],
  displayMode,
  setDisplayMode,
 }) {
  
  const handleToggleDisplayMode = () => {
    setDisplayMode(DISPLAY_MODES[(DISPLAY_MODES.indexOf(displayMode)+1)%(DISPLAY_MODES.length)])
  }
  return (
    <TouchableOpacity 
        onPress={handleToggleDisplayMode}
        style={{alignItems: 'center', justifyContent: 'center', width: 45}}
        >
        <Icon 
          as={
            <MaterialIcons 
            name={ICON_MAPPING[displayMode]} 
            />
          } 
          size={displayMode == 'table' || displayMode == 'grid' ? 10 : displayMode=='rows' ? 12  : 10 }
          color={colors.green}
        >
        </Icon>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
});

export default DisplayModeComponent;
