// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import {  StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import EditDeleteBtn from './EditDeleteBtn';
import formatDateTime from 'app/hooks/useFormatDateTime.js';

const PrescriptionItem = ({
  testID='',
  date,
  prescriptionListDesc,
  dosage,
  frequencyPerDay,
  instruction,
  startDate,
  endDate,
  afterMeal,
  prescriptionRemarks,
  isChronic,
  onDelete,
  onEdit
}) => {  

   // Get the current date and set time to midnight for comparison
   const currentDate = new Date();
 
   // Parse the endDate from props
   const endDateObj = new Date(endDate);
 
   // Determine if editing is allowed
   const canEdit = endDateObj > currentDate;
    return (
        <View testID={testID} style={styles.container}>
          <Icon
            as={<FontAwesome5 name="prescription-bottle" />}
            size={12}
            color={colors.green}
          />
          <View style={styles.textContainer}>
            <TextRow testID={`${testID}_created_date`} label="Date" value={formatDateTime(new Date(date), true)} />
            <TextRow testID={`${testID}_created_time`} label="Time" value={formatDateTime(new Date(date), false)} />
            <TextRow testID={`${testID}_prescription`} label="Drug Name" value={prescriptionListDesc} />
            <TextRow testID={`${testID}_dosage`} label="Dosage" value={dosage} />
            <NumberRow testID={`${testID}_frequency`} label="Frequency Per Day" value={frequencyPerDay.toString()} />
            <TextRow testID={`${testID}_instruction`} label="Instruction" value={instruction} />
            <TextRow testID={`${testID}_start_date`} label="Start Date" value={formatDateTime(new Date(startDate), true)} />
            <TextRow testID={`${testID}_end_date`} label="End Date" value={formatDateTime(new Date(endDate), true)} />
            <TextRow testID={`${testID}_meal`} label="After Meal" value={afterMeal ? 'Yes' : 'No'} />
            <TextRow testID={`${testID}_remarks`} label="Remarks" value={prescriptionRemarks} />
            <TextRow testID={`${testID}_chronic`} label="Chronic" value={isChronic ? 'Yes' : 'No'} />
          </View>
          <EditDeleteBtn testID={testID} onDelete={onDelete} onEdit={canEdit ? onEdit : null}/>
        </View>
      );
    };

// Helper component for rendering text rows
const TextRow = ({ testID, label, value }) => (
    <View style={styles.row}>
      <Text testID={`${testID}_label`} style={styles.label}>{label}:</Text>
      <Text testID={`${testID}_value`} style={styles.value}>{value}</Text>
    </View>
  );

  // Helper component for rendering number rows
const NumberRow = ({ testID, label, value }) => (
    <View style={styles.row}>
      <Text testID={`${testID}_label`} style={styles.label}>{label}:</Text>
      <Text testID={`${testID}_value`} style={styles.value}>{value.toString()}</Text>
    </View>
  );

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.green_lightest,
      padding: 20,
      borderRadius: 8,
    },
    textContainer: {
      marginLeft: 20,
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    label: {
      fontWeight: 'bold',
      color: colors.alert, // Adjust this color to match your theme
      marginRight: 5,
    },
    value: {
      fontWeight: 'normal',
      color: colors.text, // Adjust this color to match your theme
    },
  });

export default PrescriptionItem;
