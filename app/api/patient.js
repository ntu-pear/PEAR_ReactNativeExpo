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
const medicalHistorypoint = '/MedicalHistory';
const activityEndpoint = '/Activity';
const routineEndpoint = '/Routine';
const patientList = `${endpoint}/patientList`;
// `${endpoint}/patientListByUserId` changed to ${endpoint}/patientListByLoggedInCaregiver
// to enable fetching caregiver specific patients
const patientListByUserId = `${endpoint}/patientListByLoggedInCaregiver`;
const patientAdd = `${endpoint}/add`;
const patientUpdate = `${endpoint}/update`; //eslint-disable-line no-unused-vars
const privacyLevelUpdate = `${endpoint}/UpdatePatient`; //eslint-disable-line no-unused-vars
const patientDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars
const patientAllergy = `${allergyEndpoint}/PatientAllergy`; //eslint-disable-line no-unused-vars
const patientVitalList = `${vitalEndpoint}/list`; //eslint-disable-line no-unused-vars
const patientPrescriptionList = `${prescriptionEndpoint}/PatientPrescription`; //eslint-disable-line no-unused-vars
const patientProblemLog = `${problemLogEndpoint}/PatientProblemLog`; //eslint-disable-line no-unused-vars
const patientMedicalHistory = `${medicalHistorypoint}/list`; //eslint-disable-line no-unused-vars
const patientRoutine = `${activityEndpoint}${routineEndpoint}/PatientRoutine`; //eslint-disable-line no-unused-vars

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

const getPatient = async (patientID, maskNRIC) => {
  // Error Handling
  maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

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

const getPatientList = async (maskNRIC = true) => {
  // Error Handling
  // maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

  return client.get(patientList, maskNRIC);
};

const getPatientListByLoggedInCaregiver = async (maskNRIC = true) => {
  return client.get(patientListByUserId, maskNRIC);
};

const getPatientAllergy = async (patientID) => {
  let params;
  params = {
    patientID
  };

  return client.get(patientAllergy, params);
};

const getPatientVitalList = async (patientID) => {
  let params;
  params = {
    patientID
  };

  return client.get(patientVitalList, params);
};

const getPatientPrescriptionList = async (patientID) => {
  let params;
  params = {
    patientID
  };

  return client.get(patientPrescriptionList, params);
};

const getPatientProblemLog = async (patientID) => {
  let params;
  params = {
    patientID
  };

  return client.get(patientProblemLog, params);
};

const getPatientMedicalHistory= async (patientID) => {
  let params;
  params = {
    patientID
  };

  return client.get(patientMedicalHistory, params);
};

const getPatientRoutine = async (patientID) => {
  let params;
  params = {
    patientID
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

    // if no profile image is uploaded, don't use profile pic as a parameter
    if (
      key === 'UploadProfilePicture' &&
      Object.values(value).every((val) => val === '')
    ) {
      continue;
    }

    // console.log("PLACEHOLDER",placeholderImage);
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
/*
 * Expose your end points here
 */
export default {
  getPatient,
  getPatientList,
  getPatientListByLoggedInCaregiver,
  getPatientAllergy,
  getPatientVitalList,
  getPatientPrescriptionList,
  getPatientProblemLog,
  getPatientMedicalHistory,
  getPatientRoutine,
  addPatient,
  updatePatient,
};
