import client from "./client";

/*
 * List all end points here
 */
const endpoint = "/User";
const userLogin = endpoint + "/Login";
const userUpdate = endpoint + "/Update";
const userDelete = endpoint + "/delete";
const userRefreshToken = endpoint + "/RefereshToken";
const userLogout = endpoint + "/Logout";
const userResetPassword = endpoint + "/ResetPassword";

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// GET REQUESTS

// POST REQUESTS
const loginUser = (Email, Role, Password) => {
  var body = JSON.stringify({ Email, Role, Password });

  console.log(body);
  // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
  return client.post(userLogin, body);
};

// UPDATE REQUESTS

/*
 * Expose your end points here
 */
export default {
  loginUser,
};
