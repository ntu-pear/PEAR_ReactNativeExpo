/*eslint eslint-comments/no-unlimited-disable: error */
import client, { V1_BASE } from 'app/api/client';
import authStorage from 'app/auth/authStorage';

/*
 * List all end points here
 */
const v1 = {
  login: '/login/',
  currentUser: '/current_user/',
  getUser: '/user/get_user/',
  changePassword: '/user/change_password/',
  requestReset: '/user/request_reset_password/',
  resetPassword: (token) => `/user/reset_user_password/${encodeURIComponent(token)}`,
  logout: '/logout/',
  updateUser: '/user/update_user/',                 
  uploadProfilePic: '/user/upload_profile_pic/',   
  getProfilePic: '/user/profile_pic/',              
  deleteProfilePic: '/user/delete_profile_pic/',    
  rolesName: '/roles_name/',                        
  resendRegistrationEmail: '/user/request/resend_registration_email', 
  requestOtp: '/request-otp/',                      
  verifyOtp: '/verify-otp/',                        
};

// **********************  GET REQUESTS *************************

// New service returns the current user's profile; userID is ignored now.
const getUser = async () => {
  const token = await authStorage.getToken('userAuthTokenV1');
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return client.get(v1.getUser, {}, { baseURL: V1_BASE, headers });
};

// **********************  POST REQUESTS *************************

export const loginUser = async ({ email, role, password }) => {
  console.log('[loginUser] called with:', { email, role, password });

  // --- Fix for React Native (no URLSearchParams support) ---
  const form = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&grant_type=password`;

  const resp = await client.post(v1.login, form, {
    baseURL: V1_BASE,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!resp.ok) return resp;

  const data = resp.data || {};

  // Accept multiple token shapes from backend
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

  // Store under v1-specific keys
  await authStorage.storeToken('userAuthTokenV1', v1Access);
  if (v1Refresh) await authStorage.storeToken('userRefreshTokenV1', v1Refresh);

  // Set header for future v1 calls
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

const changePassword = (OldPassword, NewPassword) =>
  client.put(
    v1.changePassword,
    { currentPassword: OldPassword, newPassword: NewPassword, confirmPassword: NewPassword },
    { baseURL: V1_BASE }
  );

//API for updateUser
const updateUserV1 = async (data) =>
  client.put(v1.updateUser, data, { baseURL: V1_BASE });

// **********************  PROFILE PIC *************************

const uploadProfilePicV1 = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post(v1.uploadProfilePic, form, {
    baseURL: V1_BASE,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getProfilePicV1 = () =>
  client.get(v1.getProfilePic, {}, { baseURL: V1_BASE });

const deleteProfilePicV1 = () =>
  client.delete(v1.deleteProfilePic, {}, { baseURL: V1_BASE });

// **********************  ROLES / EMAIL / OTP *************************

const v1GetRoleNames = (page = 0, page_size = 50) =>
  client.get(v1.rolesName, { page, page_size }, { baseURL: V1_BASE });

const resendRegistrationEmailV1 = ({ nric, email, roleName, nric_DateOfBirth }) =>
  client.post(
    v1.resendRegistrationEmail,
    { nric, email, roleName, nric_DateOfBirth },
    { baseURL: V1_BASE }
  );

const requestOtpV1 = (user_email) =>
  client.post(v1.requestOtp, null, { baseURL: V1_BASE, params: { user_email } });

const verifyOtpV1 = (user_email, code) =>
  client.get(v1.verifyOtp, { user_email, code }, { baseURL: V1_BASE });

// **********************  LOGOUT *************************

const logoutUser = async () => {
  try {
    await client.delete(v1.logout, {}, { baseURL: V1_BASE });
  } catch {}
  await authStorage.deleteToken?.('userAuthTokenV1');
  await authStorage.deleteToken?.('userRefreshTokenV1');
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
  updateUser,
  updateUserV1,
  uploadProfilePicV1,
  getProfilePicV1,
  deleteProfilePicV1,
  v1GetRoleNames,
  resendRegistrationEmailV1,
  requestOtpV1,
  verifyOtpV1,
};
