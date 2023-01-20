import React from 'react';
import { useState } from 'react';
import { Platform, Alert, StyleSheet } from 'react-native';
import {
  VStack,
  HStack,
  Input,
  FormControl,
  View,
  Select,
  Box,
  Center,
} from 'native-base';
import userApi from 'app/api/user';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import errors from 'app/config/errors';

import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';

function ChangePasswordScreen(props) {
  const { navigation, route } = props;
  const [oldPassword, setOldPassword] = useState(' ');
  const [newPassword, setNewPassword] = useState(' ');
  const [changeFailed, setChangeFailed] = useState(false);

  const handleEmail = (e) => {
    // TODO: get email from get user...
  };

  const handleOldPassword = (e) => {
    setOldPassword(e);
  };

  const handleNewPassword = (e) => {
    setNewPassword(e);
  };

  const onPressConfirm = async () => {
    // TODO: check if it works?
    // const result = await userApi.changePassword(email, oldPassword, newPassword);
    // console.log(result)
    // if (!result.ok) {
    //   return setChangeFailed(true);
    // }

    console.log(oldPassword, newPassword);

    setChangeFailed(true);
    // Alert.alert('Instructions to reset password have been sent to email.');
    // navigation.goBack();
  };

  return (
    <View>
      <VStack>
        <Center>
          <FormControl maxW="80%" mt="5">
            <VStack alignItems="flex-start">
              <FormControl.Label
                _text={{
                  fontFamily: `${
                    Platform.OS === 'ios' ? 'Helvetica' : typography.android
                  }`,
                  fontWeight: 'bold',
                }}
              >
                Old Password
              </FormControl.Label>

              <Input
                color={colors.black_var1}
                borderRadius="25"
                height="50"
                fontFamily={
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }
                onChangeText={handleOldPassword}
                placeholder="Enter Old Password"
                size="18"
                w="100%"
              />
            </VStack>
          </FormControl>

          <FormControl maxW="80%" mt="5">
            <VStack alignItems="flex-start">
              <FormControl.Label
                _text={{
                  fontFamily: `${
                    Platform.OS === 'ios' ? 'Helvetica' : typography.android
                  }`,
                  fontWeight: 'bold',
                }}
              >
                New Password
              </FormControl.Label>

              <Input
                color={colors.black_var1}
                borderRadius="25"
                height="50"
                fontFamily={
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }
                onChangeText={handleNewPassword}
                placeholder="Enter New Password"
                size="18"
                w="100%"
              />
            </VStack>
          </FormControl>
        </Center>

        <Center>
          <Box maxW="70%">
            <ErrorMessage
              visible={changeFailed}
              message={errors.changePasswordError}
            />
          </Box>
        </Center>

        <View style={styles.buttonsContainer}>
          <AppButton title="Confirm" color="green" onPress={onPressConfirm} />
        </View>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '50%',
    padding: 30,
    alignSelf: 'flex-left',
  },
});

export default ChangePasswordScreen;
