import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { Center } from 'native-base';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import buildIdentity from 'app/config/generatedBuildIdentity.json';

function AboutScreen(props) {
  const { sidebar } = props;

  return (
    <View
      style={
        Platform.OS === 'web'
          ? {
              display: 'flex',
              alignItems: 'center',
              width: sidebar ? '83vw' : '100vw',
            }
          : {}
      }
    >
      <Center>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/pear_v2.png')}
            style={styles.logo}
          />
          <Text style={styles.text} testID="about_installed_build_identity">
            PEAR Mobile App.
            {'\n\n\n'}
            Version: {Constants.nativeAppVersion || 'Unavailable'}
            {'\n'}
            Build: {Constants.nativeBuildVersion || 'Unavailable'}
            {'\n\n'}
            Build Date: {buildIdentity.buildDate || 'Unavailable'}
            {'\n'}
            Source:{' '}
            {buildIdentity.sourceDirty ? 'Uncommitted changes based on ' : ''}
            {buildIdentity.sourceCommit?.slice(0, 12) || 'Unavailable'}
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
    //whiteSpace: 'pre-line',
  },
});

export default AboutScreen;
