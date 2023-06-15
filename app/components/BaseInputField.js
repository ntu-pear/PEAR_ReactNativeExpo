// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Input } from 'native-base';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Components
import ErrorMessage from 'app/components/ErrorMessage';

function BaseInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  keyboardType,
  maxLength,
  isError,
  validation,
  onChildData,
  setErrorState,
  variant,
}) {
  const requiredIndicator = <Text style={styles.RequiredIndicator}> *</Text>;

  // This state and subsequent useEffect are used to track if the component is in its first render. This is mainly used to
  // ensure that the submission blocking in the parent component is active (as it is first rendered, user will not
  // likely have filled anything). This also ensures that since there will be no input, the component error message
  // does not show until the user focuses and violates the validation with their input.
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    onChildData ? onChildData(isFirstRender || isError.error) : null;
    setIsFirstRender(false);
    setErrorState({
      ...isError,
      error: isRequired && value.length === 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This is used to update the parent component that there is a validation error
  // validation passed via the onChildData prop.
  useEffect(() => {
    if (!isFirstRender) {
      onChildData ? onChildData(isError.error) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, onChildData]);

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        <Text style={styles.TitleMsg}>
          {title}:{isRequired ? requiredIndicator : ''}
        </Text>
        <Input
          borderColor={
            isError.errorMsg === '' ? colors.light_gray3 : colors.red
          }
          textAlignVertical={variant === 'multiLine' ? 'top' : 'center'}
          borderRadius="25"
          height={variant === 'multiLine' ? '150' : '50'}
          value={value}
          onChangeText={onChangeText}
          onEndEditing={validation}
          placeholder={title}
          InputRightElement={InputRightElement}
          type={type}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={styles.InputField}
        />
        {isError.errorMsg ? (
          <ErrorMessage message={isError.errorMsg} visible={true} />
        ) : null}
      </VStack>
    </View>
  );
}

BaseInputField.defaultProps = {
  variant: 'singleLine',
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
    // height: 100,
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default BaseInputField;
