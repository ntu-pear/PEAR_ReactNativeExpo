/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';
import { Image } from 'react-native';

/*
 * List all end points here
 */
const endpoint = '/Patient';
const allergyEndpoint = '/Allergy';
const vitalEndpoint = '/Vital';
const prescriptionEndpoint = '/Prescription';
const problemLogEndpoint = '/ProblemLog';
const medicalHistoryEndpoint = '/MedicalHistory';
const medicationEndpoint = '/Medication';
const activityEndpoint = '/Activity';
const routineEndpoint = '/Routine';
const patientList = `${endpoint}/patientList`;
// `${endpoint}/patientListByUserId` changed to ${endpoint}/patientListByLoggedInCaregiver
// to enable fetching caregiver specific patients
const patientListByUserId = `${endpoint}/patientListByLoggedInCaregiver`;
const patientStatusCountList = `${endpoint}/patientStatusCountList`;
const patientAdd = `${endpoint}/add`;
const patientUpdate = `${endpoint}/update`; //eslint-disable-line no-unused-vars
const privacyLevelUpdate = `${endpoint}/UpdatePatient`; //eslint-disable-line no-unused-vars
const patientDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars
const patientPrescriptionList = `${prescriptionEndpoint}/PatientPrescription`; //eslint-disable-line no-unused-vars
const patientRoutine = `${activityEndpoint}${routineEndpoint}/PatientRoutine`; //eslint-disable-line no-unused-vars
// Medical History
const patientMedicalHistory = `${medicalHistoryEndpoint}/list`; //eslint-disable-line no-unused-vars
const patientMedicalHistoryAdd = `${medicalHistoryEndpoint}/add`; //eslint-disable-line no-unused-vars
const patientMedicalHistoryDelete = `${medicalHistoryEndpoint}/delete`; //eslint-disable-line no-unused-vars
// Allergy
const patientAllergy = `${allergyEndpoint}/PatientAllergy`; //eslint-disable-line no-unused-vars
const patientAllergyAdd = `${allergyEndpoint}/add`; //eslint-disable-line no-unused-vars
const patientAllergyUpdate = `${allergyEndpoint}/update`; //eslint-disable-line no-unused-vars
const patientAllergyDelete = `${allergyEndpoint}/delete`; //eslint-disable-line no-unused-vars
// Vitals
const patientVitalList = `${vitalEndpoint}/list`; //eslint-disable-line no-unused-vars
const patientVitalAdd = `${vitalEndpoint}/add`; //eslint-disable-line no-unused-vars
const patientVitalUpdate = `${vitalEndpoint}/update`; //eslint-disable-line no-unused-vars
const patientVitalDelete = `${vitalEndpoint}/delete`; //eslint-disable-line no-unused-vars
// Problem Log
const patientProblemLog = `${problemLogEndpoint}/PatientProblemLog`; //eslint-disable-line no-unused-vars
const patientProblemLogAdd = `${problemLogEndpoint}/add`; //eslint-disable-line no-unused-vars
const patientProblemLogUpdate = `${problemLogEndpoint}/update`; //eslint-disable-line no-unused-vars
const patientProblemLogDelete = `${problemLogEndpoint}/delete`; //eslint-disable-line no-unused-vars
// Medication
const patientMedicationAdd = `${medicationEndpoint}/add`; //eslint-disable-line no-unused-vars
const patientMedicationUpdate = `${medicationEndpoint}/update`; //eslint-disable-line no-unused-vars
const patientMedicationDelete = `${medicationEndpoint}/delete`; //eslint-disable-line no-unused-vars
/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

const addPatientForm = (arr, str, patientData) => {
  for (const item in arr) {
    const value = arr[item];

    for (const key in value) {
      let val = value[key];

      // if key is IsChecked, do not append to patientData
      // IsChecked is used for front end validation for guardian's email only
      if (key === 'NRIC') {
        val = val.toUpperCase();
      }
      if (key == 'IsChecked') {
        continue;
      }
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      // if AllergyListID is 'None', do not append allergy info to patientData
      if (key == 'AllergyListID' && val == 2) {
        break;
      } else {
        const param = `${str}[${item}].${key}`;
        patientData.append(param, val);
      }
    }
  }
  return patientData;
};
// **********************  GET REQUESTS *************************

const getPatient = async (patientID, maskNRIC = true) => {
  /*
   *   Build Params
   */
  // if patientId is specified
  let params;
  if (patientID !== null) {
    params = {
      patientID,
      maskNRIC,
    };
  }
  // if patientId is not specified
  else {
    params = {
      maskNRIC,
    };
  }

  return client.get(endpoint, params);
};

