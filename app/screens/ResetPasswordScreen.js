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
const MONTHS_CAPS  = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTHS_TITLE = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NUM = ['01','02','03','04','05','06','07','08','09','10','11','12'];


// Accepts: 15APR2002, 15-APR-2002, 15 apr 2002, 15-Apr-2002 (separators optional; case-insensitive)
const DOB_RE_COMPACT = /^(0?[1-9]|[12][0-9]|3[01])(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{4}$/i;

function isDobValid(input) {
  if (!input) return true; // optional field: empty is OK
  const compact = String(input).trim().replace(/[\s-]+/g, '').toUpperCase(); // "15-apr-2002" -> "15APR2002"
  return DOB_RE_COMPACT.test(compact);
}


function dobToISO(input) {
  if (!input) return undefined;
  const compact = String(input).trim().replace(/[\s-]+/g, '').toUpperCase(); // 15APR2002
  const m = compact.match(/^(0?[1-9]|[12][0-9]|3[01])(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(\d{4})$/i);
  if (!m) return undefined;
  const day = m[1].padStart(2, '0');
  const monCaps = m[2].toUpperCase();
  const year = m[3];
  const idx = MONTHS_CAPS.indexOf(monCaps);
  if (idx === -1) return undefined;
  const month = MONTH_NUM[idx];                // 01..12
  return `${year}-${month}-${day}`;            // e.g., 2001-03-15
}
function ResetPasswordScreen(props) {
  const { navigation } = props;
  const [role, setRole] = useState('Supervisor');
  const [email, setEmail] = useState('');
  const [nric, setNric] = useState('');
  const [dob, setDob] = useState(''); // optional, user may type "15APR2002" or "15-Apr-2002"
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Yup: make DOB optional; validate format only if present
  const schema = Yup.object().shape({
    nric: Yup.string().trim().required('NRIC is a required field.'),
    email: Yup.string().trim().email('Invalid email address.').required('Email is a required field.'),
    role: Yup.string().trim().required('Role is a required field.'),
    nric_DateOfBirth: Yup.string()
      .trim()
      .transform(v => (v === '' ? undefined : v))
      .test('valid-dob', 'Use DD-MMM-YYYY (e.g., 07-Oct-2001) or compact like 07OCT2001', (v) => !v || isDobValid(v)),
  });

  const validate = async () => {
    try {
      await schema.validate(
        { nric, email, role, nric_DateOfBirth: dob },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (error) {
      const errorList = {};
      if (error.inner) {
        error.inner.forEach((e) => {
          if (e.path) errorList[e.path === 'nric_DateOfBirth' ? 'nric_DateOfBirth' : e.path] = e.message;
        });
      }
      setErrors(errorList);
      return false;
    }
  };

  const onPressReset = async () => {
    const ok = await validate();
    if (!ok) return;

    setIsLoading(true);
    try {
      const payload = {
        nric: (nric || '').trim().toUpperCase(),
        email: (email || '').trim().toLowerCase(),
        roleName: (role || '').trim(),   // keep exact labels as your dropdown
      };
      
      if (dob && isDobValid(dob)) {
        const iso = dobToISO(dob);       // <-- convert here
        if (iso) payload.nric_DateOfBirth = iso;   // "YYYY-MM-DD"
      }
      
      const result = await userApi.requestResetPassword(payload);

      if (!result?.ok) {
        const data = result?.data || {};
        let apiMsg =
          data?.message ||
          (Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join('\n') : null) ||
          (typeof data?.detail === 'string' ? data.detail : null) ||
          'Unable to request password reset.';

        if (apiMsg === 'Invalid Details') {
          apiMsg =
            'No user found with that NRIC, email, and role. Please double-check all three fields (role must match your account).';
        }
        setErrors({ api: apiMsg });
        setIsLoading(false);
        return;
      }

      const alertTxt = 'Instructions to reset password have been sent to your email.';
      Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
      navigation.navigate(routes.WELCOME);
    } catch (e) {
      setErrors({ api: 'Unexpected error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View testID="reset_password_screen">
      <VStack w={Platform.OS === 'web' ? '50%' : '80%'} alignSelf="center" mt="5" space={5}>
        {/* NRIC */}
        <FormControl isRequired isInvalid={'nric' in errors}>
          <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">NRIC</FormControl.Label>
          <Input
            value={nric}
            onChangeText={(v) => setNric(v.trim().toUpperCase())}
            placeholder="S1234567A"
            borderRadius="25"
            height="50"
            px="4"
          />
          {'nric' in errors && <FormControl.ErrorMessage>{errors.nric}</FormControl.ErrorMessage>}
        </FormControl>

        {/* Email */}
        <FormControl isRequired isInvalid={'email' in errors}>
          <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">Email</FormControl.Label>
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
          {'email' in errors && <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>}
        </FormControl>

        {/* DOB (optional) */}
        <FormControl isRequired isInvalid={'nric_DateOfBirth' in errors}>
          <FormControl.Label _text={{ fontWeight: 'bold', fontSize: 16 }} pl="4">Date of Birth</FormControl.Label>
          <Input
            value={dob}
            onChangeText={setDob}
            placeholder="DD-MMM-YYYY or 15APR2002"
            borderRadius="25"
            height="50"
            px="4"
            // Only show red if user typed something invalid
            isInvalid={Boolean(dob) && !isDobValid(dob)}
            _invalid={{ borderColor: '#CBD5E1' }}
            _focus={{ borderColor: '#0F766E' }}
          />
          {'nric_DateOfBirth' in errors && (
            <FormControl.ErrorMessage>{errors.nric_DateOfBirth}</FormControl.ErrorMessage>
          )}
        </FormControl>

        {/* Role */}
        <FormControl isRequired isInvalid={'role' in errors}>
          <FormControl.Label _text={{ ...typography.body1SemiBold, fontWeight: 'bold' }} pl="4">Role</FormControl.Label>
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
