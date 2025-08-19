/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const listOptions = '/List';

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patientID
// purpose: retrieve's guardian tagged to the patient by patient's ID.
const getSelectionOptionList = (option) => {
  const params = {
    type: option,
  };
  return client.get(listOptions, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getSelectionOptionList,
};
