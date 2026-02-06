import React from 'react';
// import LottieView from 'lottie-react-native';
import { Platform, StyleSheet, View } from 'react-native';

let LottieView;
if (Platform.OS === 'web') {
  LottieView = require('react-native-web-lottie').default;
} else {
  LottieView = require('lottie-react-native');
}

function ActivityIndicator({ visible = false }) {
  if (!visible) {
    return null;
  }

  // Lottie for web: https://github.com/react-native-web-community/react-native-web-lottie
  return (
    <View style={styles.overlay}>
      <LottieView
        testID="activityIndicator"
        autoPlay
        loop
        source={require('../assets/animations/loading_bouncing_balls_pink.json')}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 150,
    height: 150,
  },
});

export default ActivityIndicator;
