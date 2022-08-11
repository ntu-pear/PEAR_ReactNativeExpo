/*eslint eslint-comments/no-unlimited-disable: error */
import client from './client';

/*
 * List all end points here
 */
const endpoint = '/Patient';
const patientAdd = `${endpoint}/add`; //eslint-disable-line no-unused-vars
const patientUpdate = `${endpoint}/update`; //eslint-disable-line no-unused-vars
const privacyLevelUpdate = `${endpoint}/UpdatePatient`; //eslint-disable-line no-unused-vars
const patientDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getPatient = async (patientID, isActive, maskNRIC) => {
  // Error Handling
  isActive ? (isActive = true) : (isActive = false);
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
      isActive,
      maskNRIC,
    };
  }

  return client.get(endpoint, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getPatient,
};
