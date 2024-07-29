// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import {  StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate } from 'app/utility/miscFunctions';
import EditDeleteBtn from './EditDeleteBtn';
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import PropTypes from 'prop-types';

const PrescriptionItem = ({
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
    return (
        <View style={styles.container}>
          <Icon
            as={<FontAwesome5 name="prescription-bottle" />}
            size={12}
            color={colors.green}
          />
          <View style={styles.textContainer}>
            <TextRow label="Date" value={formatDateTime(new Date(date), true)} />
            <TextRow label="Time" value={formatDateTime(new Date(date), false)} />
            <TextRow label="Drug Name" value={prescriptionListDesc} />
            <TextRow label="Dosage" value={dosage} />
            <NumberRow label="Frequency Per Day" value={frequencyPerDay} />
            <TextRow label="Instruction" value={instruction} />
            <TextRow label="Start Date" value={formatDate(new Date(startDate), true)} />
            <TextRow label="End Date" value={formatDate(new Date(endDate), true)} />
            <TextRow label="After Meal" value={afterMeal ? 'Yes' : 'No'} />
            <TextRow label="Remarks" value={prescriptionRemarks} />
            <TextRow label="Chronic" value={isChronic ? 'Yes' : 'No'} />
          </View>
          <EditDeleteBtn onDelete={onDelete} onEdit={onEdit}/>
        </View>
      );
    };

// Helper component for rendering text rows
const TextRow = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  // Helper component for rendering number rows
const NumberRow = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value.toString()}</Text>
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