const getPatientList = async (maskNRIC = true, patientStatus = null) => {
  return client.get(patientList, { maskNRIC, patientStatus });
};

const getPatientListByLoggedInCaregiver = async (
  maskNRIC = true,
  patientStatus = null,
) => {
  return client.get(patientListByUserId, { maskNRIC, patientStatus });
};

const getPatientStatusCountList = async () => {
  return client.get(patientStatusCountList, {});
};

const getPatientAllergy = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientAllergy, params);
};

const getPatientVitalList = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientVitalList, params);
};

const getPatientPrescriptionList = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientPrescriptionList, params);
};

const getPatientProblemLog = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientProblemLog, params);
};

const getPatientMedicalHistory = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientMedicalHistory, params);
};

const getPatientMedication = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(medicationEndpoint, params);
};

const getPatientRoutine = async (patientID) => {
  let params;
  params = {
    patientID,
  };

  return client.get(patientRoutine, params);
};

// **********************  POST REQUESTS *************************
const addPatient = (patientFormData) => {
  var patientData = new FormData();

  for (const key in patientFormData.patientInfo) {
    var value = patientFormData.patientInfo[key];

    // do not append 'IsChecked' to patientData
    if (key === 'IsChecked') {
      continue;
    } else if (key === 'EndDate' && value.getTime() === 0) {
      // if EndDate is beginning of unix epoch, set EndDate's value to empty string
      value = '';
    }

    // if no profile image is uploaded, upload a placeholder profile image
    if (
      key === 'UploadProfilePicture' &&
      Object.values(value).every((val) => val === '')
    ) {
      const placeholderImage = Image.resolveAssetSource(
        require('../assets/placeholder.png'),
      );

      value = {
        uri: placeholderImage.uri,
        name: 'placeholder.png',
        type: 'image/png',
      };
    }
    if (key === 'NRIC') {
      value = value.toUpperCase();
    }
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }
    const param = `patientAddDTO.${key}`;
    patientData.append(param, value);
  }

  addPatientForm(patientFormData.guardianInfo, 'GuardianAddDto', patientData);
  addPatientForm(patientFormData.allergyInfo, 'AllergyAddDto', patientData);

  const headers = { 'Content-Type': 'multipart/form-data' };

  return client.post(patientAdd, patientData, { headers });
};

// AddPatientAllergy is used in AddPatientAllergyModal.js - Joel
const AddPatientAllergy = async (patientID, allergyData) => {
  const payload = {
    patientID: patientID,
    allergyListID: allergyData.AllergyListID,
    allergyReactionListID: allergyData.AllergyReactionListID,
    allergyRemarks: allergyData.AllergyRemarks,
  };
  return client.post(patientAllergyAdd, payload);
};

const AddPatientVital = async (patientID, vitalData) => {
  const payload = {
    PatientID: patientID,
    Temperature: vitalData.temperature,
    SystolicBP: vitalData.systolicBP,
    DiastolicBP: vitalData.diastolicBP,
    HeartRate: vitalData.heartRate,
    SpO2: vitalData.spO2,
    BloodSugarLevel: vitalData.bloodSugarlevel,
    Height: vitalData.height,
    Weight: vitalData.weight,
    VitalRemarks: vitalData.vitalRemarks,
    AfterMeal: vitalData.afterMeal,
  };
  return client.post(patientVitalAdd, payload);
};

const addPatientProblemLog = async (patientID, userID, problemLogData) => {
  const payload = {
    userID: userID,
    patientID: patientID,
    problemLogRemarks: problemLogData.problemLogRemarks,
    problemLogListID: problemLogData.problemLogListID,
  };

  return client.post(patientProblemLogAdd, payload);
};

const AddPatientMedicalHistory = async (patientID, medicalData) => {
  const payload = {
    PatientID: patientID,
    medicalDetails: medicalData.medicalDetails,
    informationSource: medicalData.informationSource,
    medicalRemarks: medicalData.medicalRemarks,
    medicalEstimatedDate: medicalData.medicalEstimatedDate,
  };
  return client.post(patientMedicalHistoryAdd, payload);
};

