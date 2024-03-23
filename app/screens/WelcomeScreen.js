// Libs
import React, { useState, useContext, useEffect, useCallback } from 'react';
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
import { Center, Icon, Box } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode';
import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';

// Configurations
import errors from 'app/config/errors';

// Navigation
import routes from 'app/navigation/routes';

// Hooks
import useApiHandler from 'app/hooks/useApiHandler';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions'

// APIs
import userApi from 'app/api/user';

// Components
import AppButton from 'app/components/AppButton';
import ErrorMessage from 'app/components/ErrorMessage';
import LoadingWheel from 'app/components/LoadingWheel';
import InputField from 'app/components/input-components/InputField';
import SensitiveInputField from 'app/components/input-components/SensitiveInputField';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import colors from 'app/config/colors';

function WelcomeScreen(props) {
  const { navigation } = props;
  const apiHandlerHook = useApiHandler();
  
  // User auth context
  const authContext = useContext(AuthContext);

  // States for input field values
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('Supervisor');
  const [password, setPassword] = useState('');

  // States related to API call
  const [isLoading, setIsLoading] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);
  
  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  
  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isUsernameError ||
      isPasswordError
    );
  }, [
      isUsernameError,
      isPasswordError,
  ]);
  
  // User roles for select field
  const listOfUserRoles = parseSelectOptions(['Supervisor', 'Guardian', 'Doctor', 'Caregiver', 'Nurse']);
  
  // Start login process when user presses login button
  const onPressLogin = async () => {
    console.log('Starting login process...',username,userRole,password);
    Keyboard.dismiss()
    
    setIsLoading(true);
    setIsError(false);    
    
    const result = await loginWithTimeout();

    if(result && result.ok) {
      console.log('User authenticated - storing tokens...');

      // Store token refresh and access tokens returned by backend
      const user = jwt_decode(result.data.data.accessToken);
      await authStorage.storeToken('userAuthToken', result.data.data.accessToken);
      await authStorage.storeToken(
        'userRefreshToken',
        result.data.data.refreshToken,
      );
  
      // set api header if empty
      console.log('Setting header...');
      apiHandlerHook.setHeader();
      console.log('Header updated...');
      setIsLoading(false);
      setIsError(false);
      setIsError(false);
      setStatusCode(result.status);
      setErrorMsg('');
      console.log('Logging in!');
      authContext.setUser(user);
    } else if(result && !result.ok){
      console.log('Error:', result);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(result.status);
      setErrorMsg(errors.loginError);
      return;
    }
  };
  
  // If user is not connected to NTU network, takes about 30 seconds for call to return
  // Instead timeout in 5 seconds
  const loginWithTimeout = async() => {
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out. Ensure you are connected to the NTU network.'));
      }, 5000);
    });

    const apiPromise = userApi.loginUser(username, userRole, password);
    
    try {
      const result = await Promise.race([apiPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.log('Error:', error.message);
      setIsLoading(false);
      setIsError(true);
      setErrorMsg(error.message);
    }
  }

  const handleUsernameError = useCallback(
    (state) => {
      setIsUsernameError(state);
    },
    [isUsernameError],
  );

  const handlePasswordError = useCallback(
    (state) => {
      setIsPasswordError(state);
    },
    [isPasswordError],
  );    

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
          <Center flex={1} style={styles.formContainer} >
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
                  onChangeText={setUsername}
                  onEndEditing={handleUsernameError}
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
                  testID="role"
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
                  onDataChange={(e)=>setUserRole(listOfUserRoles[e-1].label)}
                  dataArray={listOfUserRoles}
                />
              </View>
              <View style={styles.inputContainer}>
                <SensitiveInputField
                  testID="password"
                  isRequired
                  showTitle={false}
                  title="Password"
                  value={password}
                  onChangeText={setPassword}
                  onEndEditing={handlePasswordError}
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
                      title="login"
                      color="green"
                      onPress={onPressLogin}
                      testID="login"
                      isDisabled={isInputErrors}                   
                    />
                  )}
              </View>
              <Box>
                {isError ? (
                <ErrorMessage
                  message={errorMsg}
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