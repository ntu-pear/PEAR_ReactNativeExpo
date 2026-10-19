import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import colors from 'app/config/colors';

function EmptyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.redText}>
        Only Supervisor role may access this feature
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redText: {
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 560,
    color: colors.red,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default EmptyScreen;