const addPatientMedication = async (patientID, medicationData) => {
  const payload = {
    patientID: patientID,
    prescriptionName: medicationData.prescriptionName,
    dosage: medicationData.dosage,
    administerTime: medicationData.administerTime,
    instruction: medicationData.instruction,
    startDateTime: medicationData.startDateTime,
    endDateTime: medicationData.endDateTime,
    prescriptionRemarks: medicationData.prescriptionRemarks,
  };
  return client.post(patientMedicationAdd, payload);
};

const addPatientMedicalHistory = async (patientID, hxData) => {
  const payload = {
    patientID: patientID,
    informationSource: hxData.informationSource,
    medicalDetails: hxData.medicalDetails,
    medicalRemarks: hxData.medicalRemarks,
    medicalEstimatedDate: hxData.medicalEstimatedDate,
  };
  return client.post(patientMedicalHistoryAdd, payload);
};

// ************************* UPDATE REQUESTS *************************
const updatePatient = async (data) => {
  const formData = new FormData();

  for (const key in data) {
    var value = data[key];
    formData.append(key, value);
  }

  const headers = { 'Content-Type': 'multipart/form-data' };

  return client.put(patientUpdate, formData, { headers });
};

const updatePatientAllergy = async (patientID, allergyData) => {
  const payload = {
    patientID: patientID,
    allergyListID: allergyData.AllergyListID,
    allergyReactionListID: allergyData.AllergyReactionListID,
    allergyRemarks: allergyData.AllergyRemarks,
  };
  return client.put(patientAllergyUpdate, payload);
};

const deletePatientAllergy = async (allergyID) => {
  return client.delete(patientAllergyDelete, { allergyID });
};

const updatePatientVital = async (patientID, vitalData) => {
  const payload = {
    PatientID: patientID,
    Temperature: vitalData.temperature,
    SystolicBP: vitalData.systolicBP,
    DiastolicBP: vitalData.diastolicBP,
    HeartRate: vitalData.heartRate,
    SpO2: vitalData.spO2,
    BloodSugarLevel: vitalData.bloodSugarlevel,
    Height: vitalData.height,
    Weight: vitalData.weight,
    VitalRemarks: vitalData.vitalRemarks,
    AfterMeal: vitalData.afterMeal,
  };
  return client.put(patientVitalUpdate, payload);
};

const deletePatientVital = async (vitalID) => {
  return client.delete(patientVitalDelete, { vitalID });
};

const updateMedication = async (patientID, medicationData) => {
  const payload = {
    patientID: patientID,
    medicationID: medicationData.medicationID,
    prescriptionName: medicationData.prescriptionName,
    dosage: medicationData.dosage,
    administerTime: medicationData.administerTime,
    instruction: medicationData.instruction,
    startDateTime: medicationData.startDateTime,
    endDateTime: medicationData.endDateTime,
    prescriptionRemarks: medicationData.prescriptionRemarks,
  };
  return client.put(patientMedicationUpdate, payload);
};

const updateProblemLog = async (patientID, userID, logData) => {
  const payload = {
    userID: userID,
    patientID: patientID,
    problemLogID: logData.problemLogID,
    problemLogListID: logData.problemLogListID,
    problemLogRemarks: logData.problemLogRemarks,
  };
  return client.put(patientProblemLogUpdate, payload);
};

const deleteMedication = async (medicationData) => {
  const payload = {
    medicationID: medicationData.medicationID,
  };
  return client.put(patientMedicationDelete, payload);
};

const deleteMedicalHistory = async (medHistoryData) => {
  const payload = {
    medicalHistoryID: medHistoryData.medicalHistoryID,
  };
  return client.put(patientMedicalHistoryDelete, payload);
};

const deleteProblemLog = async (logData) => {
  const payload = {
    problemLogID: logData.problemLogID,
  };
  return client.put(patientProblemLogDelete, payload);
};
/*
 * Expose your end points here
 */
export default {
  getPatient,
  getPatientList,
  getPatientListByLoggedInCaregiver,
  getPatientStatusCountList,
  getPatientAllergy,
  getPatientVitalList,
  getPatientPrescriptionList,
  getPatientProblemLog,
  getPatientMedicalHistory,
  getPatientMedication,
  getPatientRoutine,
  addPatient,
  AddPatientAllergy,
  AddPatientVital,
  addPatientProblemLog,
  AddPatientMedicalHistory,
  addPatientMedication,
  addPatientMedicalHistory,
  updatePatient,
  updatePatientAllergy,
  deletePatientAllergy,
  updatePatientVital,
  deletePatientVital,
  updateMedication,
  deleteMedication,
  deleteMedicalHistory,
  deleteProblemLog,
  updateProblemLog,
};
