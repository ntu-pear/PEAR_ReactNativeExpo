import React, { useContext } from 'react';
import { useState } from 'react';
import { Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import {
  VStack,
  HStack,
  Input,
  FormControl,
  View,
  Icon,
  Box,
  Center,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import userApi from 'app/api/user';
import authStorage from 'app/auth/authStorage';
import AuthContext from 'app/auth/context';
import colors from 'app/config/colors';
import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';
import CustomFormControl from 'app/components/CustomFormControl';

function ChangePasswordScreen(props) {
  const { navigation, route } = props;
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeFailed, setChangeFailed] = useState(false);
  const [error, setError] = useState(' ');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleOldPassword = (e) => {
    setOldPassword(e);
  };

  const handleNewPassword = (e) => {
    setNewPassword(e);
  };

  const onPressConfirm = async () => {
    // TODO: hide visibility of pw...
    setIsLoading(true);
    const currentUser = await authStorage.getUser();
    const result = await userApi.changePassword(
      currentUser.email,
      oldPassword,
      newPassword,
    );
    console.log(result.data);
    if (!result.ok) {
      setIsLoading(false);
      setError(result.data.message);
      return setChangeFailed(true);
    }

    setIsLoading(false);
    setChangeFailed(false);
    Alert.alert('Password changed successfully. Please login again.');
    setUser(null);
    await authStorage.removeToken();
  };

  return (
    <View>
      <VStack>
        <Center>
          <CustomFormControl
            title="Old Password"
            onChangeText={handleOldPassword}
            placeholder="Enter Old Password"
            value={oldPassword}
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
            // type={showOld ? 'text' : 'oldPassword'}
          />

          <CustomFormControl
            title="New Password"
            onChangeText={handleNewPassword}
            placeholder="Enter New Password"
          />
        </Center>

        <Center>
          <Box maxW="70%">
            <ErrorMessage visible={changeFailed} message={error} />
          </Box>
        </Center>

        <View style={styles.buttonsContainer}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary_overlay_color} />
          ) : (
            <AppButton title="Confirm" color="green" onPress={onPressConfirm} />
          )}
        </View>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '50%',
    padding: 30,
    alignSelf: 'flex-start',
  },
});

export default ChangePasswordScreen;
