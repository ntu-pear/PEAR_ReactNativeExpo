import React, { useState, useContext, useCallback } from 'react';
import {
  ImageBackground,
  View,
  StyleSheet,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
} from 'react-native';

// Custom Import from https://reactnativeelements.com/docs/
import { Select, Center, Icon, Box } from 'native-base';
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
import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';

// Import Api
import userApi from 'app/api/user';
import LoadingWheel from 'app/components/LoadingWheel';
import InputFieldCommon from 'app/components/InputFieldCommon';


function WelcomeScreen(props) {
  const authContext = useContext(AuthContext);
  const [role, setRole] = useState('Supervisor');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);

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

  const onPressLogin = async () => {
    console.log('Starting login process...\n');
    setIsLoading(true);
    const result = await userApi.loginUser(email, role, password);
    // if returned array is empty or error
    if (!result.ok) {
      console.log('Authentication error');
      setIsLoading(false);
      setLoginFailed(true);
      return;
    }
    console.log('Authenticated...');
    console.log('Storing token...');
    const user = jwt_decode(result.data.data.accessToken);
    await authStorage.storeToken('userAuthToken', result.data.data.accessToken);
    await authStorage.storeToken(
      'userRefreshToken',
      result.data.data.refreshToken,
    );
    // set api header if empty
    console.log('Tokens stored and setting header...');
    apiHandlerHook.setHeader();
    console.log('Header updated...');
    setIsLoading(false);
    setLoginFailed(false);
    console.log('Logging in!');
    authContext.setUser(user);
  };

  const handleEmail = (e) => {
    setEmail(e);
  };

  const handlePassword = (e) => {
    setPassword(e);
  };

  const handleUsernameState = useCallback(
    (state) => {
      setIsUsernameError(state);
    },
    [isUsernameError],
  );

  const handlePasswordState = useCallback(
    (state) => {
      setIsUsernameError(state);
    },
    [isPasswordError],
  );

  return (
    <ImageBackground
      style={styles.background}
      blurRadius={9}
      source={require('../assets/login_background.jpg')}
    >

      <TouchableWithoutFeedback
        onPress={() => {
          if (Platform.OS !== 'web' || navigator.userAgent.includes('Mobile')) {
            Keyboard.dismiss();
          }
        }}
      >
        <View testID={'loginContentContainer'} style={styles.overlay}>
          <Center flex={1} style={styles.formContainer}>
            <View style={styles.credentialsContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/pear_v2.png')}
                  style={styles.logo}
                />
                <Text style={styles.tagLine}>PEAR</Text>
              </View>
              <View style={styles.verticalMargin}>
                <InputFieldCommon
                  testID="username"
                  title="Username/Email"
                  isRequired
                  value={email}
                  showTitle={false}
                  onChangeText={handleEmail}
                  onChildData={handleUsernameState}
                  InputLeftElement={
                    <Icon
                      as={<MaterialIcons name="person" />}
                      size={5}
                      ml="5"
                    />
                  }
                />
              </View>
              <View style={styles.ComponentContainer}>
                <Select
                  accessibilityLabel="Select Role"
                  borderRadius="25"
                  InputLeftElement={
                    <Icon
                      as={<MaterialIcons name="settings" />}
                      size={5}
                      ml="5"
                    />
                  }
                  height="50"
                  minWidth="full"
                  placeholder="Supervisor"
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
              </View>
              <View style={styles.verticalMargin}>
                <InputFieldCommon
                  testID="password"
                  title="Password"
                  autoCapitalize={'none'}
                  isRequired
                  value={password}
                  showTitle={false}
                  onChangeText={handlePassword}
                  InputLeftElement={
                    <Icon
                      as={<MaterialIcons name="lock" />}
                      size={5}
                      ml="5"
                    />
                  }
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
                  type={show ? 'text' : 'password'}
                  onChildData={handlePasswordState}
                  />
                </View>
              <Box>
                <ErrorMessage
                  visible={loginFailed}
                  message={errors.loginError}
                  testID={'loginError'}
                  />
              </Box>
              <View style={styles.buttonsContainer}>
                {isLoading ? (
                  <LoadingWheel />
                  ) : (
                    <AppButton
                    title="Login"
                    color="green"
                    onPress={onPressLogin}
                    testingID="Login"
                    />
                    )}
              </View>
              <View style={''}>
                <Text
                  style={styles.underline}
                  onPress={() => navigation.navigate(routes.RESET_PASSWORD)}
                  >
                  Forgot Password?
                </Text>
              </View>
            </View>
          </Center>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: colors.secondary_overlay_color
  },
  formContainer: {
    paddingHorizontal: 75
  },
  buttonsContainer: {
    width: '100%',
    paddingVertical: 20
  },
  credentialsContainer: {
    backgroundColor: colors.white,
    width: '100%',
    paddingHorizontal: 50,
    paddingTop: 25,
    paddingBottom: 90,
    borderRadius: 25  
  },
  logo: {
    width: 100,
    height: 150,
    tintColor: colors.black,
  },
  logoContainer: {
    padding: 50,
    alignItems: 'center',
  },
  tagLine: {
    fontWeight: 'bold',
    marginTop: 14,
    fontSize: 40,
    color: colors.black,

  },
  underline: {
    textDecorationLine: 'underline',
    alignSelf: 'center'
  },
  ComponentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: '4%',
    justifyContent: 'flex-start',
  },
  Select: {
    fontSize: 16,
    width: '100%',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  verticalMargin: {
    marginTop: '3%'
  }
});

export default WelcomeScreen;
