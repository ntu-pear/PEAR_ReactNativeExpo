import client from "./client";


/*
 * List all end points here
 */
const endpoint = "/DoctorNote";
const doctorNoteAdd = endpoint + "/add";

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS ************************

// params: patientID
// purpose: receive doctor's note for specific patient
const getDoctorNote = async (patientID) => {
    const params = {
        patientId : patientID
    }
    return client.get(endpoint, params);
}

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
    getDoctorNote,
  };
