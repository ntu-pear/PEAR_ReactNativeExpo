// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate, formatTimeAMPM } from 'app/utility/miscFunctions';

const MedicationItem = ({
  medName,
  medDosage,
  medTime,
  medNote,
  medStartDate,
  medEndDate,
  medRemarks,
}) => {  
  return (
    <View 
      style={styles.medContainer}>
        <Icon
          as={
            <MaterialIcons 
            name="medical-services" 
            />
          } 
          size={12}
          color={colors.green}
        >
        </Icon>
        <View style={styles.medTextContainer}>
          <Text style={styles.heading}>{medName} ({medDosage})</Text>
          {medRemarks != undefined ? (
            <Text style={[styles.medText]}>Remarks: {medRemarks}</Text>
            ): null}
          {medNote != undefined ? (
            <Text style={[styles.medText, styles.red]}>Note: {medNote}</Text>
            ): null}
          {medStartDate != undefined ? (
            <Text style={[styles.medText]}>Start Date: {formatDate(new Date(medStartDate), true)}</Text>
            ): null}
          {medEndDate != undefined ? (
            <Text style={[styles.medText]}>End Date: {formatDate(new Date(medEndDate), true)}</Text>
            ): null}
        </View>
        <View>
          <Text style={styles.medTime}>{formatTimeAMPM(medTime)}</Text>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  medContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.green_lightest, 
    padding: 20, 
    borderRadius: 7,
    marginTop: 20,
  },
  medTextContainer: {
    flex: 1
  },
  heading: {
    marginLeft: 20,
    fontSize: 19,
    fontWeight: '600',
  },
  medText: {
    marginTop: 4,
    marginLeft: 20,
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
});

export default MedicationItem;
