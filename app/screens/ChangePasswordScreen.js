import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Alert, StyleSheet, ActivityIndicator, Keyboard, Platform } from 'react-native';
import { VStack, View, Center } from 'native-base';
import userApi from 'app/api/user';
import authStorage from 'app/auth/authStorage';
import AuthContext from 'app/auth/context';
import AppButton from 'app/components/AppButton';
import SensitiveInputField from 'app/components/input-components/SensitiveInputField';

function ChangePasswordScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const { sidebar } = props;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ✅ NEW FIELD
  const [isPasswordError, setIsPasswordError] = useState(false);

  const handlePasswordError = useCallback((state) => setIsPasswordError(state), []);

  // Server policy: ≥12 chars, ≥1 uppercase, ≥1 lowercase, ≥1 special char
  const normalize = (s) => (s || '').trim();
  const passwordFormat = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/.test(normalize(value));

  const handleOnPress = async () => {
    Keyboard.dismiss();

    // Step 1: Check password match
    if (newPassword !== confirmPassword) {
      Alert.alert('Please try again', 'New passwords do not match.');
      return;
    }

    // Step 2: Validate new vs old difference
    if (normalize(currentPassword) === normalize(newPassword)) {
      Alert.alert('Please try again', 'New password must be different from current password.');
      return;
    }

    // Step 3: Check format
    const isPasswordFormatValid =
      passwordFormat(currentPassword) && passwordFormat(newPassword);
    if (!isPasswordFormatValid) {
      Alert.alert('Please try again', 'Password does not follow the specified format!');
      return;
    }

    // Step 4: Proceed with API call
    setIsLoading(true);
    const resp = await userApi.changePassword('', currentPassword, newPassword);

    if (!resp?.ok) {
      const data = resp?.data || {};
      const apiMsg =
        data?.message ||
        (Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join('\n') : null) ||
        (typeof data?.detail === 'string' ? data.detail : null) ||
        'Unable to change password.';
      Alert.alert('Please try again', apiMsg);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    Alert.alert('Password changed successfully', 'Please login again.');
    authContext.setUser(null);

    await Promise.all([
      authStorage.deleteToken?.('userAuthTokenV1'),
      authStorage.deleteToken?.('userRefreshTokenV1'),
      authStorage.deleteToken?.('userAuthToken'),
      authStorage.deleteToken?.('userRefreshToken'),
      authStorage.deleteToken?.('userAuthTokenLegacy'),
      authStorage.deleteToken?.('userRefreshTokenLegacy'),
    ]);
  };

  return (
    <View style={styles.formContainer}>
      <VStack>
        <Center>
          <SensitiveInputField
            isRequired
            title={'Current Password'}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            onEndEditing={handlePasswordError}
            dataType="password"
            maxLength={16}
          />

          <SensitiveInputField
            isRequired
            title={'New Password'}
            value={newPassword}
            onChangeText={setNewPassword}
            onEndEditing={handlePasswordError}
            dataType="password"
            maxLength={16}
          />

          {/* New confirm password field */}
          <SensitiveInputField
            isRequired
            title={'Confirm New Password'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onEndEditing={handlePasswordError}
            dataType="password"
            maxLength={16}
          />

          <View style={styles.buttonsContainer}>
            {isLoading ? (
              <ActivityIndicator visible />
            ) : (
              <AppButton title="Confirm" color="green" onPress={handleOnPress} />
            )}
          </View>
        </Center>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
  },
  buttonsContainer: {
    width: '50%',
    paddingVertical: 30,
    alignSelf: 'center',
  },
});

export default ChangePasswordScreen;
