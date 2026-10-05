import { Alert } from 'react-native';

import scheduleApi from 'app/api/schedule';
import {
  administrationFailureMessage,
  canRecordMedication,
  assignedCaregiverIdFrom,
  currentUserId,
  isAssignedCaregiver,
  listMedicationScheduleRows,
  matchMedicationScheduleRow,
  medicationWindow,
  medicationPermissionMessage,
  todayAdministerDate,
} from 'app/utility/medicationAdminister';
import requestDeadline from 'app/utility/requestDeadline';
import { createMedicationRecorder } from 'app/utility/medicationWriteState';

const recorder = createMedicationRecorder({
  getSchedule: scheduleApi.getMedicationScheduleV1,
  updateSchedule: scheduleApi.updateMedicationScheduleV1,
});

const persistAdministration = async ({
  patientID,
  prescriptionName,
  administerTime,
  userId,
  onRecorded,
  administerDate,
}) => {
  const args = {
    patientID,
    prescriptionName,
    administerTime,
    userId,
    administerDate,
  };
  const result = await recorder.record(args);

  if (result.outcome === 'accepted' || result.outcome === 'recorded') {
    onRecorded?.();
    Alert.alert(
      'Medication administered',
      result.outcome === 'accepted'
        ? 'The scheduler accepted this administration against your user id.'
        : `This dose is already recorded. Recorded administrator: ${
            result.row.AdministeredBy ??
            result.row.administeredBy ??
            'not provided'
          }`,
    );
    return true;
  }
  if (result.outcome === 'not_sent') {
    Alert.alert(
      'Administration not sent',
      administrationFailureMessage(result.reason),
    );
    return false;
  }
  const checkStatus = async () => {
    const state = await recorder.reconcile(args);
    if (state.outcome === 'recorded') {
      onRecorded?.();
      Alert.alert(
        'Administration verified',
        `This dose is recorded as administered.\nRecorded administrator: ${
          state.row.AdministeredBy ?? state.row.administeredBy ?? 'not provided'
        }`,
      );
    } else if (state.outcome === 'not_recorded_verified') {
      Alert.alert(
        'Not administered - verified',
        'The earlier request was rejected and the scheduler confirms this dose is not administered. You may reopen the logging flow if required.',
      );
    } else {
      Alert.alert(
        'Administration outcome unknown',
        'The scheduler has not confirmed the outcome. Do not log this dose again. Check status later or ask the supervisor to verify the scheduler record.',
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Check status', onPress: checkStatus },
        ],
      );
    }
  };
  Alert.alert(
    'Administration outcome unknown',
    'The request may still complete. Do not log this dose again until its status is verified. This attempt is retained even if the app is restarted.',
    [
      { text: 'Close', style: 'cancel' },
      { text: 'Check status', onPress: checkStatus },
    ],
  );
  // Keep this confirmation submitted. Reconciliation never sends another PUT.
  return true;
};

const showFinalConfirm = ({
  patientName,
  medName,
  medDosage,
  timeLabel,
  administerDate,
  onConfirm,
}) => {
  Alert.alert(
    'Confirm medication administration',
    `Patient: ${
      patientName || '-'
    }\nMedication: ${medName}\nDosage: ${medDosage}\nDate: ${administerDate}\nTime: ${timeLabel} (Singapore)`,
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
  administrationDate = new Date(),
  onRecorded,
}) => {
  if (!canRecordMedication(user)) {
    Alert.alert('Administration unavailable', medicationPermissionMessage);
    return;
  }
  const userId = currentUserId(user);
  if (!userId) {
    Alert.alert(
      'Administration not recorded',
      administrationFailureMessage('missing_user'),
    );
    return;
  }
  const window = medicationWindow(medTime, administrationDate);
  if (!window.allowed) {
    Alert.alert('Administration not recorded', window.reason);
    return;
  }
  const timeLabel =
    typeof formatTime === 'function'
      ? formatTime(medTime)
      : String(medTime || '');
  const administerDate = todayAdministerDate();
  let row;
  try {
    const listRes = await requestDeadline(
      scheduleApi.getMedicationScheduleV1(),
    );
    if (!listRes?.ok) {
      Alert.alert(
        'Administration not recorded',
        administrationFailureMessage('schedule_unavailable'),
      );
      return;
    }
    row = matchMedicationScheduleRow(listMedicationScheduleRows(listRes.data), {
      patientID,
      prescriptionName: medName,
      administerTime: medTime,
      administerDate,
    });
    if (!row) {
      Alert.alert(
        'Administration not recorded',
        administrationFailureMessage('slot_not_found'),
      );
      return;
    }
    if (String(row.Status ?? row.status) === '1') {
      Alert.alert(
        'Medication already administered',
        `${administrationFailureMessage(
          'already_administered',
        )}\nRecorded administrator: ${
          row.AdministeredBy ?? row.administeredBy ?? 'not provided'
        }`,
      );
      return;
    }
  } catch (error) {
    Alert.alert(
      'Administration not recorded',
      administrationFailureMessage('schedule_unavailable'),
    );
    return;
  }
  const assignedTo = assignedCaregiverIdFrom({
    row,
    allocation: { caregiverId, tempCaregiverId },
  });
  let submitted = false;
  const onConfirm = async () => {
    if (submitted) {
      return;
    }
    submitted = true;
    try {
      const recorded = await persistAdministration({
        patientID,
        prescriptionName: medName,
        administerTime: medTime,
        userId,
        onRecorded,
        administerDate,
      });
      if (!recorded) {
        submitted = false;
      }
    } catch (error) {
      Alert.alert(
        'Administration outcome unknown',
        'The outcome could not be confirmed. Do not log this dose again until the scheduler record is checked.',
      );
    }
  };
  const finalConfirm = () =>
    showFinalConfirm({
      patientName,
      medName,
      medDosage,
      timeLabel,
      administerDate,
      onConfirm,
    });
  const confirmCaregiver = () => {
    if (
      !isAssignedCaregiver({ userId, assignedTo, caregiverId, tempCaregiverId })
    ) {
      Alert.alert(
        'Not the assigned caregiver',
        `You are not the assigned caregiver for ${
          patientName || 'this patient'
        }.\n\nConfirm you still want to administer ${medName} (${medDosage})? If the scheduler accepts the update, it will record your user id as who administered.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: finalConfirm },
        ],
      );
    } else {
      finalConfirm();
    }
  };
  if (window.outsideWindow) {
    Alert.alert(
      'Outside scheduled medication time',
      `The scheduled time is ${timeLabel}. This is outside the 30-minute window before or after that time. Confirm that you intend to record this administration.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: confirmCaregiver },
      ],
    );
  } else {
    confirmCaregiver();
  }
};
