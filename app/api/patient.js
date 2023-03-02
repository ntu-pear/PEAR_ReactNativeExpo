/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';
import { Image } from 'react-native';

/*
 * List all end points here
 */
const endpoint = '/Patient';
const patientList = `${endpoint}/patientList`;
const patientListByUserId = `${endpoint}/patientListByUserId`;
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
      let val = value[key];

      // if key is IsChecked, do not append to patientData
      // IsChecked is used for front end validation for guardian's email only
      if (key === 'NRIC') {
        val = val.toUpperCase();
      }
      if (key == 'IsChecked') {
        continue;
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

const getPatientList = async (maskNRIC = true) => {
  // Error Handling
  // maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

  return client.get(patientList, maskNRIC);
};

const getPatientListByUserId = async (maskNRIC = true) => {
  return client.get(patientListByUserId, maskNRIC);
};

// **********************  POST REQUESTS *************************
const addPatient = (formData) => {
  var patientData = new FormData();

  for (const key in formData.patientInfo) {
    var value = formData.patientInfo[key];

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
  getPatientList,
  getPatientListByUserId,
  addPatient,
};
