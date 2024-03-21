// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import { Alert, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate, formatTimeAMPM, setTimeToZero } from 'app/utility/miscFunctions';

const MedicationItem = ({
  medID,
  patientID,
  patientName,
  medName,
  medDosage,
  medTime,
  medNote,
  medStartDate,
  medEndDate,
  medRemarks,
  editable=false,
  date=new Date()
}) => {  
  // Get user confirmation to save adminstration status of medication
  const onClickAdminister = () => {
    Alert.alert('Confirm medication adminstration', 
    `Patient: ${patientName}\nMedication: ${medName}\nTime: ${formatTimeAMPM(medTime)}`, [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: administerMed},
    ]);
  }

  // Save medicine administration
  const administerMed = () => {
    () => console.log('Administer')
  }

  const canAdminister = () => {
    const tempDate = setTimeToZero(date);
    const today = setTimeToZero(new Date());
    return !((medStartDate && tempDate < medStartDate) 
    || (medEndDate && tempDate > medEndDate)  
    || (tempDate > today || tempDate < today))
  }
  return (
    <View>
      <View 
        style={[styles.medContainer]}>
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
            <View style={{flexDirection: 'row',  marginLeft: 20}}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Remarks: </Text>
                <Text style={[styles.medText]}>{medRemarks}</Text>
              </Text>
            </View>
            ): null}
          {medNote ? (
            <View style={{flexDirection: 'row',  marginLeft: 20}}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Note: </Text>
                <Text style={[styles.medText]}>{medNote}</Text>
              </Text>
            </View>
            ): null}
          
          {medStartDate ? (
            <View style={{flexDirection: 'row',  marginLeft: 20}}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Start Date: </Text>
                <Text style={[styles.medText]}>{formatDate(new Date(medStartDate), true)}</Text>
              </Text>
            </View>
            ): null}
          {medEndDate ? (
            <View style={{flexDirection: 'row',  marginLeft: 20}}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>End Date: </Text>
                <Text style={[styles.medText]}>{formatDate(new Date(medEndDate), true)}</Text>
              </Text>
            </View>
            ): null}
        </View>
        <View>
          <Text style={styles.medTime}>{formatTimeAMPM(medTime)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.administerContainer, {backgroundColor: canAdminister() ? colors.green : colors.light_gray}]} 
        onPress={canAdminister() ? onClickAdminister : ()=>{}}
        activeOpacity={canAdminister() ? null : 1}
      >
        <Text style={styles.medText} color={colors.white}>{canAdminister() ? 'Click to log medicine administration' : 'Cannot administer today'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  medContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.green_lightest,
    padding: 20, 
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
  administerContainer: {
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomLeftRadius: 8, 
    borderBottomRightRadius: 8
  }
});

export default MedicationItem;
