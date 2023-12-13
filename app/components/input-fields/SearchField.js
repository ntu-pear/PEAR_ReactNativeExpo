// Libs
import React from 'react';

// Configurations
import colors from 'app/config/colors';
import { Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import InputField from './InputField';

function SearchField({
  value = null,
  onChangeText = () => {},
  onPressClear = () => {},
  style = null,
}) {

  return (
    <InputField
      showTitle={false}
      title="Search"
      value={value}
      onChangeText={onChangeText}
      InputLeftElement={
        <Icon
          as={<MaterialIcons name="search" />}
          size={5}
          ml="5"
          color={colors.black}
        />
      }
      InputRightElement={
        value ? (
        <Icon
          as={<MaterialIcons name="clear" />}
          size={5}
          mr="3"
          onPress={onPressClear}
        />
        ) : null
      }
      color={colors.light}
      borderRadius="10"
    />
  );
}

export default SearchField;
