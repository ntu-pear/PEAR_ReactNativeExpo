import React from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate } from 'app/utility/miscFunctions';

const DoctorNoteItem = ({
  date,
  doctorName,
  doctorRemarks,
}) => {
  return (
    <View style={styles.container}>
      <Icon
        as={<FontAwesome5 name="notes-medical" />}
        size={12}
        color={colors.green}
      />
      <View style={styles.textContainer}>
        <TextRow label="Doctor" value={doctorName} />
        <TextRow label="Remarks" value={doctorRemarks} />
        <TextRow
          label="Created"
          value={formatDate(new Date(date), true)}
        />
      </View>
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
    color: colors.alert,
    marginRight: 5,
  },
  value: {
    fontWeight: 'normal',
    color: colors.text,
  },
});

export default DoctorNoteItem;
