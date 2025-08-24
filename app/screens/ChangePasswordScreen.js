import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Alert, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { VStack, View, Icon, Box, Center, FlatList } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import userApi from 'app/api/user';
import authStorage from 'app/auth/authStorage';
import AuthContext from 'app/auth/context';
import colors from 'app/config/colors';
import AppButton from 'app/components/AppButton';
import CustomFormControl from 'app/components/CustomFormControl';
import * as Yup from 'yup';
import ErrorMessage from 'app/components/ErrorMessage';
import { Platform } from 'react-native';

import SensitiveInputField from 'app/components/input-components/SensitiveInputField';

function ChangePasswordScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useContext(AuthContext);
  // const [oldPassword, setOldPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { sidebar } = props;

  const [currentPassword, setCurrentPassword] = useState(''); // NEW
  const [newPassword, setNewPassword] = useState('');         // NEW
  const [isPasswordError, setIsPasswordError] = useState(false);

  const handlePasswordError = useCallback(
    (state) => setIsPasswordError(state),
    []
  );
  // const schema = Yup.object().shape({
  //   oldPassword: Yup.string().required('Old Password is a required field.'),
  //   newPassword: Yup.string()
  //     .min(6, 'New Password must be at least 6 characters.')
  //     .required('New Password is a required field.'),
  // });

  // const validate = async () => {
  //   let formData = {
  //     oldPassword: oldPassword,
  //     newPassword: newPassword,
  //   };

  //   try {
  //     // Validate the form data against the schema and set errors when needed
  //     await schema.validate(formData, { abortEarly: false });
  //     return true;
  //   } catch (error) {
  //     if (error.inner) {
  //       const errorList = {};
  //       error.inner.forEach((e) => {
  //         errorList[e.path] = e.message;
  //       });
  //       setErrors(errorList);
  //       return false;
  //     }
  //   }
  // };

   // Server policy: ≥12 chars, ≥1 uppercase, ≥1 lowercase, ≥1 special char
const normalize = (s) => (s || '').trim();
const passwordFormat = (value) =>
   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/.test(normalize(value));

  const handleOnPress = async () => {
    const isPasswordFormatValid =
      passwordFormat(currentPassword) === true &&
      passwordFormat(newPassword) === true;
    let alertTitle = 'Please try again';
    let alertDetails = '';

    Keyboard.dismiss();

    // const validation = await validate();
    // if (!validation) {
    //   return;
    // }

    if (normalize(currentPassword) === normalize(newPassword)) {
      Alert.alert('Please try again', 'New password must be different from current password.');
      return;
   }

    if (!isPasswordFormatValid) {
      alertDetails = 'Password does not follow the specified format!';
      Alert.alert(alertTitle, alertDetails);
      return;
    }

    setIsLoading(true);
    const resp = await userApi.changePassword('', currentPassword, newPassword); // NEW

    if (!resp?.ok) {
      // NEW: friendlier error surfacing for FastAPI responses
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
    // let alertTxt = 'Password changed successfully. Please login again.';
    // Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    // Redirects the user to Welcome screen by logging out after successful password change.

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
          {/* <CustomFormControl
            isRequired
            isInvalid={'oldPassword' in errors}
            title="Old Password"
            onChangeText={handleOldPassword}
            placeholder="Enter Old Password"
            value={oldPassword}
            ErrorMessage={errors.oldPassword}
            InputRightElement={
              <Icon
                as={
                  <MaterialIcons
                    name={showOld ? 'visibility' : 'visibility-off'}
                  />
                }
                color={colors.black}
                mr="5"
                onPress={() => setShowOld(!showOld)}
                size={5}
              />
            }
            type={showOld ? 'text' : 'password'}
          /> */}

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

          {/* <CustomFormControl
            isRequired
            isInvalid={'newPassword' in errors}
            title="New Password"
            onChangeText={handleNewPassword}
            placeholder="Enter New Password"
            ErrorMessage={errors.newPassword}
            value={newPassword}
            HelperText="Password must be at least 6 characters, containing one uppercase, one lowercase and one non-alphanumeric."
            InputRightElement={
              <Icon
                as={
                  <MaterialIcons
                    name={showNew ? 'visibility' : 'visibility-off'}
                  />
                }
                color={colors.black}
                mr="5"
                onPress={() => setShowNew(!showNew)}
                size={5}
              />
            }
            type={showNew ? 'text' : 'password'}
          /> */}

          {/* <Box maxW="70%">
            <ErrorMessage visible={'api' in errors} message={errors.api} />
          </Box> */}

          <View style={styles.buttonsContainer}>
            {isLoading ? (
              <ActivityIndicator visible />
            ) : (
              <AppButton
                title="Confirm"
                color="green"
                onPress={handleOnPress}
              />
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
