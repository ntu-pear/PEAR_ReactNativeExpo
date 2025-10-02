/*eslint eslint-comments/no-unlimited-disable: error */
import client, { V1_BASE } from 'app/api/client';
import authStorage from 'app/auth/authStorage';
/*
 * List all end points here
 */
//const endpoint = '/User';
//const userUpdate = `${endpoint}/Update`;
//const userDelete = `${endpoint}/delete`; //eslint-disable-line no-unused-vars
// const userRefreshToken = `${endpoint}/RefereshToken`; //eslint-disable-line no-unused-vars
//const userRefreshToken = `${endpoint}/RefreshToken`; //eslint-disable-line no-unused-vars
//const userLogout = `${endpoint}/Logout`; //eslint-disable-line no-unused-vars
//const userResetPassword = `${endpoint}/ResetPassword`;
//const userChangePassword = `${endpoint}/ChangePassword`;

// New user-service endpoints (FastAPI @ http://10.96.188.185/api/v1)
const v1 = {
  login: '/login/',
  currentUser: '/current_user/',
  getUser: '/user/get_user/',
  changePassword: '/user/change_password/',
  requestReset: '/user/request_reset_password/',
  resetPassword: (token) => `/user/reset_user_password/${encodeURIComponent(token)}`,
  logout: '/logout/',
  updateUser: '/user/update_user/',                 // NEW
  uploadProfilePic: '/user/upload_profile_pic/',    // NEW
  getProfilePic: '/user/profile_pic/',              // NEW
  deleteProfilePic: '/user/delete_profile_pic/',    // NEW
  rolesName: '/roles_name/',                        // NEW
  resendRegistrationEmail: '/user/request/resend_registration_email', // NEW
  requestOtp: '/request-otp/',                      // NEW
  verifyOtp: '/verify-otp/',                        // NEW
  };
  

// **********************  GET REQUESTS *************************

// New service returns the current user's profile; userID is ignored now.
const getUser = async (userID, maskNRIC = true) => {
  const token =
    (await authStorage.getToken('userAuthTokenV1'))
    //(await authStorage.getToken('userAuthToken')); // fallback
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return client.get(v1.getUser, {}, { baseURL: V1_BASE, headers });
};

// **********************  POST REQUESTS *************************

