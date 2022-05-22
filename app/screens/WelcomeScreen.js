import React from "react";
import { ImageBackground, View, StyleSheet, Image } from "react-native";

// Custom Import from https://reactnativeelements.com/docs/components/listitem


// Constant import
import colors from "../config/colors";

// Import from components
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";

function WelcomeScreen(props) {
  const onPressLogin = () => {
    // TODO: Auth on login here
    console.log("Clicking");
  };

  return (
    <ImageBackground
      style={styles.background}
      blurRadius={8}
      source={require("../assets/login_background.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/pear_v2.png")} style={styles.logo} />
        <AppText style={styles.tagLine}>PEAR</AppText>
        {/* <AppText style={styles.tagLine}>Where We</AppText>
        <AppText style={styles.tagLine}>Care</AppText> */}
      </View>

      <View style={styles.credentialsContainer}></View>

      <View style={styles.buttonsContainer}>
        <AppButton title="Login" color="green" onPress={onPressLogin} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonsContainer: {
    width: "100%",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 150,
    tintColor: colors.black,
  },
  logoContainer: {
    top: 100,
    position: "absolute",
    alignItems: "center",
  },
  tagLine: {
    fontWeight: "bold",
    paddingVertical: 800,
    fontSize: 80,
  },
});

export default WelcomeScreen;
