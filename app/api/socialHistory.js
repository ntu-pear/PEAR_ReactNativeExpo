/*eslint eslint-comments/no-unlimited-disable: error */
import client from './client';

/*
 * List all end points here
 */
const endPoint = '/SocialHistory';
const socialHistoryAdd = `${endPoint}/add`; //eslint-disable-line no-unused-vars
const socialHistoryUpdate = `${endPoint}/update`; //eslint-disable-line no-unused-vars
const socialHistoryDelete = `${endPoint}/delete`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patientID
// purpose: get the social history of specific patient
const getSocialHistory = (patientID) => {
  const params = {
    patientId: patientID,
  };
  return client.get(endPoint, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getSocialHistory,
};
