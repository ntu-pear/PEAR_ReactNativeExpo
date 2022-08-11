/*eslint eslint-comments/no-unlimited-disable: error */
import client from './client';

/*
 * List all end points here
 */
const endPoint = '/Guardian';
const guardianPatientGuardian = `${endPoint}/PatientGuardian`;
const guardianAdd = `${endPoint}/add`; //eslint-disable-line no-unused-vars
const guardianUpdate = `${endPoint}/update`; //eslint-disable-line no-unused-vars
const guaridanDelete = `${endPoint}/delete`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patientID
// purpose: retrieve's guardian tagged to the patient by patient's ID.
const getPatientGuardian = (patientID) => {
  const params = {
    patientID,
  };
  return client.get(guardianPatientGuardian, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getPatientGuardian,
};
