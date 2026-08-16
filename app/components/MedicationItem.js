// Libs
import React, { useContext } from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';
import AuthContext from 'app/auth/context';

// Utilities
import {
  formatTimeAMPM,
  setTimeToZero,
} from 'app/utility/miscFunctions';
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import { confirmAndLogMedicationAdministration } from 'app/utility/confirmMedicationAdministration';
import EditDeleteBtn from './EditDeleteBtn';

const MedicationItem = ({
  medID: _medID,
  patientID,
  patientName,
  medName,
  medDosage,
  medTime,
  medNote,
  medStartDate,
  medEndDate,
  medRemarks,
  caregiverId,
  tempCaregiverId,
  date = new Date(),
  onEdit,
  onDelete,
}) => {
  const { user } = useContext(AuthContext) || {};
  //to check if the medication has ended
  const isMedicationEnded = new Date(medEndDate) < new Date();

  const onClickAdminister = () => {
    confirmAndLogMedicationAdministration({
      user,
      patientID,
      patientName,
      medName,
      medDosage,
      medTime,
      caregiverId,
      tempCaregiverId,
      formatTime: formatTimeAMPM,
    });
  };

  const canAdminister = () => {
    const tempDate = setTimeToZero(date);
    const today = setTimeToZero(new Date());
    return !(
      (medStartDate && tempDate < medStartDate) ||
      (medEndDate && tempDate > medEndDate) ||
      tempDate > today ||
      tempDate < today
    );
  };
  return (
    <View>
      <View
        style={[
          styles.medContainer,
          isMedicationEnded && styles.medEndedContainer,
        ]}
      >
        <Icon
          as={<MaterialIcons name="medical-services" />}
          size={12}
          color={colors.green}
        ></Icon>
        <View style={styles.medTextContainer}>
          <Text style={styles.heading}>
            {medName} ({medDosage})
          </Text>
          {medRemarks ? (
            <View style={{ flexDirection: 'row', marginLeft: 20 }}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Remarks: </Text>
                <Text style={[styles.medText]}>{medRemarks}</Text>
              </Text>
            </View>
          ) : null}
          {medNote ? (
            <View style={{ flexDirection: 'row', marginLeft: 20 }}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Note: </Text>
                <Text style={[styles.medText]}>{medNote}</Text>
              </Text>
            </View>
          ) : null}

          {medStartDate ? (
            <View style={{ flexDirection: 'row', marginLeft: 20 }}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>Start Date: </Text>
                <Text style={[styles.medText]}>
                  {formatDateTime(new Date(medStartDate), true)}
                </Text>
              </Text>
            </View>
          ) : null}
          {medEndDate ? (
            <View style={{ flexDirection: 'row', marginLeft: 20 }}>
              <Text>
                <Text style={[styles.medText, styles.bold]}>End Date: </Text>
                <Text style={[styles.medText]}>
                  {formatDateTime(new Date(medEndDate), true)}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>
        <View>
          <Text style={styles.medTime}>
            {formatDateTime(new Date(medTime), false)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.administerContainer,
          {
            backgroundColor:
              canAdminister() && !isMedicationEnded
                ? colors.green
                : colors.grey,
          },
        ]}
        onPress={canAdminister() ? onClickAdminister : () => {}}
        activeOpacity={canAdminister() ? null : 1}
        disabled={!canAdminister() || isMedicationEnded}
      >
        <Text style={styles.medText} color={colors.white}>
          {canAdminister() && !isMedicationEnded
            ? 'Click to log medicine administration'
            : 'Cannot administer today'}
        </Text>
      </TouchableOpacity>
      <EditDeleteBtn
        onDelete={!isMedicationEnded ? onDelete : null}
        onEdit={!isMedicationEnded ? onEdit : null}
      />
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
  medEndedContainer: {
    backgroundColor: colors.grey_lighter,
  },
  medTextContainer: {
    flex: 1,
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
  bold: {
    marginLeft: 20,
    fontWeight: '600',
  },
  administerContainer: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});

export default MedicationItem;
