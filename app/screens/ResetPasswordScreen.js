import React from 'react';
import { useState } from 'react';
import { Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { VStack, FormControl, View, Select, Box, Center } from 'native-base';
import userApi from 'app/api/user';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';

import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';
import CustomFormControl from 'app/components/CustomFormControl';
import * as Yup from 'yup';

function ResetPasswordScreen(props) {
  const { navigation } = props;
  const [role, setRole] = useState('Supervisor');
  const [email, setEmail] = useState('');
  const [nric, setNric] = useState('');
  const [dob, setDob] = useState(''); // optional: 'YYYY-MM-DD'
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testID = 'reset_password_screen';


  const schema = Yup.object().shape({
    nric: Yup.string().required('NRIC is a required field.'),
    email: Yup.string().email('Invalid email address.').required('Email is a required field.'),
    role: Yup.string().required('Role is a required field.'),
    // dob optional – add rules if your backend strictly validates format:
    // nric_DateOfBirth: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    });

    const validate = async () => {
      const formData = { nric, email, role };
      try {
        await schema.validate(formData, { abortEarly: false });
        setErrors({});
        return true;
      } catch (error) {
        if (error.inner) {
          const errorList = {};
          error.inner.forEach((e) => {
            errorList[e.path] = e.message;
          });
          setErrors(errorList);
        }
        return false;
      }
    };

  const onPressReset = async () => {
    const validation = await validate();
    if (!validation) {
      return;
    }

    setIsLoading(true);
    const result = await userApi.requestResetPassword({
      nric,
      email,
      roleName: role,
      nric_DateOfBirth: dob || undefined,
      });

    if (!result.ok) {
        const apiMsg =
        result?.data?.message ||
        (Array.isArray(result?.data?.detail)
          ? result.data.detail.map(d => d.msg).join('\n')
          : 'Unable to request password reset.');
      setErrors({ api: apiMsg });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    let alertTxt = 'Instructions to reset password have been sent to email.';
    Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    navigation.navigate(routes.WELCOME);
  };

  return (
    <View testID={testID}>
      <VStack>
        <Center w={Platform.OS === 'web' ? '62.5%' : '100%'}>
          {/* NRIC */}
          <CustomFormControl
            label="NRIC"
            placeholder="S1234567A"
            onChangeText={(v) => setNric(v.trim().toUpperCase())} 
            value={nric}
            error={errors.nric}
          />

          {/* Email */}
          <CustomFormControl
            label="Email"
            placeholder="jess@gmail.com"
            onChangeText={setEmail}
            value={email}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* (Optional) Date of Birth */}
          <CustomFormControl
            label="Date of Birth (optional)"
            placeholder="YYYY-MM-DD"
            onChangeText={setDob}
            value={dob}
            error={errors.nric_DateOfBirth}
          />

          {/* Role */}
          <FormControl
            maxW={Platform.OS === 'web' ? '50%' : '80%'}
            mt="5"
            isRequired
            isInvalid={'role' in errors}
          >
            <FormControl.Label _text={{ ...typography.body1SemiBold }}>
              Role
            </FormControl.Label>
            <VStack>
              <Select
                accessibilityLabel="Select Role"
                borderRadius="25"
                {...typography.subheading1}
                height="50"
                minWidth="full"
                minHeight="3%"
                placeholder="Select role"
                placeholderTextColor={colors.grey}
                onValueChange={(itemValue) => setRole(itemValue)}
                selectedValue={role}
              >
                <Select.Item label="Supervisor" value="Supervisor" />
                <Select.Item label="Guardian" value="Guardian" />
                <Select.Item label="Doctor" value="Doctor" />
                <Select.Item label="Caregiver" value="Caregiver" />
                <Select.Item label="Nurse" value="Nurse" />
              </Select>
            </VStack>
          </FormControl>

          <Box>
            <ErrorMessage visible={'api' in errors} message={errors.api} />
          </Box>

          <View style={styles.buttonsContainer}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <AppButton title="Reset" color="green" onPress={onPressReset} disabled={isLoading} />
            )}
          </View>
        </Center>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: Platform.OS === 'web' ? '30%' : '50%',
    paddingVertical: 30,
    alignSelf: 'center',
  },
});

export default ResetPasswordScreen;
