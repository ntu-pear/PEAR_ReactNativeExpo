import client from "./client";
import authStorage from "../auth/authStorage";

/*
 * List all end points here
 */
const endpoint = "/Patient";
const patientAdd = endpoint + "/add";
const patientUpdate = endpoint + "/update";
const privacyLevelUpdate = endpoint + "/UpdatePatient";
const patientDelete = endpoint + "/delete";

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getPatient = async (patientID, isActive, maskNRIC) => {
  // Error Handling
  isActive ? (isActive = true) : (isActive = false);
  maskNRIC ? (maskNRIC = true) : (maskNRIC = false);

  /*
   *   Build Params
   */
  // if patientId is specified
  var params;
  if (patientID !== null) {
    params = {
      patientID: patientID,
      maskNRIC: maskNRIC,
    };
  }
  // if patientId is not specified
  else {
    params = {
      isActive: isActive,
      maskNRIC: maskNRIC,
    };
  }

  return client.get(endpoint, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getPatient,
};
