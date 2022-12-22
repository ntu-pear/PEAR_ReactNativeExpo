/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/User';
const userLogin = `${endpoint}/Login`;
const userUpdate = `${endpoint}/Update`;
const userDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars
const userRefreshToken = `${endpoint}/RefereshToken`; //eslint-disable-line no-unused-vars
const userLogout = `${endpoint}/Logout`; //eslint-disable-line no-unused-vars
const userResetPassword = `${endpoint}/ResetPassword`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getUser = async (userID, role) => {
  const params = {
    userId: userID,
    role: role,
  };
  return client.get(endpoint, params);
};

// **********************  POST REQUESTS *************************
const loginUser = (Email, Role, Password) => {
  const body = JSON.stringify({ Email, Role, Password });

  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(userLogin, body);
};

const resetPassword = (Email, Role) => {
  const body = JSON.stringify({ Email, Role });

  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(userResetPassword, body);
};

// ************************* UPDATE REQUESTS *************************
const updateUser = (formData, newProfilePicture) => {
  const params = {
    PreferredName: formData.preferredName,
    ContactNo: formData.contactNo,
    UploadProfilePicture: newProfilePicture.uploadProfilePicture,
  };

  console.log('params', params);

  const body = JSON.stringify(params);

  return client.post(
    userUpdate,
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

/*
 * Expose your end points here
 */
export default {
  loginUser,
  resetPassword,
  getUser,
  updateUser,
};
