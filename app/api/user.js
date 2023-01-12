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

const getUser = async (userID) => {
  const params = {
    userID: userID,
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
const updateUser = async (data, profilePicture) => {
  const formData = new FormData();

  for (const key in data) {
    var value = data[key];
    formData.append(key, value);
  }

  // TODO: unable to update profile pic
  formData.append('uploadProfilePicture', profilePicture);

  const headers = { 'Content-Type': 'multipart/form-data' };

  console.log('formData', formData);

  return client.put(userUpdate, formData, { headers });
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
