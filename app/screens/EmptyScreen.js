import React from 'react';
import { Platform, ActivityIndicator, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import colors from 'app/config/colors';

function EmptyScreen() {
    return (<Text style={styles.redText}>
                Access Denied
            </Text>);
}
  
const styles = StyleSheet.create({
redText: {
    alignSelf: "center",
    fontSize: 50,
    color: colors.red,
},
});
  
export default EmptyScreen;