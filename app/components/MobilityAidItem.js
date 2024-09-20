// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import {  StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate } from 'app/utility/miscFunctions';
import EditDeleteBtn from './EditDeleteBtn';

const MobilityAidItem = ({
  testID='',
  mobilityRemarks,
  mobilityListDesc,
  isRecovered,
  date,
  onDelete,
  onEdit
}) => {  
    return (
        <View testID={testID} style={styles.container}>
          <Icon
            as={<MaterialCommunityIcons name="wheelchair-accessibility" />}
            size={12}
            color={colors.green}
          />
          <View style={styles.textContainer}>
            <TextRow testID={`${testID}_mobilityAid`} label="Mobility Aid" value={mobilityListDesc} />
            <TextRow testID={`${testID}_mobilityRemarks`} label="Remark" value={mobilityRemarks} />
            <TextRow testID={`${testID}_condition`} label="Condition" value={isRecovered ? 'Fully Recovered' : 'Not Recovered'} />
            <TextRow
              label="Date"
              value={formatDate(new Date(date), true)}
            />
          </View>
          <EditDeleteBtn testID={testID} onDelete={onDelete} onEdit={onEdit}/>
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

export default MobilityAidItem;
