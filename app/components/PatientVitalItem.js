import React from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate } from 'app/utility/miscFunctions';
import EditDeleteBtn from './EditDeleteBtn';

const PatientVitalItem = ({
  temperature,
  weight,
  height,
  systolicBP,
  diastolicBP,
  heartRate,
  spO2,
  bloodSugarlevel,
  vitalRemarks,
  createdDateTime,
  afterMeal,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      <Icon
        as={<FontAwesome5 name="heartbeat" />}
        size={12}
        color={colors.green}
      />
      <View style={styles.textContainer}>
        <TextRow label="Temperature" value={`${temperature}°C`} />
        <TextRow label="Systolic BP" value={`${systolicBP} mmHg`} />
        <TextRow label="Diastolic BP" value={`${diastolicBP} mmHg`} />
        <TextRow label="Heart Rate" value={`${heartRate} bpm`} />
        <TextRow label="SpO2" value={`${spO2}%`} />
        <TextRow label="Blood Sugar" value={`${bloodSugarlevel} mg/dL`} />
        <TextRow label="Height" value={`${height} cm`} />
        <TextRow label="Weight" value={`${weight} kg`} />
        <TextRow label="After Meal" value={afterMeal ? 'Yes' : 'No'} />
        <TextRow label="Remarks" value={vitalRemarks} />
        <TextRow
          label="Created"
          value={formatDate(new Date(createdDateTime), true)}
        />
      </View>
      <EditDeleteBtn onDelete={onDelete}/>
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

export default PatientVitalItem;
