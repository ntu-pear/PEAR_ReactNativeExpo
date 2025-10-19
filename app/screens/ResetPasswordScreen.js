import React from 'react';
import { useState } from 'react';
import { Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { VStack, FormControl, View, Select, Box, Center, Input} from 'native-base';
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
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const testID = 'reset_password_screen';


  const schema = Yup.object().shape({
    nric: Yup.string().required('NRIC is a required field.'),
    email: Yup.string().email('Invalid email address.').required('Email is a required field.'),
    role: Yup.string().required('Role is a required field.'),
    nric_DateOfBirth: Yup.string()
     .required('Date of Birth is required.')
     .matches(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/, 'Use DD-MMM-YYYY (e.g., 05-Oct-2001)')
    .test('valid-ui-dob', 'Invalid date', (val) => isValidUiDob(val || '')),
    // dob optional – add rules if your backend strictly validates format:
    // nric_DateOfBirth: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    });

    const isValidUiDob = (val) => {
      if (!val) return false;
      // Accept 1 or 2 digits for day, normalize later
      const m = val.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
      if (!m) return false;
      let [_, d, monStr, y] = m;
      const monIdx = MONTHS.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
      if (monIdx === -1) return false;
    
      const day = parseInt(d, 10);
      const year = parseInt(y, 10);
      // days in month w/ leap-year check
      const daysInMonth = [31, (year%4===0 && (year%100!==0 || year%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return day >= 1 && day <= daysInMonth[monIdx];
    };

    // Convert "DD-MMM-YYYY" -> "YYYY-MM-DD"
    const uiDobToIso = (val) => {
      const m = val.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
       if (!m) return undefined;
      let [_, d, monStr, y] = m;
      const monIdx = MONTHS.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
      if (monIdx === -1) return undefined;
      const day = String(d).padStart(2, '0');
      const month = String(monIdx + 1).padStart(2, '0');
      return `${y}-${month}-${day}`;
      }; 

    const validate = async () => {
      const formData = { nric, email, role, nric_DateOfBirth: dob };
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

    const dobISO = uiDobToIso(dob); // convert UI format -> ISO for backend
    const result = await userApi.requestResetPassword({
      nric: (nric || '').trim().toUpperCase(),
      email: (email || '').trim().toLowerCase(),
      roleName: (role || '').trim().toUpperCase(),
      // send ISO to backend; if conversion fails (shouldn’t after validation), omit it
      nric_DateOfBirth: dobISO || undefined,
    });
    

      if (!result?.ok) {
        // Map FastAPI-style errors into a friendly message
        const data = result?.data || {};
        let apiMsg =
          data?.message ||
          (Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join('\n') : null) ||
          (typeof data?.detail === 'string' ? data.detail : null) ||
          'Unable to request password reset.';
  
        // Special-case the common backend response
        if (apiMsg === 'Invalid Details') {
          apiMsg =
            'We could not find a user with that NRIC, email, and role. Please double-check all three fields (role must match your account).';
        }
  
        setErrors({ api: apiMsg });
        setIsLoading(false);
        return;
      }
  
      setIsLoading(false);
      const alertTxt = 'Instructions to reset password have been sent to email.';
      Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
      navigation.navigate(routes.WELCOME);
    };


  return (
    <View testID={testID}>
  <VStack
    w={Platform.OS === 'web' ? '50%' : '80%'}
    alignSelf="center"
    mt="5"
    space={5}   // consistent vertical rhythm
  >

    {/* NRIC */}
    <FormControl isRequired isInvalid={'nric' in errors}>
      <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">
        NRIC
      </FormControl.Label>
      <Input
        value={nric}
        onChangeText={(v) => setNric(v.trim().toUpperCase())}
        placeholder="S1234567A"
        borderRadius="25"
        height="50"
        px="4"                 // matches label padding
      />
      {'nric' in errors && (
        <FormControl.ErrorMessage>{errors.nric}</FormControl.ErrorMessage>
      )}
    </FormControl>

    {/* Email */}
    <FormControl isRequired isInvalid={'email' in errors}>
      <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">
        Email
      </FormControl.Label>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="jess@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        borderRadius="25"
        height="50"
        px="4"
      />
      {'email' in errors && (
        <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
      )}
    </FormControl>

    {/* Date of Birth (optional) */}
    <FormControl isRequired isInvalid={'nric_DateOfBirth' in errors}>
      <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">
        Date of Birth
      </FormControl.Label>
      <Input
        value={dob}
        onChangeText={setDob}
        placeholder="DD-MMM-YYYY"
        borderRadius="25"
        height="50"
        px="4"
      />
    </FormControl>

    {/* Role — keep your existing block, just match width/padding */}
    <FormControl
      w="100%"
      isRequired
      isInvalid={'role' in errors}
    >
      <FormControl.Label _text={{ ...typography.body1SemiBold, fontWeight: 'bold' }} pl="4">
        Role
      </FormControl.Label>
      <VStack>
        <Select
          accessibilityLabel="Select Role"
          borderRadius="25"
          {...typography.subheading1}
          height="50"
          minWidth="full"
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
