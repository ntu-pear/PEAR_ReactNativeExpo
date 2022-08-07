import client from "./client";

/*
 * List all end points here
 */
const endPoint = "/Guardian";
const guardianPatientGuardian = endPoint + "/PatientGuardian";
const guardianAdd = endPoint + "/add";
const guardianUpdate = endPoint + "/update";
const guaridanDelete = endPoint + "/delete";

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patientID
// purpose: retrieve's guardian tagged to the patient by patient's ID.
const getPatientGuardian = (patientID) => {
  const params = {
    patientID: patientID,
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
