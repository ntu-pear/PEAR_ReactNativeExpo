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
  const { navigation, route } = props;
  const [role, setRole] = useState('Supervisor');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEmail = (e) => {
    setEmail(e);
  };

  const schema = Yup.object().shape({
    email: Yup.string().email('Invalid email address.').required('Email is a required field.'),
    role: Yup.string().required('Role is a required field.'),
  });

  const validate = async () => {
    let formData = {
      email: email,
      role: role,
    };

    try {
      // Validate the form data against the schema and set errors when needed
      await schema.validate(formData, { abortEarly: false });
      return true;
    } catch (error) {
      if (error.inner) {
        const errorList = {};
      error.inner.forEach((e) => {
        errorList[e.path] = e.message;
      });
      // console.log(errorList);
      setErrors(errorList);
      return false;
    }
  }
  };

  const onPressReset = async () => {
    const validation = await validate();
    if (!validation) {
      return;
    }

    setIsLoading(true);
    const result = await userApi.resetPassword(email, role);
    if (!result.ok) {
      setErrors({
        api: result.data.message,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    let alertTxt = 'Instructions to reset password have been sent to email.';
    Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    navigation.navigate(routes.WELCOME);
  };

  return (
    <View>
      <VStack>
        <Center>
          <CustomFormControl
            isRequired
            isInvalid={'email' in errors}
            title="Email"
            onChangeText={handleEmail}
            placeholder="jess@gmail.com"
            ErrorMessage={errors.email}
          />

          <FormControl maxW="80%" mt="5" isRequired>
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
            </FormControl>
            
            <Box>
              <ErrorMessage visible={'api' in errors} message={errors.api} />
            </Box>
            <View style={styles.buttonsContainer}>
              {isLoading ? (
                <ActivityIndicator color={colors.primary_overlay_color} />
              ) : (
                <AppButton title="Reset" color="green" onPress={onPressReset} />
              )}
            </View>
          
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
