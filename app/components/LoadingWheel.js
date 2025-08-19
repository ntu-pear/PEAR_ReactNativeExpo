// Base
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Configurations
import colors from 'app/config/colors';

function LoadingWheel() {
  return (
    <View style={styles.Container}>
      <ActivityIndicator size="large" color={colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoadingWheel;
