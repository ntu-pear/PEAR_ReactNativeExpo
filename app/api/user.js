/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/User';
const userLogin = `${endpoint}/Login`;
const userUpdate = `${endpoint}/Update`;
const userDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars
// const userRefreshToken = `${endpoint}/RefereshToken`; //eslint-disable-line no-unused-vars
const userRefreshToken = `${endpoint}/RefreshToken`; //eslint-disable-line no-unused-vars
const userLogout = `${endpoint}/Logout`; //eslint-disable-line no-unused-vars
const userResetPassword = `${endpoint}/ResetPassword`;
const userChangePassword = `${endpoint}/ChangePassword`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getUser = async (userID, maskNRIC = true) => {
  const params = {
    userID: userID,
    maskNRIC,
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

const changePassword = (Email, OldPassword, NewPassword) => {
  const body = JSON.stringify({ Email, OldPassword, NewPassword });

  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(userChangePassword, body);
};

// ************************* UPDATE REQUESTS *************************
const updateUser = async (data) => {
  const headers = { 'Content-Type': 'application/json-patch+json' };
  return client.put(userUpdate, data, { headers });
};

/*
 * Expose your end points here
 */
export default {
  loginUser,
  resetPassword,
  getUser,
  updateUser,
  changePassword,
};
