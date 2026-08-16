import { Alert } from 'react-native';

import scheduleApi from 'app/api/schedule';
import {
  administrationFailureMessage,
  assignedCaregiverIdFrom,
  currentUserId,
  isAssignedCaregiver,
  listMedicationScheduleRows,
  logMedicationAdministration,
  matchMedicationScheduleRow,
} from 'app/utility/medicationAdminister';

const persistAdministration = async ({
  patientID,
  prescriptionName,
  administerTime,
  userId,
}) => {
  const result = await logMedicationAdministration({
    getSchedule: scheduleApi.getMedicationScheduleV1,
    updateSchedule: scheduleApi.updateMedicationScheduleV1,
    patientID,
    prescriptionName,
    administerTime,
    userId,
  });

  if (result.ok) {
    Alert.alert(
      'Medication administered',
      'The scheduler recorded this administration against your user id.',
    );
    return;
  }

  Alert.alert('Administration not recorded', administrationFailureMessage(result.reason));
};

const showFinalConfirm = ({
  patientName,
  medName,
  medDosage,
  timeLabel,
  onConfirm,
}) => {
  Alert.alert(
    'Confirm medication administration',
    `Patient: ${patientName || '-'}\nMedication: ${medName}\nDosage: ${medDosage}\nTime: ${timeLabel}`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ],
  );
};

export const confirmAndLogMedicationAdministration = async ({
  user,
  patientID,
  patientName,
  medName,
  medDosage,
  medTime,
  caregiverId,
  tempCaregiverId,
  formatTime,
}) => {
  const userId = currentUserId(user);
  const timeLabel =
    typeof formatTime === 'function' ? formatTime(medTime) : String(medTime || '');

  let assignedTo = caregiverId || tempCaregiverId || null;
  try {
    const listRes = await scheduleApi.getMedicationScheduleV1();
    if (listRes?.ok) {
      const row = matchMedicationScheduleRow(
        listMedicationScheduleRows(listRes.data),
        {
          patientID,
          prescriptionName: medName,
          administerTime: medTime,
        },
      );
      assignedTo = assignedCaregiverIdFrom({
        row,
        allocation: { caregiverId, tempCaregiverId },
      });
    }
  } catch (error) {
    assignedTo = caregiverId || tempCaregiverId || null;
  }

  const onConfirm = () =>
    persistAdministration({
      patientID,
      prescriptionName: medName,
      administerTime: medTime,
      userId,
    });

  if (
    !isAssignedCaregiver({
      userId,
      assignedTo,
      caregiverId,
      tempCaregiverId,
    })
  ) {
    Alert.alert(
      'Not the assigned caregiver',
      `You are not the assigned caregiver for ${patientName || 'this patient'}.\n\nConfirm you still want to administer ${medName} (${medDosage})? If the scheduler accepts the update, it will record your user id as who administered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => showFinalConfirm({
          patientName,
          medName,
          medDosage,
          timeLabel,
          onConfirm,
        }) },
      ],
    );
    return;
  }

  showFinalConfirm({
    patientName,
    medName,
    medDosage,
    timeLabel,
    onConfirm,
  });
};