export const loginUser = async ({ email, role, password }) => {
  // 1) New user-service login (form-encoded)
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  form.append('grant_type', 'password');

  const resp = await client.post(v1.login, form, {
    baseURL: V1_BASE,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!resp.ok) return resp;

  const data = resp.data || {};
  // accept multiple token shapes
  const v1Access =
    data.accessToken ||
    data.token ||
    data.access_token ||
    (data.data && (data.data.accessToken || data.data.token || data.data.access_token));
  const v1Refresh =
    data.refreshToken ||
    data.refresh_token ||
    (data.data && (data.data.refreshToken || data.data.refresh_token));

  if (!v1Access) {
    console.log('loginUser(v1): NO ACCESS TOKEN — keys:', Object.keys(data || {}));
    return { ...resp, ok: false, problem: 'NO_ACCESS_TOKEN' };
  }

  // store under v1-specific keys (don’t overwrite legacy)
  await authStorage.storeToken('userAuthTokenV1', v1Access);
  if (v1Refresh) await authStorage.storeToken('userRefreshTokenV1', v1Refresh);

  // optional: keep generic key as v1 for older code paths
  //await authStorage.storeToken('userAuthToken', v1Access);
  //if (v1Refresh) await authStorage.storeToken('userRefreshToken', v1Refresh);

  // 2) Legacy login (JSON payload) → needed for old endpoints (e.g., /Patient/patientList)
  //const legacyBody = { email, role, password };
 // const legacyResp = await client.post('/User/Login', legacyBody, {
    //headers: { 'Content-Type': 'application/json-patch+json' },
    // baseURL defaults to legacy; no need to override
  //});

  if (legacyResp?.ok) {
    const l = legacyResp.data || {};
    const legacyAccess =
      l.accessToken ||
      l.token ||
      (l.data && (l.data.accessToken || l.data.token || l.data.BearerToken));
    const legacyRefresh =
      l.refreshToken ||
      l.RefreshToken ||
      (l.data && (l.data.refreshToken || l.data.RefreshToken));

    if (legacyAccess) {
      await authStorage.storeToken('userAuthTokenLegacy', legacyAccess);
      if (legacyRefresh) await authStorage.storeToken('userRefreshTokenLegacy', legacyRefresh);
    } else {
      console.log('loginUser(legacy): no token in response — keys:', Object.keys(l || {}));
    }
  } else {
    console.log('loginUser(legacy): failed', legacyResp?.status, legacyResp?.data);
  }

  // set a default header for immediate v1 calls (legacy will be set per-request via client.js transform)
  client.setHeaders({ Authorization: `Bearer ${v1Access}` });
  console.log('AUTH HEADER NOW:', client.axiosInstance?.defaults?.headers?.common?.Authorization);

  return resp;
};

/* Forgot password (request email with reset link) */
const requestResetPassword = ({ nric, email, roleName, nric_DateOfBirth }) => {
  const body = {
    nric: (nric || '').trim().toUpperCase(),
    email: (email || '').trim().toLowerCase(),
    roleName: (roleName || '').trim().toUpperCase(),
  };
  if (nric_DateOfBirth) body.nric_DateOfBirth = nric_DateOfBirth; // "YYYY-MM-DD"

  return client.post(v1.requestReset, body, { baseURL: V1_BASE });
};
// Set new password using token from email link
const resetPassword = (token, { newPassword, confirmPassword }) =>
  client.put(
    v1.resetPassword(token),
    { newPassword, confirmPassword },
    { baseURL: V1_BASE }
  );

/* ======================= PUT / UPDATE ======================= */

const changePassword = (Email /*unused*/, OldPassword, NewPassword) =>
  client.put(
    v1.changePassword,
    { currentPassword: OldPassword, newPassword: NewPassword, confirmPassword: NewPassword },
    { baseURL: V1_BASE }
  );


// New API for updateUser
const updateUserV1 = async (data) =>
  client.put(v1.updateUser, data, { baseURL: V1_BASE });

// updateUser: tries new v1 API first; if it fails, auto-fallback to legacy, to ensure safe migration
//const updateUser = async (data) => {
  //const res = await updateUserV1(data);
  //if (res?.ok) return res;

  //console.log('[updateUser] v1 failed, falling back to legacy:', res?.status);
  //return updateUserLegacy(data);
//
//};
const updateUser = async (data) => updateUserV1(data);

// Adding in Profile Picture functions
// Upload profile picture 
const uploadProfilePicV1 = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post(v1.uploadProfilePic, form, {
    baseURL: V1_BASE,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Get profile picture 
const getProfilePicV1 = () =>
  client.get(v1.getProfilePic, {}, { baseURL: V1_BASE });

// Delete profile picture
const deleteProfilePicV1 = () =>
  client.delete(v1.deleteProfilePic, {}, { baseURL: V1_BASE });

// Adding in Role List functions
const v1GetRoleNames = (page = 0, page_size = 50) =>
  client.get(v1.rolesName, { page, page_size }, { baseURL: V1_BASE });

// Adding in Resending of Verfication Email functions
const resendRegistrationEmailV1 = ({ nric, email, roleName, nric_DateOfBirth }) =>
  client.post(
    v1.resendRegistrationEmail,
    { nric, email, roleName, nric_DateOfBirth },
    { baseURL: V1_BASE }
  );

// Adding in OTP functions 
const requestOtpV1 = (user_email) =>
  client.post(
    v1.requestOtp,
    null,
    { baseURL: V1_BASE, params: { user_email } }
  );

const verifyOtpV1 = (user_email, code) =>
  client.get(
    v1.verifyOtp,
    { user_email, code },
    { baseURL: V1_BASE }
  );


const logoutUser = async () => {
  // New service uses DELETE /logout/
  try {
    await client.delete(v1.logout, {}, { baseURL: V1_BASE });
  } catch {}
  // clear both token sets
  await authStorage.deleteToken?.('userAuthTokenV1');
  await authStorage.deleteToken?.('userRefreshTokenV1');
  await authStorage.deleteToken?.('userAuthTokenLegacy');
  await authStorage.deleteToken?.('userRefreshTokenLegacy');
  // generic fallbacks
  await authStorage.deleteToken?.('userAuthToken');
  await authStorage.deleteToken?.('userRefreshToken');
};

/*
 * Expose your end points here
 */
export default {
  loginUser,
  requestResetPassword,
  resetPassword,
  getUser,
  changePassword,
  logoutUser,
  updateUser,          // v1-only
  updateUserV1,        // explicit v1
  updateUserLegacy,    // explicit legacy
  uploadProfilePicV1,
  getProfilePicV1,
  deleteProfilePicV1,
  v1GetRoleNames,
  resendRegistrationEmailV1,
  requestOtpV1,
  verifyOtpV1,
};
