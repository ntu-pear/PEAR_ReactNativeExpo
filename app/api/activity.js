/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/CentreActivityPreference';
const patientActivityPreference = `${endpoint}/PatientCentreActivityPreference`;
const addPatientActivityPreference = `${endpoint}/add`;
const updatePatientActivityPreference = `${endpoint}/update`;
const deletePatientActivityPreference = `${endpoint}/delete`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getActivityPreference = async (patientID) => {
  let params;
  params = {
    patientID,
  };
  
  return client.get(patientActivityPreference, params);
};

// **********************  POST REQUESTS *************************

const addActivityPreference = async (patientID, CentreActivityID, isLike) => {
    const payload = {
        patientID: patientID,
        CentreActivityID: CentreActivityID,
        isLike: isLike,
      };

    return await client.post(addPatientActivityPreference, payload);
};

// ************************* UPDATE REQUESTS *************************

const updateActivityPreference = async (data) => {
    const headers = { 'Content-Type': 'application/json-patch+json' };
  
    return client.put(updatePatientActivityPreference, data, { headers });
};

const deleteActivityPreference = async (data) => {
    return client.put(deletePatientActivityPreference, data);
};

/*
 * Expose your end points here
 */
export default {
  getActivityPreference,
  addActivityPreference,
  updateActivityPreference,
  deleteActivityPreference,
};
