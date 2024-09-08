import React from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import EditDeleteBtn from './EditDeleteBtn';

const PatientAllergyItem = ({
  createdDate,
  allergyListDesc,
  allergyReaction,
  allergyRemarks,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      <Icon
        as={<MaterialCommunityIcons name="allergy" />}
        size={12}
        color={colors.green}
      />
      <View style={styles.textContainer}>
        <TextRow label="Date" value={formatDateTime(new Date(createdDate), true)}/>
        <TextRow label="Time" value={formatDateTime(new Date(createdDate), false)}/>
        <TextRow label="Allergic To" value={allergyListDesc} />
        <TextRow label="Reaction" value={allergyReaction} />
        <TextRow label="Notes" value={allergyRemarks} />
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

export default PatientAllergyItem;
