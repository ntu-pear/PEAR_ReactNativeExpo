import React from 'react';
import { Platform, ActivityIndicator, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import colors from 'app/config/colors';

function EmptyScreen() {
    return (<Text style={styles.redText}>
                Only Supervisor role may access this feature
            </Text>);
}
  
const styles = StyleSheet.create({
redText: {
    alignSelf: "center",
    fontSize: 35,
    color: colors.red,
},
});
  
export default EmptyScreen;