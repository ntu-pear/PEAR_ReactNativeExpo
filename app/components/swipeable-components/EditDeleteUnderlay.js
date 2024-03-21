// Libs
import React from 'react';
import { Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

const EditDeleteUnderlay = () => {
  return (
    <View style={styles.underlayContainer}>
      <View backgroundColor={colors.green} style={styles.underlay} alignItems='flex-start'>
        <Icon 
          as={
            <MaterialIcons 
            name="edit" 
            />
          } 
          size={12}
          color={colors.white}
          marginLeft={'10%'}
        />
      </View>
      <View backgroundColor={colors.red} style={styles.underlay} alignItems='flex-end'>
        <Icon 
          as={
            <MaterialIcons 
            name="delete" 
            />
          } 
          size={12}
          color={colors.white}
          marginRight={'10%'}
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
  },
  underlay: {
    width: '50%',
    height: '100%',
    justifyContent: 'center'
  },
});

export default EditDeleteUnderlay;
