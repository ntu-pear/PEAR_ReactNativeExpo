// Libs
import React from 'react';

// Configurations
import colors from 'app/config/colors';
import { Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import InputField from './InputField';
import { SearchBar as Search} from 'react-native-elements';
import { Keyboard } from 'react-native';

function SearchBar({
  placeholder="Search",
  value = null,
  onChangeText = () => {},
  containerStyle = null,
  inputContainerStyle = null,
  style = null,
  autoCapitalize='none'
}) {
  return (
    <Search
      placeholder={placeholder}
      onChangeText={onChangeText}
      onClear={Keyboard.dismiss}
      value={value}
      lightTheme={true}
      containerStyle={[styles.containerStyle, containerStyle]}
      inputContainerStyle={[styles.inputContainerStyle, inputContainerStyle]}
      inputStyle={styles.inputStyle}
      style={style}
      autoCapitalize={autoCapitalize}
    />
  );
}

const styles = {
  containerStyle: {
    width: '100%',
    padding: 0,
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  inputContainerStyle: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  inputStyle: { 
    fontSize: 16,
  }
}

export default SearchBar;
