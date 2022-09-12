/*eslint eslint-comments/no-unlimited-disable: error */
import React from 'react';
import { Platform } from 'react-native';
import { Stack, Text, Input, FormControl, HStack } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function PersonalGuardianCard(props) {
  const { guardian, additionalGuardian } = props.patientGuardian; //eslint-disable-line no-unused-vars

  return (
    <Stack>
      <Text
        color={colors.black_var1}
        fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        fontSize="2xl"
        fontWeight="semibold"
      >
        Guardian(s)
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
            First Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={
              guardian && guardian.firstName
                ? guardian.firstName
                : 'Not Available'
            }
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
            Last Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={
              guardian && guardian.lastName
                ? guardian.lastName
                : 'Not Available'
            }
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
            NRIC
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={guardian && guardian.nric ? guardian.nric : 'Not Available'}
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
            Relationship
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={
              guardian && guardian.relationship
                ? guardian.relationship
                : 'Not Available'
            }
            w="100%"
          />
        </HStack>
      </FormControl>
    </Stack>
  );
}

export default PersonalGuardianCard;
