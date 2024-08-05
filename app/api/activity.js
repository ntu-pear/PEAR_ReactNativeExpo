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

const centreActivity = '/Activity/CentreActivity';

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getActivityPreference = async (patientID) => {
  const payload = {
    patientID: patientID,
  };
  
  return client.get(patientActivityPreference, payload);
};

const getCentreActivities = async () => {
  return client.get(centreActivity);
};

// **********************  POST REQUESTS *************************

const addActivityPreference = async (patientID, data) => {
    const payload = {
        patientID: patientID,
        centreActivityID: data.centreActivityID,
        isLike: data.isLike,
      };

    return await client.post(addPatientActivityPreference, payload);
};

// ************************* UPDATE REQUESTS *************************

const updateActivityPreference = async (data) => {
    const headers = { 'Content-Type': 'application/json-patch+json' };
  
    return client.put(updatePatientActivityPreference, data, { headers });
};

const deleteActivityPreference = async (data) => {
  const payload = {
    centreActivityPreferenceID: data.centreActivityPreferenceID,
  };
  return client.put(deletePatientActivityPreference, payload);
};

/*
 * Expose your end points here
 */
export default {
  getActivityPreference,
  getCentreActivities,
  addActivityPreference,
  updateActivityPreference,
  deleteActivityPreference,
};
