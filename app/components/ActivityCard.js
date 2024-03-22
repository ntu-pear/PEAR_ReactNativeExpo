// Libs
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { View } from 'native-base';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatTimeHM24 } from 'app/utility/miscFunctions';

// Components
import MedicationModal from './MedicationModal';

const ActivityCard = ({
  activityTitle,
  activityStartTime,
  activityEndTime,
  currentTime,
  medications,
  patientName,
  patientID, 
  date,
  navigation,
}) => {

  // State to toggle modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Check if current time falls during an activity
  const isCurrentActivity = () => {
    return activityStartTime > currentTime || currentTime < activityEndTime
  };

  return (
    <>
      <TouchableOpacity 
        onPress={medications.length > 0 ? ()=>setIsModalVisible(true) : () => {}}
        style={[styles.activityContainer,
          isCurrentActivity()
          ? styles.activityContainerGreen
          : styles.activityContainerGray
        ]}
        activeOpacity={medications.length > 0 ? null : 1}
        >
          <View style={{marginTop: 4}}>
            <Text style={[styles.activityTitle, isCurrentActivity() ? styles.darkText : styles.lightText]}>{activityTitle}</Text>
            <Text style={[styles.activityTime, isCurrentActivity() ? styles.darkText : styles.lightText]}>
              {formatTimeHM24(activityStartTime)}
              -{' '}
              {formatTimeHM24(activityEndTime)}
            </Text>
          </View>
          <View style={[styles.medication, {backgroundColor: medications.length > 0 
            ? isCurrentActivity()
              ? colors.green
              : colors.light_gray 
            : null}]}>
            <Text style={{color: colors.white_var1, paddingVertical: 2}}>{medications.length > 0 ? 'See medication ➝' : ''}</Text>
          </View>
      </TouchableOpacity>
      <MedicationModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        medications={medications}
        patientName={patientName}
        patientID={patientID}
        date={date}
        navigation={navigation}
        />
    </>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    flexDirection: 'column',
    width: 160,
    height: 120,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginRight: 20,
    // padding: 3,
  },
  medication: { 
    width: '100%', 
    backgroundColor: colors.green,
    alignItems: 'center', 
    justifyContent: 'center',
    borderBottomLeftRadius: 8, 
    borderBottomRightRadius: 8, 
    paddingVertical: 4
  },
  activityContainerGreen: {
    backgroundColor: colors.green_lightest,
    color: colors.black
  },
  activityContainerGray: {
    backgroundColor: colors.gray
  },
  activityTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 17.5,
    margin: 3,
  },
  activityTime: {
    textAlign: 'center',
    fontWeight: 'normal',
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 14,
  },
  lightText: {
    color: colors.white_var1
  },
  darkText: {
    color: colors.light_gray
  },
});

export default ActivityCard;
