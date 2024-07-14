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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);

  // const handleOldPassword = (e) => {
  //   setOldPassword(e);
  // };

  // const handleNewPassword = (e) => {
  //   setNewPassword(e);
  // };

  const handlePasswordError = useCallback(
    (state) => {
      setIsPasswordError(state);
    },
    [isPasswordError],
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

   const passwordFormat = (value) => {
    if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(value)) {
      return false;
    }
    return true;
  };

  const handleOnPress = async () => {
    const isPasswordFormatValid = passwordFormat(currentPassword) === true && passwordFormat(newPassword) === true;
    let alertTitle = 'Please try again';
    let alertDetails = '';

    Keyboard.dismiss()

    // const validation = await validate();
    // if (!validation) {
    //   return;
    // }

    if(currentPassword === '' || newPassword === ''){
      alertDetails = 'Fields cannot be left empty!';
      Alert.alert(alertTitle, alertDetails);
      return;
    }

    if(!isPasswordFormatValid){
      alertDetails = 'Password does not follow the specified format!';
      Alert.alert(alertTitle, alertDetails);
      return;
    }

    setIsLoading(true);
    const currentUser = await authStorage.getUser();
    const result = await userApi.changePassword(
      currentUser.email,
      currentPassword,
      newPassword,
    );

    // console.log(result.data);
    if (!result.ok) {
      alertDetails = 'Current password is incorrect!';
      Alert.alert(alertTitle, alertDetails);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // let alertTxt = 'Password changed successfully. Please login again.';
    // Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    // Redirects the user to Welcome screen by logging out after successful password change.
    
    alertTitle = 'Password changed successful';
    alertDetails = 'Please login again';
    Alert.alert(alertTitle, alertDetails);

    authContext.setUser(null);
    await authStorage.removeToken();
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
              dataType='password'
              maxLength={16}
          />

          <SensitiveInputField
              isRequired
              title={'New Password'}
              value={newPassword}
              onChangeText={setNewPassword}
              onEndEditing={handlePasswordError}
              dataType='password'
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
              <ActivityIndicator color={colors.primary_overlay_color} />
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
