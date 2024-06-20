/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/Schedule';
const patientWeeklySchedule = `${endpoint}/PatientLatestSchedules`;
const patientAllTest = `${endpoint}/patientAllTest`;
const patientTest = `${endpoint}/patientTest`;
const systemTest = `${endpoint}/systemTest`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getPatientWeeklySchedule = async (patientIDs=[]) => {
  let params;
  if (patientIDs.length > 0) {
    params = {
      patientIDs: patientIDs,
    };
  }

  // if patientIds not specified
  else {
    params = {};
  }
  return await client.get(patientWeeklySchedule, params);
};

const getPatientAllTest = async () => {
  return await client.get(patientAllTest, {});
}

const getPatientTest = async (patientID) => {
  let params;
  if (patientID !== null) {
    params = {
      patientID,
    };
  }
  
  // if patientId is not specified
  else {
    params = {};
  }
  return await client.get(patientTest, params);
};

const getSystemTest = async () => {
  return await client.get(systemTest, {});
}

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getPatientWeeklySchedule,
  getPatientAllTest,
  getPatientTest,
  getSystemTest,
};
