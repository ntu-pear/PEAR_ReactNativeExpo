/*
 * This is where all the constants for routings are found
 */

// Note: Freeze is to ensure we do not make changes to these constants
// accidentally.
export default Object.freeze({
  ACCOUNT: 'Account',
  ACCOUNT_SCREEN: 'AccountScreen',
  ACCOUNT_VIEW: 'AccountViewScreen',
  ACCOUNT_EDIT: 'AccountEditScreen',
  ABOUT: 'About',
  SETTINGS: 'Settings',
  CHANGE_PASSWORD: 'ChangePassword',

  CONFIG: 'Config',
  CONFIG_SCREEN: 'ConfigScreen',
  DASHBOARD: 'Dashboard',
  DASHBOARD_SCREEN: 'Patient Schedules',
  LOGIN: 'Login',
  NOTIFICATION: 'Notifications',
  NOTIFICATION_ACCEPT: 'NotificationAccept',
  NOTIFICATION_APPROVAL_REQUEST: 'NotificationApprovalRequest',
  NOTIFICATION_REJECT: 'NotificationReject',
  NOTIFICATION_READ: 'NotificationRead',
  NOTIFICATION_TAB: 'NotificationTab',
  PATIENTS: 'Patients',
  PATIENTS_SCREEN: 'PatientScreen',
  PATIENT_PROFILE: 'PatientProfile',
  PATIENT_INFORMATION: 'PatientInformation',
  PATIENT_MEDICAL_HISTORY: 'PatientMedicalHistory',
  PATIENT_ALLERGY: 'PatientAllergy',
  PATIENT_HOLIDAY: 'PatientHoliday',
  PATIENT_MEDICATION: 'PatientMedication',
  PATIENT_PHOTO_ALBUM: 'PatientPhotoAlbum',
  PATIENT_PREFERENCE: 'PatientPreference',
  PATIENT_PRESCRIPTION: 'PatientPrescription',
  PATIENT_PROBLEM_LOG: 'PatientProblemLog',
  PATIENT_VITAL: 'PatientVital',
  PATIENT_ROUTINE: 'PatientRoutine',
  REGISTER: 'Register',
  WELCOME: 'Welcome',
  PATIENT_ADD_PATIENT: 'Add Patient',
  EDIT_PATIENT_INFO: 'EditPatientPersonalInfo',
  EDIT_PATIENT_PREFERENCES: 'EditPatientPreferences',
  EDIT_PATIENT_GUARDIAN: 'EditPatientGuardian',
  EDIT_PATIENT_SOCIALHIST: 'EditPatientSocialHist',
  RESET_PASSWORD: 'Reset Password',
});
