import React from 'react';
// import LottieView from 'lottie-react-native';
import { Platform } from 'react-native';

let LottieView;
if (Platform.OS === 'web') {
  LottieView = require('react-native-web-lottie').default;
} else {
  LottieView = require('lottie-react-native').default;
}

function ActivityIndicator({ visible = false }) {
  if (!visible) {
    return null;
  }

  // Lottie for web: https://github.com/react-native-web-community/react-native-web-lottie
  return (
    <LottieView
      testID="activityIndicator"
      autoPlay
      loop
      source={require('../assets/animations/loading_bouncing_balls_pink.json')}
    />
  );
}

export default ActivityIndicator;
