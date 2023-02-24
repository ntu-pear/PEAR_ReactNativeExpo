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
import routes from 'app/navigation/routes';

import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';
import CustomFormControl from 'app/components/CustomFormControl';

function ResetPasswordScreen(props) {
  const { navigation, route } = props;
  const [role, setRole] = useState('Supervisor');
  const [email, setEmail] = useState('');
  const [resetFailed, setResetFailed] = useState(false);

  const handleEmail = (e) => {
    setEmail(e);
  };

  const onPressReset = async () => {
    const result = await userApi.resetPassword(email, role);
    if (!result.ok) {
      return setResetFailed(true);
    }

    setResetFailed(false);
    // Alert.alert('Instructions to reset password have been sent to email.');
    let alertTxt = 'Instructions to reset password have been sent to email.';
    Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    // navigation.goBack();
    navigation.navigate(routes.WELCOME);
  };

  return (
    <View>
      <VStack>
        <Center flex={1}>
          <CustomFormControl
            title="Email"
            onChangeText={handleEmail}
            placeholder="jess@gmail.com"
          />

          <FormControl maxW="80%" mt="5">
            <VStack>
              <FormControl.Label
                _text={{
                  fontFamily: `${
                    Platform.OS === 'ios' ? 'Helvetica' : typography.android
                  }`,
                  fontWeight: 'bold',
                }}
              >
                Role
              </FormControl.Label>

              <Select
                accessibilityLabel="Select Role"
                borderRadius="25"
                fontFamily={
                  Platform.OS === 'ios' ? typography.ios : typography.android
                }
                height="50"
                minWidth="full"
                minHeight="3%"
                placeholder="Select role"
                placeholderTextColor={colors.medium}
                onValueChange={(itemValue) => setRole(itemValue)}
                selectedValue={role}
                size="18"
              >
                <Select.Item label="Supervisor" value="Supervisor" />
                <Select.Item label="Guardian" value="Guardian" />
                <Select.Item label="Doctor" value="Doctor" />
                <Select.Item label="Caregiver" value="Caregiver" />
                <Select.Item label="Nurse" value="Nurse" />
              </Select>
            </VStack>
            <Box>
              <ErrorMessage
                visible={resetFailed}
                message={errors.resetPasswordError}
              />
            </Box>
            <View style={styles.buttonsContainer}>
              <AppButton title="Reset" color="green" onPress={onPressReset} />
            </View>
          </FormControl>
        </Center>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '50%',
    paddingVertical: 30,
    alignSelf: 'center',
  },
});

export default ResetPasswordScreen;
