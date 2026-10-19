// Libs
import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { VStack, Input, Icon } from 'native-base';
import PropTypes from 'prop-types';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Utils
import * as validation from 'app/utility/inputValidation';

// Components
import { TextInput } from 'react-native';
import InputField from 'app/components/input-components/InputField';
import { MaterialIcons } from '@expo/vector-icons';

function SensitiveInputField({
  testID = '',
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
  variant = 'singleLine',
  initiallyVisible = false,
}) {
  const [show, setShow] = useState(initiallyVisible);

  const handleVisibilityToggle = () => {
    setShow(!show);
  };

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        <InputField
          testID={testID}
          isRequired={isRequired}
          autoCapitalize={autoCapitalize}
          hideError={hideError}
          showTitle={showTitle}
          title={title}
          value={value}
          onChangeText={onChangeText}
          InputLeftElement={InputLeftElement}
          InputRightElement={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide password' : 'Show password'}
              onPress={handleVisibilityToggle}
              style={{
                minWidth: 48,
                minHeight: 48,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon
                as={
                  <MaterialIcons
                    testID={`${testID}_mask`}
                    name={show ? 'visibility' : 'visibility-off'}
                  />
                }
                color={colors.black}
                mr="0"
                size={5}
              />
            </TouchableOpacity>
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
  dataType: PropTypes.oneOf([
    'general',
    'password',
    'name',
    'nric',
    'home phone',
    'mobile phone',
    'email',
  ]),
  keyboardType: TextInput.propTypes.keyboardType,
  variant: PropTypes.oneOf(['singleLine', 'multiLine']),
};

const styles = StyleSheet.create({
  ComponentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 0,
    justifyContent: 'flex-start',
  },
});

export default SensitiveInputField;
