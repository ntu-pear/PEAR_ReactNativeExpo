import React from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useNetInfo } from '@react-native-community/netinfo';

import AppText from 'app/components/AppText';
import colors from 'app/config/colors';

function OfflineNotice(props) {
  const netInfo = useNetInfo();

  // if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
  //   if(!(netInfo.type == 'wifi' && netInfo.isConnected == true && netInfo.details.strength > 0)) {
  //     return (
  //       <View style={styles.container}>
  //         <AppText style={styles.text}>No Internet Connection</AppText>
  //       </View>
  //     );
  //   }
  // }

  //  commented out isInternetReachable as vpn might cause connection to be wonky
  if (netInfo.type !== 'unknown' && !netInfo.isConnected) {
    return (
      <View style={styles.container}>
        <AppText style={styles.text}>No Internet Connection</AppText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    top: Constants.statusBarHeight,
    width: '30%',
    zIndex: 1,
    left: '35%',
    borderRadius: 30,
  },
  text: {
    color: colors.white,
  },
});

export default OfflineNotice;
