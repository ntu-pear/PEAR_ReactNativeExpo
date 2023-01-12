import React from 'react';
import LottieView from 'lottie-react-native';
// import Lottie from 'react-lottie-player';
import { Platform } from 'react-native';
import { View } from 'native-base';

function ActivityIndicator({ visible = false }) {
  if (!visible) {
    return null;
  }

  return Platform.OS == 'web' ? (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '85vh',
        width: '85vw',
      }}
    >
      {/* <Lottie
        animationData={require('../assets/animations/loading_bouncing_balls_pink.json')}
        loop
        play
      /> */}
    </View>
  ) : (
    <LottieView
      autoPlay
      loop
      source={require('../assets/animations/loading_bouncing_balls_pink.json')}
    />
  );
}

export default ActivityIndicator;
