/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/Schedule';
const patientWeeklySchedule = '/Schedule/PatientWeeklySchedule';
const patientAllTest = '/Schedule/patientAllTest';
const patientTest = '/Schedule/patientTest';
const systemTest = '/Schedule/systemTest';

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getSchedule = async () => {
  return await client.get(endpoint, {});
};

const getPatientWeeklySchedule = async (patientID) => {
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
  getSchedule,
  getPatientWeeklySchedule,
  getPatientAllTest,
  getPatientTest,
  getSystemTest,
};
