import React from 'react';
import { View, StyleSheet, Text, Platform, Image } from 'react-native';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

const MessageDisplayCard = ({ TextMessage, topPaddingSize }) => {
  return (
    <View style={styles.mainContainer} paddingTop={topPaddingSize}>
      <Image source={require('../assets/pear_v2.png')} style={styles.logo} />
      <Text style={styles.errorText}>{TextMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
    tintColor: colors.black,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default MessageDisplayCard;
