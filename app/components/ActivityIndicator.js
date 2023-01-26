import React from 'react';
import LottieView from 'lottie-react-native';

function ActivityIndicator({ visible = false }) {
  if (!visible) {
    return null;
  }

  // Lottie for web: https://github.com/react-native-web-community/react-native-web-lottie
  return (
    <LottieView
      autoPlay
      loop
      source={require('../assets/animations/loading_bouncing_balls_pink.json')}
    />
  );
}

export default ActivityIndicator;
