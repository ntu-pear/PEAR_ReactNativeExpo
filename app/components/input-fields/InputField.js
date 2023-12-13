// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Input } from 'native-base';
import PropTypes from 'prop-types';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Utils
import * as validation from 'app/utility/inputValidation'

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import { TextInput } from 'react-native';
import RequiredIndicator from '../RequiredIndicator';

function InputField({
  isRequired = false,
  showTitle = true,
  title = '',
  value = '',
  onChangeText = () => {},
  InputRightElement = () => {},
  InputLeftElement = () => {},
  type = 'general',
  keyboardType = 'default',
  maxLength = null,
  onChildData = () => {},
  setErrorState = () => {},
  variant = 'singeLine',
  style = null,
  color = null,
  borderRadius = null,
}) { 
  /*
  This state and subsequent useEffect are used to track if the component is in its first render. This is mainly used to
  ensure that the submission blocking in the parent component is active (as it is first rendered, user will not
  likely have filled anything). This also ensures that since there will be no input, the component error message
  does not show until the user focuses and violates the validation with their input.
  */ 
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  useEffect(() => {
    onChildData ? onChildData(isFirstRender || errorMsg) : null;
    setIsFirstRender(false);
    setErrorState(errorMsg);
  }, []);
  
  /* 
  This is used to update the parent component that there is a validation error
  Validation is passed via the onChildData prop.
  */
  useEffect(() => {
    if (!isFirstRender) {
      onChildData ? onChildData(errorMsg) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMsg, onChildData]);
  
  /* 
  This state is used to track the error state of this component via validation
  */
  const [errorMsg, setErrorMsg] = useState(null);

  /* 
  This is used for input validation depending on the type of input data (given by the type prop)
  */
  const validationFunctions = {
    'name': [validation.alphaOnly],
    'nric': [validation.nricFormat],
    'home phone': [validation.homePhoneNoFormat],
    'mobile phone': [validation.mobilePhoneNoFormat],
    'email': [validation.emailFormat],
  };

  const validateInput = () => {
    msg = ''
    if(isRequired) {
      msg = validation.notEmpty(value);
    }
    if (validationFunctions[type]) {
      for(const validationFunction of validationFunctions[type]) {
        msg = msg || validationFunction(value);
      }
    }

    setErrorMsg(msg);

  }

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        {
          showTitle ? (
            <Text style={styles.TitleMsg}>
              {title}:{isRequired ? <RequiredIndicator/> : ''}
            </Text>
          ) : null
        }
        <Input
          backgroundColor={color? color : null}
          borderColor={
            !errorMsg ? colors.light_gray3 : colors.red
          }
          textAlignVertical={variant === 'multiLine' ? 'top' : 'center'}
          borderRadius={borderRadius ? borderRadius : "25"}
          height={variant === 'multiLine' ? '150' : '50'}
          value={value}
          onChangeText={onChangeText}
          onEndEditing={validateInput}
          placeholder={title}
          InputRightElement={InputRightElement}
          InputLeftElement={InputLeftElement}
          type={type=='password' ? 'password' : 'text'}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={[styles.InputField, style]}
        />
        <ErrorMessage message={errorMsg}/>        
      </VStack>
    </View>
  );
}

InputField.propTypes = {
  type: PropTypes.oneOf(['general', 'password', 'name', 'nric', 'home phone', 'mobile phone', 'email']),
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
  TitleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  ErrorMsg: {
    color: colors.red,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    fontSize: 15,
  },
  RequiredIndicator: {
    color: colors.red,
    fontSize: 18,
  },
  InputField: {
    fontSize: 16,
    width: '100%',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default InputField;
