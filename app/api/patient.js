/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/Patient';
const patientAdd = `${endpoint}/add`;
const patientUpdate = `${endpoint}/update`; //eslint-disable-line no-unused-vars
const privacyLevelUpdate = `${endpoint}/UpdatePatient`; //eslint-disable-line no-unused-vars
const patientDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars

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

  return client.get(endpoint, params);
};

// **********************  POST REQUESTS *************************
const addPatient = (formData) => {
  const params = {
    FirstName: formData.FirstName,
    LastName: formData.LastName,
    PreferredName: formData.PreferredName,
    PreferredLanguageListID: formData.PreferredLanguageListID,
    NRIC: formData.NRIC,
    Address: formData.Address,
    HomeNo: formData.HomeNo,
    HandphoneNo: formData.HandphoneNo,
    Gender: formData.Gender,
    DOB: formData.DOB,
    StartDate: formData.StartDate,
    DOL: formData.DOL,
    PrivacyLevel: formData.PrivacyLevel,
    UpdateBit: formData.UpdateBit,
    AutoGame: formData.AutoGame,
    IsActive: formData.IsActive,
    IsRespiteCare: formData.IsRespiteCare,
    TempAddress: formData.TempAddress,
    TerminationReason: formData.TerminationReason,
    InactiveReason: formData.InactiveReason,
    ProfilePicture: formData.ProfilePicture,
    UploadProfilePicture: formData.UploadProfilePicture,
  };

  const body = JSON.stringify(params);

  // var formData = new FormData();

  // formData.append(
  //   'items',
  //   new Blob([body], {
  //     type: 'multipart/form-data',
  //   }),
  // );

  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(
    patientAdd,
    body,
    // formData,
    //   , {
    //   headers: {
    //     Accept: 'multipart/form-data',
    //     'Content-Type': undefined,
    //   },
    // }
  );
};
// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getPatient,
  addPatient,
};
