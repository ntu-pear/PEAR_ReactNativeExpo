// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import {  StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import EditDeleteBtn from './EditDeleteBtn';

const MedicalHistoryItem = ({
  informationSource,
  medicalDetails,
  medicalEstimatedDate,
  medicalRemarks,
  onDelete
}) => {  
  return (
    <View 
      style={[styles.medContainer]}>
      <Icon
        as={
          <MaterialIcons 
          name="info" 
          />
        } 
        size={12}
        color={colors.green}
      >
      </Icon>
      <View style={styles.medTextContainer}>
        {informationSource ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.medText, styles.bold]}>Source: </Text>
              <Text style={[styles.medText]}>{informationSource}</Text>
            </Text>
          </View>
          ): null}
        {medicalDetails ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.medText, styles.bold]}>Details: </Text>
              <Text style={[styles.medText]}>{medicalDetails}</Text>
            </Text>
          </View>
          ): null}
        
        {medicalRemarks ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.medText, styles.bold]}>Remarks: </Text>
              <Text style={[styles.medText]}>{medicalRemarks}</Text>
            </Text>
          </View>
          ): null}
        {medicalEstimatedDate ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.medText, styles.bold]}>Estimated Date: </Text>
              <Text style={[styles.medText]}>{formatDateTime(new Date(medicalEstimatedDate), true)}</Text>
            </Text>
          </View>
          ): null}
      </View>
      <EditDeleteBtn onDelete={onDelete}/>
    </View>
  );
};

const styles = StyleSheet.create({
  medContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.green_lightest,
    padding: 20, 
    borderRadius: 8
  },
  medTextContainer: {
    flex: 1
  },
  heading: {
    marginLeft: 20,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 7,
  },
  medText: {
    marginTop: 4,
    fontSize: 16,
  },
  medTime: {
    fontSize: 20,
    marginLeft: 17,
    marginRight: 15,
  },
  red: {
    color: colors.dark_red
  },
  bold: {
    marginLeft: 20,
    fontWeight: '600',
  },
});

export default MedicalHistoryItem;
