/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';

/*
 * Helper to use Patient Service v1 base URL
 */
const withPatientV1Base = (cfg = {}) => ({
  baseURL: PATIENT_V1_BASE,
  timeout: 15000,
  ...cfg,
});

/*
 * List all end points here
 */
const endPoint = '/Guardian';
const guardianPatientGuardian = `${endPoint}/GetPatientGuardianByPatientId`;
const guardianAdd = `${endPoint}/add`; //eslint-disable-line no-unused-vars
const guardianUpdate = `${endPoint}/update`; //eslint-disable-line no-unused-vars
const guaridanDelete = `${endPoint}/delete`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patient_id
// purpose: retrieve's guardian tagged to the patient by patient's ID.
const getPatientGuardian = (patientID, maskNRIC = false) => {
  // Error Handling - use patient_id (snake_case) as per API spec
  const params = {
    patient_id: patientID,
    maskNRIC,
  };
  return client.get(guardianPatientGuardian, params, withPatientV1Base());
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************
const updateGuardian = async (data, guardianId) => {
  const params = { guardian_id: guardianId };

  return client.put(guardianUpdate, data, { 
    ...withPatientV1Base(),
    params
  });
};

/*
 * Expose your end points here
 */
export default {
  getPatientGuardian,
  updateGuardian,
};
