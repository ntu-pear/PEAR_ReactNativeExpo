import React from 'react';
import { Platform } from 'react-native';
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
  return (
    <FormControl w="80%" mt="5" isRequired={isRequired} isInvalid={isInvalid}>
      <VStack alignItems="flex-start">
        <FormControl.Label
          _text={{
            fontFamily: `${
              Platform.OS === 'ios' ? typography.ios : typography.android
            }`,
            fontWeight: 'bold',
          }}
        >
          {title}
        </FormControl.Label>

        <Input
          color={colors.black_var1}
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
        <FormControl.ErrorMessage>{ErrorMessage}</FormControl.ErrorMessage>
        <FormControl.HelperText>{HelperText}</FormControl.HelperText>
      </VStack>
    </FormControl>
  );
}

export default CustomFormControl;
