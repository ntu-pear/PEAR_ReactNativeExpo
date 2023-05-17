import React, { useState, useContext } from 'react';
import {
  ImageBackground,
  View,
  StyleSheet,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Text,
} from 'react-native';

// Custom Import from https://reactnativeelements.com/docs/
import { Select, Input, Center, Icon, Box } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode';
import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';

// Constant import
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import errors from 'app/config/errors';
import useApiHandler from 'app/hooks/useApiHandler';
import routes from 'app/navigation/routes';

// Import from components
import AppText from 'app/components/AppText';
import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';

// Import Api
import userApi from 'app/api/user';

function WelcomeScreen(props) {
  /*
   * All States To Be Placed Here
   */
  const authContext = useContext(AuthContext);
  const [role, setRole] = useState('Supervisor');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiHandlerHook = useApiHandler();

  /*
   * All Api to be place here
   */

  /*
   * Component Did Mount or useEffect() to be placed here
   */

  /*
   * Deconstructor
   * Note: Navigation is passed down as a prop from NativeStackNavigator
   */
  const { navigation } = props;

  /*
   * All Functions To Be Placed Here
   */
  const onPressLogin = async () => {
    // "Supervisor!23"
    setIsLoading(true);
    const result = await userApi.loginUser(email, role, password);
    console.log('logging in!');
    console.log(result);
    // userLoginApi.request(email, role, password);
    // if returned array is empty or error
    console.log(result);
    if (!result.ok) {
      setIsLoading(false);
      return setLoginFailed(true);
    }
    /*
    "data": Object {
      "data": Object {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJCMjI2OThCOC00MkEyLTQxMTUtOTYzMS0xQzJEMUUyQUM1RjQiLCJyb2xlIjoiU3VwZXJ2aXNvciIsInN1YiI6Ikplc3NpY2EgU2ltIiwiZW1haWwiOiJqZXNzQGdtYWlsLmNvbSIsImp0aSI6IjJiMGRiYzUyLTY1NjctNGU3Zi1hOTYzLWVkNjBkOTI3OWRhOSIsIm5iZiI6MTY4NDEyNDM5OCwiZXhwIjoxNjg0MTMxNjA4LCJpYXQiOjE2ODQxMjQ0MDgsImlzcyI6Imh0dHBzOi8vY29yZW12Yy5meXAyMDE3LmNvbS8iLCJhdWQiOiJodHRwczovL2NvcmVtdmMuZnlwMjAxNy5jb20vIn0.QyOmXJu70IMb3B4V34K0sFYWu_G2dUyBNMcGMgRNYx4",
        "error": null,
        "refreshToken": "qru284If4moGc1HYv1PqIVJIRAneqHdAB3Bfeeb5cda-c4a9-4b1a-93ea-ec5d1a9ce387",
        "success": true, */
    const user = jwt_decode(result.data.data.accessToken);
    authContext.setUser(user);
    // Replace the old token (if any) with the new one
    // await authStorage.removeToken();
    await authStorage.storeToken('userAuthToken', result.data.data.accessToken);
    await authStorage.storeToken(
      'userRefreshToken',
      result.data.data.refreshToken,
    );
    // set api header if empty
    apiHandlerHook.setHeaderIfEmpty();
    setIsLoading(false);
    setLoginFailed(false);
  };

  const handleEmail = (e) => {
    setEmail(e);
  };

  const handlePassword = (e) => {
    setPassword(e);
  };

  return (
    <ImageBackground
      style={styles.background}
      blurRadius={8}
      source={require('../assets/login_background.jpg')}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          // Prevent keyboard dismiss for desktop web only
          if (Platform.OS !== 'web' || navigator.userAgent.includes('Mobile')) {
            Keyboard.dismiss();
          }
        }}
      >
        <View>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/pear_v2.png')}
              style={styles.logo}
            />
            <AppText style={styles.tagLine}>PEAR</AppText>
          </View>

          <Center flex={1}>
            <View
              style={
                Platform.OS === 'web'
                  ? styles.credentialsContainerWeb
                  : styles.credentialsContainer
              }
            >
              <Input
                autoCapitalize="none"
                bg={colors.gray}
                borderRadius="25"
                color={colors.black}
                _focus={{
                  bg: `${colors.lighter}`,
                  borderColor: `${colors.secondary}`,
                }}
                fontFamily={
                  Platform.OS === 'ios' ? typography.ios : typography.android
                }
                height="50"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="person" />}
                    size={5}
                    ml="5"
                    color={colors.black}
                  />
                }
                onChangeText={handleEmail}
                placeholder="jess@gmail.com"
                placeholderTextColor={colors.medium}
                marginBottom="5"
                size="18"
                value={email}
              />
              <Select
                accessibilityLabel="Select Role"
                bg={colors.gray}
                borderRadius="25"
                color={colors.black}
                fontFamily={
                  Platform.OS === 'ios' ? typography.ios : typography.android
                }
                height="50"
                minWidth="full"
                minHeight="3%"
                placeholder="Supervisor"
                placeholderTextColor={colors.black}
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
              <Input
                autoCapitalize="none"
                bg={colors.gray}
                borderRadius="25"
                color={colors.black}
                fontFamily={
                  Platform.OS === 'ios' ? typography.ios : typography.android
                }
                _focus={{
                  bg: `${colors.lighter}`,
                  borderColor: `${colors.secondary}`,
                }}
                height="50"
                InputRightElement={
                  <Icon
                    as={
                      <MaterialIcons
                        name={show ? 'visibility' : 'visibility-off'}
                      />
                    }
                    color={colors.black}
                    mr="5"
                    onPress={() => setShow(!show)}
                    size={5}
                  />
                }
                onChangeText={handlePassword}
                placeholder="Password"
                placeholderTextColor={colors.medium}
                marginTop="5"
                size="18"
                value={password}
                type={show ? 'text' : 'password'}
              />
            </View>
            <Box
              style={Platform.OS === 'web' ? styles.errorsContainerWeb : null}
            >
              <ErrorMessage visible={loginFailed} message={errors.loginError} />
            </Box>
            <View
              style={
                Platform.OS === 'web'
                  ? styles.buttonsContainerWeb
                  : styles.buttonsContainer
              }
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary_overlay_color} />
              ) : (
                <AppButton title="Login" color="green" onPress={onPressLogin} />
              )}
            </View>
            <View style={Platform.OS === 'web' ? { top: 130 } : ''}>
              <Text
                style={styles.underline}
                onPress={() => navigation.navigate(routes.RESET_PASSWORD)}
              >
                Forgot Password?
              </Text>
            </View>
          </Center>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    padding: 20,
  },
  buttonsContainerWeb: {
    top: 130,
    width: '100%',
    padding: 20,
  },
  credentialsContainer: {
    width: '90%',
  },
  credentialsContainerWeb: {
    top: 130,
    width: '90%',
  },
  errorsContainerWeb: {
    top: 130,
  },
  logo: {
    width: 100,
    height: 150,
    tintColor: colors.black,
  },
  logoContainer: {
    top: 100,
    alignItems: 'center',
  },
  tagLine: {
    fontWeight: 'bold',
    paddingVertical: 800,
    fontSize: 80,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  underlineWeb: {
    top: 130,
  },
});

export default WelcomeScreen;
