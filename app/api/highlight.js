/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/Highlight';
const highlightList = `${endpoint}/list`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getHighlight = async () => {
  /*
   *   Build Params
   */
  /*
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
	*/

  return client.get(highlightList);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getHighlight,
};
