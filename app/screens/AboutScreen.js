import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { Center } from 'native-base';

function AboutScreen() {
  return (
    <View>
      <Center>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/pear_v2.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>
            You have downloaded the latest version of PEAR.
            {'\n\n\n'}
            Version: 1.0.0
            {'\n\n'}
            Build Date: 18 August 2018
          </Text>
        </View>
      </Center>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 150,
    tintColor: colors.black,
  },
  logoContainer: {
    top: 100,
    alignItems: 'center',
  },
  text: {
    paddingTop: 100,
    fontSize: 20,
    maxWidth: 300,
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },
});

export default AboutScreen;
