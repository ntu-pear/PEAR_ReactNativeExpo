// Libs
import React from 'react';
import { Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

const EditDeleteUnderlay = (testID) => {
  return (
    <View style={styles.underlayContainer}>
      <View testID={`${testID}_edit`} backgroundColor={colors.green} style={styles.underlay}>
        <Icon 
          as={
            <MaterialIcons 
            name="edit" 
            />
          } 
          size={12}
          color={colors.white}
        />
      </View>
      <View testID={`${testID}_delete`} backgroundColor={colors.red} style={styles.underlay}>
        <Icon 
          as={
            <MaterialIcons 
            name="delete" 
            />
          } 
          size={12}
          color={colors.white}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  underlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between'
  },
  underlay: {
    width: 150,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default EditDeleteUnderlay;
