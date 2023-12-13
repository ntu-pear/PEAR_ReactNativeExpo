import React, { useState, useContext } from 'react';
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
import { Center, Icon, Box } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode';
import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';

// Constant import
import colors from 'app/config/colors';
import errors from 'app/config/errors';
import useApiHandler from 'app/hooks/useApiHandler';
import routes from 'app/navigation/routes';

// Import from components
import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';

// Import from utility
import { parseSelectOptions } from 'app/utility/miscFunctions'

// Import Api
import userApi from 'app/api/user';
import LoadingWheel from 'app/components/LoadingWheel';
import InputField from 'app/components/input-fields/InputField';
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import SensitiveInputField from 'app/components/input-fields/SensitiveInputField';


function WelcomeScreen(props) {
  const authContext = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('Supervisor');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

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
    Keyboard.dismiss()
    
    setIsLoading(true);
    setIsLoginError(false);    
    
    const result = await userApi.loginUser(username, userRole, password);

    // if authentication unsucessful (returned array is empty or error)
    if (!result.ok) {
      console.log('Authentication error');
      setIsLoading(false);
      setIsLoginError(true);
      return;
    }

    // if authentication successful
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
    setIsLoginError(false);
    console.log('Logging in!');
    authContext.setUser(user);
  };

  const handleUsernameChanged = (e) => {
    setUsername(e);
  };
  
  const handleUserRoleChanged = (e) => {
    setUserRole(userRoles[e-1])
  }

  const handlePasswordChanged = (e) => {
    setPassword(e);
  };

  const handleUsernameError = (e) => {
    setIsUsernameError(e)
  }

  const handlePasswordError = (e) => {
    setIsPasswordError(e)
  }
    
  const userRoles = ['Supervisor', 'Guardian', 'Doctor', 'Caregiver', 'Nurse']

  return (
    <ImageBackground
      style={styles.background}
      blurRadius={9}
      source={require('../assets/login_background.jpg')}
    >
      <View style={styles.vignette} />

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
              <View style={styles.inputContainer}>
                <InputField
                  testID="username"
                  autoCapitalize='none'
                  isRequired
                  showTitle={false}
                  title="Username/Email"
                  value={username}
                  onChangeText={handleUsernameChanged}
                  onChildData={handleUsernameError}
                  InputLeftElement={
                    <Icon
                      as={<MaterialIcons name="person" />}
                      size={5}
                      ml="5"
                    />
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <SelectionInputField
                  isRequired
                  showTitle={false}
                  title="Select Role"
                  inputLeftElement={
                    <Icon
                      as={<MaterialIcons name="settings" />}
                      size={5}
                      ml="5"
                    />
                  }
                  placeholder="Supervisor"
                  onDataChange={handleUserRoleChanged}
                  dataArray={parseSelectOptions(userRoles)}
                />
              </View>
              <View style={styles.inputContainer}>
                <SensitiveInputField
                  testID="password"
                  isRequired
                  showTitle={false}
                  title="Password"
                  value={password}
                  onChangeText={handlePasswordChanged}
                  onChildData={handlePasswordError}
                  InputLeftElement={
                    <Icon
                      as={<MaterialIcons name="lock" />}
                      size={5}
                      ml="5"
                    />
                  }
                  />
                </View>
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
              <Box>
                {isLoginError ? (
                <ErrorMessage
                  message={isLoginError ? errors.loginError: ''}
                  testID={'loginError'}
                  />
                ) : null }
              </Box>
              <View>
                <Text
                  style={styles.forgotPassword}
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
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overlay: {
    backgroundColor: colors.secondary_overlay_color
  },
  formContainer: {
    paddingHorizontal: 75
  },
  buttonsContainer: {
    width: '100%',
    paddingVertical: 8
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
  forgotPassword: {
    textDecorationLine: 'underline',
    alignSelf: 'center',
    marginTop: "3%"
  },
  inputContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: '3%'
  }
});

export default WelcomeScreen;