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
*/

// GET REQUESTS


// POST REQUESTS
const loginUser = (email, role, password) => {
    const data = new FormData();
    data.append("Email", email);
    data.append("Role", role);
    data.append("Password", password);

    console.log(data);
    // Note: client.post accepts 3 parameters. (1) endpoint (2) data and (3) onUploadProgress -- this is optional
    return client.post(userLogin, data)
}

// UPDATE REQUESTS






/*
* Expose your end points here
*/
export default {
    loginUser,
}