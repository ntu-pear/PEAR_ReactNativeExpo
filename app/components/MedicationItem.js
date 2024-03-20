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
  editable=false
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
          {medRemarks ? (
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.medText, styles.bold]}>Remarks: </Text>
              <Text style={[styles.medText]}>{medRemarks}</Text>
            </View>
            ): null}
          {medNote ? (
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.medText, styles.bold]}>Note: </Text>
              <Text style={[styles.medText]}>{medNote}</Text>
            </View>
            ): null}
          
          {medStartDate ? (
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.medText, styles.bold]}>Start Date: </Text>
              <Text style={[styles.medText]}>{formatDate(new Date(medStartDate), true)}</Text>
            </View>
            ): null}
          {medEndDate ? (
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.medText, styles.bold]}>End Date: </Text>
              <Text style={[styles.medText]}>{formatDate(new Date(medEndDate), true)}</Text>
            </View>
            ): null}
        </View>
        <View>
          <Text style={styles.medTime}>{formatTimeAMPM(medTime)}</Text>
          {/* {editable ? () : } */}
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

export default MedicationItem;
