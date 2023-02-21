/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/Patient';
const patientList = `${endpoint}/patientList`;
const patientAdd = `${endpoint}/add`;
const patientUpdate = `${endpoint}/update`; //eslint-disable-line no-unused-vars
const privacyLevelUpdate = `${endpoint}/UpdatePatient`; //eslint-disable-line no-unused-vars
const patientDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

const addPatientForm = (arr, str, patientData) => {
  for (const item in arr) {
    const value = arr[item];

    for (const key in value) {
      const val = value[key];
      const param = `${str}[${item}].${key}`;
      patientData.append(param, val);
    }
  }
  return patientData;
};
// **********************  GET REQUESTS *************************

// const getPatient = async (patientID, isActive, maskNRIC) => {
//   // Error Handling
//   isActive ? (isActive = true) : (isActive = false);
//   maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

//   /*
//    *   Build Params
//    */
//   // if patientId is specified
//   let params;
//   if (patientID !== null) {
//     params = {
//       patientID,
//       maskNRIC,
//     };
//   }
//   // if patientId is not specified
//   else {
//     params = {
//       isActive,
//       maskNRIC,
//     };
//   }

//   return client.get(endpoint, params);
// };

const getPatientList = async (maskNRIC = true) => {
  // Error Handling
  // maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

  return client.get(patientList, maskNRIC);
};

// **********************  POST REQUESTS *************************
const addPatient = (formData) => {
  var patientData = new FormData();

  for (const key in formData.patientInfo) {
    var value = formData.patientInfo[key];
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }
    const param = `patientAddDTO.${key}`;
    patientData.append(param, value);
  }

  addPatientForm(formData.guardianInfo, 'GuardianAddDto', patientData);
  addPatientForm(formData.allergyInfo, 'AllergyAddDto', patientData);

  const headers = { 'Content-Type': 'multipart/form-data' };

  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(patientAdd, patientData, { headers });
};
// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  // getPatient,
  getPatientList,
  addPatient,
};
