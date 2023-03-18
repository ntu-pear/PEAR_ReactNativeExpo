/*eslint eslint-comments/no-unlimited-disable: error */
import React from 'react';
import { Platform } from 'react-native';
import {
  Avatar,
  Center,
  Stack,
  Text,
  Input,
  FormControl,
  HStack,
  TextArea,
} from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function UserInformationCard(props) {
  const { userProfile } = props;
  const { address, dob, firstName, lastName, gender, nric, email, role } =
    userProfile.route.params;

  return (
    <Stack>
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
            value={firstName}
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
            value={lastName}
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
            Role
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={role}
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
            value={nric}
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
            Gender
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={gender === 'F' ? 'Female' : 'Male'}
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
            DOB
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={dob.substring(0, 10)}
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
            Email
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            variant="unstyled"
            value={email}
            w="100%"
          />
        </HStack>
      </FormControl>

      <FormControl>
        <Stack space={0} alignItems="flex-start" flexWrap="wrap">
          <FormControl.Label
            width="100%"
            _text={{
              fontFamily: `${
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }`,
              fontSize: 'lg',
              fontWeight: 'thin',
            }}
          >
            Address
          </FormControl.Label>
          <TextArea
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            input="lg"
            ml="-2.5"
            minH="30%"
            maxH="50%"
            variant="unstyled"
            value={address || 'Not available'}
            w="100%"
          />
        </Stack>
      </FormControl>
    </Stack>
  );
}

export default UserInformationCard;
