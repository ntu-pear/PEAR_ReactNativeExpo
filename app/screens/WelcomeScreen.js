import React from "react";
import { ImageBackground, View, StyleSheet, Image} from "react-native";
import colors  from '../config/colors';

function WelcomeScreen(props) {
  return (
    <ImageBackground
      style={styles.background}
      blurRadius={10}
      source={require("../assets/login_background.jpg")}
    >
      <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/pear_v2.png')}
            style={styles.logo}

          />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center"
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
});

export default WelcomeScreen;
