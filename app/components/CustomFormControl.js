import React, { useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Input, FormControl } from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function CustomFormControl(props) {
  // Destructure props
  const {
    isRequired,
    isInvalid,
    title,
    value,
    onChangeText,
    placeholder,
    HelperText,
    ErrorMessage,
    InputRightElement,
    type,
    keyboardType,
    maxLength,
  } = props;

  const requiredIndicator = <Text style={styles.requiredIndicator}> *</Text>;

  return (
    // "mt" property = marginTop, "w" property = width
    // <FormControl w="80%" mt="5" isRequired={isRequired} isInvalid={isInvalid}>
    <View style={styles.componentContainer}>
      <VStack>
        {/* <FormControl.Label
          _text={{
            fontFamily: `${
              Platform.OS === 'ios' ? typography.ios : typography.android
            }`,
            fontWeight: 'bold',
          }}
        >
          {title}
        </FormControl.Label> */}
        <View>
          <Text style={styles.titleMsg}>
            {title}
            {isRequired ? requiredIndicator : ''}
          </Text>
        </View>
        <Input
          color={colors.black_var1}
          borderColor={ErrorMessage == null ? colors.light_gray3 : colors.red}
          borderRadius="25"
          height="50"
          fontFamily={
            Platform.OS === 'ios' ? typography.ios : typography.android
          }
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          size="18"
          w="100%"
          InputRightElement={InputRightElement}
          type={type}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {/* TODO: implement input check */}
        <Text style={styles.errorMsg}>{ErrorMessage}</Text>
        {/* <FormControl.ErrorMessage>{ErrorMessage}</FormControl.ErrorMessage>
        <FormControl.HelperText>{HelperText}</FormControl.HelperText> */}
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  componentContainer: {
    display: 'flex',
    width: '80%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  titleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  errorMsg: {
    color: colors.red,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    fontSize: 12,
  },
  requiredIndicator: {
    color: colors.red,
  },
});

export default CustomFormControl;
