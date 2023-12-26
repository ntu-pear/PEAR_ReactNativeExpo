// Libs
import { Platform, StyleSheet, View, Text } from 'react-native';

// Configurations
import colors from 'app/config/colors';

function RequiredIndicator(){
  return (
    <Text style={styles.RequiredIndicator}> *</Text>
  )
}


const styles = StyleSheet.create({
  RequiredIndicator: {
    color: colors.red,
    fontSize: 18,
  },
});

export default RequiredIndicator;