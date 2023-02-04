import React from 'react';
import { Platform } from 'react-native';
import { Stack, Text, Input, FormControl, HStack } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function PersonalPreferenceCard(props) {
  const { patientInformation } = props;
  const { preferredName, preferredLanguage } = Platform.OS === 'web' ? patientInformation: patientInformation.route.params;

  return (
    <Stack space={2}>
      <Text
        color={colors.black_var1}
        fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        fontSize="2xl"
        fontWeight="semibold"
      >
        Preference
      </Text>
      <FormControl>
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
            Preferred Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={preferredName}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
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
            Preferred Language
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={preferredLanguage}
            w="100%"
          />
        </HStack>
      </FormControl>
    </Stack>
  );
}

export default PersonalPreferenceCard;
