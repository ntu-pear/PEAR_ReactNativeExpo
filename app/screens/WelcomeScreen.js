import React, { useState } from "react";
import {
  ImageBackground,
  View,
  StyleSheet,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

// Custom Import from https://reactnativeelements.com/docs/
import { Select, Input, Center, Icon, FormControl, Box } from "native-base";

import { MaterialIcons } from "@expo/vector-icons";

// Constant import
import colors from "../config/colors";
import typography from "../config/typography";
import errors from "../config/errors";

// Import from components
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";
import ErrorMessage from "../components/ErrorMessage";

// Import Api
import userApi from "../api/user";

// Custom Hooks
import useApi from "../hooks/useApi";

function WelcomeScreen(props) {
  /*
   * All States To Be Placed Here
   */
  // React useState hook to manage select list item
  let [role, setRole] = useState("");
  let [show, setShow] = useState(false);
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [loginFailed, setLoginFailed] = useState(true);

  /*
   * All Api to be place here
   */
  const userLoginApi = useApi(userApi.loginUser);

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
    console.log("Logging in...");
    //"Supervisor!23"
    email && role && password && userLoginApi.request(email, role, password);

    if (userLoginApi.error) return setLoginFailed(true);
    console.log(userLoginApi.data);
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
      source={require("../assets/login_background.jpg")}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/pear_v2.png")}
              style={styles.logo}
            />
            <AppText style={styles.tagLine}>PEAR</AppText>
          </View>

          <Center flex={1}>
            <View style={styles.credentialsContainer}>
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
                  Platform.OS === "ios" ? typography.ios : typography.android
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
              />
              <Select
                accessibilityLabel="Select Role"
                bg={colors.gray}
                borderRadius="25"
                color={colors.black}
                fontFamily={
                  Platform.OS === "ios" ? typography.ios : typography.android
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
                  Platform.OS === "ios" ? typography.ios : typography.android
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
                        name={show ? "visibility" : "visibility-off"}
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
                type={show ? "text" : "password"}
              />
            </View>
            <Box>
              {loginFailed ? (
                <ErrorMessage message={errors.loginError} />
              ) : null}
            </Box>
            <View style={styles.buttonsContainer}>
              <AppButton title="Login" color="green" onPress={onPressLogin} />
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
    alignItems: "center",
  },
  buttonsContainer: {
    width: "100%",
    padding: 20,
  },
  credentialsContainer: {
    width: "90%",
  },
  logo: {
    width: 100,
    height: 150,
    tintColor: colors.black,
  },
  logoContainer: {
    top: 100,
    alignItems: "center",
  },
  tagLine: {
    fontWeight: "bold",
    paddingVertical: 800,
    fontSize: 80,
  },
});

export default WelcomeScreen;
