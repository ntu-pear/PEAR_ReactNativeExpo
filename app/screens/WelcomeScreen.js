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
import { Select, Input, Center, Icon } from "native-base";

import { MaterialIcons } from "@expo/vector-icons";

// Constant import
import colors from "../config/colors";
import typography from "../config/typography";

// Import from components
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";

// Import Api
import userApi from "../api/user";

// Custom Hooks
import useApi from "../hooks/useApi";

function WelcomeScreen(props) {
  /*
   * All States To Be Placed Here
   */
  // React useState hook to manage select list item
  let [service, setService] = useState("");
  let [show, setShow] = useState(false);

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
    // TODO: Auth on login here
    console.log("Clicking");
    // TODO: Push to
    // navigation.navigate(routes.REGISTER);
    userLoginApi.request("jess@gmail.com", "Supervisor", "Supervisor!23");
    console.log(userLoginApi.data);
    console.log(userLoginApi.error);
    console.log(userLoginApi.loading);
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
                placeholder="jess@gmail.com"
                bg={colors.gray}
                placeholderTextColor={colors.medium}
                color={colors.black}
                _focus={{
                  bg: `${colors.lighter}`,
                  borderColor: `${colors.secondary}`,
                }}
                color={colors.black}
                borderRadius="25"
                height="50"
                size="18"
                fontFamily={
                  Platform.OS === "ios" ? typography.ios : typography.android
                }
                marginBottom="5"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="person" />}
                    size={5}
                    ml="5"
                    color={colors.black}
                  />
                }
              />
              <Select
                selectedValue={service}
                accessibilityLabel="Select Role"
                placeholder="Supervisor"
                placeholderTextColor={colors.black}
                minWidth="full"
                minHeight="3%"
                color={colors.black}
                onValueChange={(itemValue) => setService(itemValue)}
                bg={colors.gray}
                borderRadius="25"
                height="50"
                size="18"
                fontFamily={
                  Platform.OS === "ios" ? typography.ios : typography.android
                }
              >
                <Select.Item label="Supervisor" value="supervisor" />
                <Select.Item label="Guardian" value="guardian" />
                <Select.Item label="Doctor" value="doctor" />
                <Select.Item label="Caregiver" value="caregiver" />
                <Select.Item label="Nurse" value="nurse" />
              </Select>
              <Input
                placeholder="Password"
                bg={colors.gray}
                placeholderTextColor={colors.medium}
                color={colors.black}
                _focus={{
                  bg: `${colors.lighter}`,
                  borderColor: `${colors.secondary}`,
                }}
                color={colors.black}
                borderRadius="25"
                height="50"
                size="18"
                fontFamily={
                  Platform.OS === "ios" ? typography.ios : typography.android
                }
                marginTop="5"
                type={show ? "text" : "password"}
                InputRightElement={
                  <Icon
                    as={
                      <MaterialIcons
                        name={show ? "visibility" : "visibility-off"}
                      />
                    }
                    size={5}
                    mr="5"
                    color={colors.black}
                    onPress={() => setShow(!show)}
                  />
                }
              />
            </View>
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
