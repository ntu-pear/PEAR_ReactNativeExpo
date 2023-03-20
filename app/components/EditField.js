import React from 'react';
import { Platform } from 'react-native';
import { HStack, VStack, Input, FormControl } from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function EditField(props) {
  // Destructure props
  const {
    isRequired,
    isInvalid,
    title,
    onChangeText,
    placeholder,
    value,
    ErrorMessage,
  } = props;

  return (
    <FormControl maxW="60%" isRequired={isRequired} isInvalid={isInvalid}>
      <VStack>
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }`,
              fontSize: 'lg',
              fontWeight: 'thin',
            }}
          >
            {title}
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            bg={colors.gray}
            _focus={{
              bg: `${colors.lighter}`,
              borderColor: `${colors.secondary}`,
            }}
            borderRadius="25"
            height="50"
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            onChangeText={onChangeText}
            placeholder={placeholder}
            value={value}
            w="100%"
            mt="1"
            fontSize="lg"
          />
        </HStack>
        <FormControl.ErrorMessage>{ErrorMessage}</FormControl.ErrorMessage>
      </VStack>
    </FormControl>
  );
}

export default EditField;
