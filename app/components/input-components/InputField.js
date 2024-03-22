// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Input } from 'native-base';
import PropTypes from 'prop-types';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Utils
import * as validation from 'app/utility/InputValidation';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import { TextInput } from 'react-native';
import RequiredIndicator from '../RequiredIndicator';

function InputField({
  isRequired = false,
  hideError = true,
  showTitle = true,
  autoCapitalize = 'characters',
  title = '',
  value = '',
  onChangeText = () => {},
  InputRightElement = () => {},
  InputLeftElement = () => {},
  dataType = 'general',
  type = 'text',
  keyboardType = 'default',
  maxLength = null,
  onEndEditing = () => {},
  variant = 'singeLine',
  style = null,
  otherProps = {},
}) {
  // Track error state via input validation
  const [error, setError] = useState({ isError: false, errorMsg: '' });

  // Track whether component is in its first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // State for value in input component
  const [inputText, setInputText] = useState(value);

  // In first render of component, set isError to true to ensure submission blocking in the parent component
  // is active (as it is first rendered, user will not likely have filled anything).
  // This also ensures that since there will be no input, the component error message does not show until
  // the user focuses and violates the validation with their input.
  useEffect(() => {
    onEndEditing ? onEndEditing(isFirstRender || error.isError) : null;
    setIsFirstRender(false);
    setError({
      ...error,
      isError: isRequired && value.length === 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setError({
      ...error,
      isError: isRequired && value.length === 0,
    });
  }, [isRequired]);

  // Update the parent component that there is a validation error.
  // Validation is passed via the onEndEditing prop.
  useEffect(() => {
    if (!isFirstRender) {
      onEndEditing ? onEndEditing(error.isError) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, onEndEditing]);

  // Function to convert input to string and update value
  const handleOnChangeText = (value) => {
    value = value.toString();
    setInputText(value);
    onChangeText(value);
  };

  // Function to handle what to do after user leaves the input component
  // Capitalize input if autocap specificied
  // Validate input
  const handleOnEndEditing = () => {
    if (value) {
      if (autoCapitalize == 'characters') {
        value = value.toUpperCase();
      }
    } else {
      value = '';
    }
    setInputText(value);
    validateInput(value);
    onChangeText(value);
  };

  // Function used for input validation depending on the type of input data (given by the type prop)
  const validateInput = () => {
    msg = '';
    if (isRequired) {
      msg = validation.notEmpty(value);
    }
    if ('prefNameList' in otherProps) {
      msg = msg || validation.uniquePrefName(value, otherProps['prefNameList']);
    }
    const selValidationFunctions = validation.validationFunctions[dataType];
    if (selValidationFunctions) {
      for (const validationFunction of selValidationFunctions) {
        msg = msg || validationFunction(value);
      }
    }
    setError({ isError: msg ? true : false, errorMsg: msg });
  };

  return (
    <View style={styles.componentContainer}>
      <VStack>
        {showTitle ? (
          <Text style={styles.titleMsg}>
            {title}:{isRequired ? <RequiredIndicator /> : ''}
          </Text>
        ) : null}
        <Input
          borderColor={!error.errorMsg ? colors.light_gray3 : colors.red}
          textAlignVertical={variant === 'multiLine' ? 'top' : 'center'}
          autoCapitalize="none"
          borderRadius="25"
          height={variant === 'multiLine' ? '150' : '50'}
          value={inputText}
          onChangeText={handleOnChangeText}
          onEndEditing={handleOnEndEditing}
          placeholder={title}
          InputRightElement={InputRightElement}
          InputLeftElement={InputLeftElement}
          type={type}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={[styles.inputField, style]}
          {...otherProps}
        />
        {hideError && !error.errorMsg ? null : (
          <ErrorMessage message={error.errorMsg} />
        )}
      </VStack>
    </View>
  );
}

InputField.propTypes = {
  dataType: PropTypes.oneOf([
    'general',
    'password',
    'name',
    'nric',
    'home phone',
    'mobile phone',
    'email',
    'postal code',
  ]),
  keyboardType: TextInput.propTypes.keyboardType,
  variant: PropTypes.oneOf(['singleLine', 'multiLine']),
};

const styles = StyleSheet.create({
  componentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  titleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  errorMsg: {
    color: colors.red,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    fontSize: 15,
  },
  inputField: {
    fontSize: 16,
    width: '100%',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default InputField;
