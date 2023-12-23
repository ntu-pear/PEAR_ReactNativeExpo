// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Input, Icon } from 'native-base';
import PropTypes from 'prop-types';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Utils
import * as validation from 'app/utility/InputValidation'

// Components
import { TextInput } from 'react-native';
import InputField from './InputField';
import { MaterialIcons } from '@expo/vector-icons';

function SensitiveInputField({
  isRequired = false,
  autoCapitalize = 'none',
  hideError = true,
  showTitle = true,
  title = '',
  value = '',
  onChangeText = () => {},
  InputLeftElement = () => {},
  dataType = 'general',
  keyboardType = 'default',
  maxLength = null,
  onEndEditing = () => {},
  variant = 'singleLine'
}) { 
  const [show, setShow] = useState(false);

  const handleVisibilityToggle = () => {
    setShow(!show);
  }

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
      <InputField
        isRequired={isRequired}
        autoCapitalize={autoCapitalize}
        hideError={hideError}
        showTitle={showTitle}
        title={title}
        value={value}
        onChangeText={onChangeText}
        InputLeftElement={InputLeftElement}
        InputRightElement={
          <Icon
          as={
              <MaterialIcons
              name={show ? 'visibility' : 'visibility-off'}
              />
            }
            color={colors.black}
            mr="5"
            onPress={handleVisibilityToggle}
            size={5}
            />
          }
        dataType={dataType}
        type={show ? 'text' : 'password'}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onEndEditing={onEndEditing}
        variant={variant}
        />
      </VStack>
    </View>
  );
}

SensitiveInputField.propTypes = {
  dataType: PropTypes.oneOf(['general', 'password', 'name', 'nric', 'home phone', 'mobile phone', 'email']),
  keyboardType: TextInput.propTypes.keyboardType,
  variant: PropTypes.oneOf(['singleLine', 'multiLine'])
};

const styles = StyleSheet.create({
  ComponentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
});

export default SensitiveInputField;
