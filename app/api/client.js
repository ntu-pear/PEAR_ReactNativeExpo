/* eslint eslint-comments/no-unlimited-disable: error */
import { create } from 'apisauce';
import axios from 'axios';
import { observeActivityRead } from 'app/utility/activityReadDiagnostics';
import authStorage from 'app/auth/authStorage';

/*
 * Base URLs for different services
 * (update IPs if your backend changes)
 */
// Staging service targets match Bryan-confirmed web frontend 10.96.188.185:5173.
// Verified public schemas are recorded in the separate Oct 5 parity evidence.
export const V1_BASE = 'http://10.96.188.185/api/v1';

export const PATIENT_V1_BASE = 'http://10.96.188.180/api/v1'; // Patient Service v1 (.180 - staging, .172:5679 - prod)

export const ACTIVITY_V1_BASE = 'http://10.96.188.186:5681/api/v1'; // Verified staging Activity

export const SCHEDULER_V1_BASE = 'http://10.96.188.186:5682'; // Verified staging Scheduler

const client = create({
  baseURL: V1_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

/*
 * Attach bearer token automatically if it exists
 */
client.addAsyncRequestTransform(async (request) => {
  const token = await authStorage.getToken('userAuthTokenV1');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
});

/*
 * Global session expiry callback
 * Fires only when token refresh also fails — forces re-login.
 */
let _onSessionExpired = null;
let _sessionExpiredFired = false;

export const setSessionExpiredHandler = (handler) => {
  _onSessionExpired = handler;
  _sessionExpiredFired = false; // reset when a new handler is registered (e.g. after re-login)
};

/*
 * Token refresh with automatic retry via Axios interceptor
 *
 * Flow:
 * 1. API call returns 401
 * 2. Interceptor reads refresh token from storage
 * 3. Calls POST /api/v1/refresh/ with the refresh token
 * 4. On success: stores new access token, retries the original request
 * 5. On failure: triggers session expired callback (forces re-login)
 *
 * A mutex (_isRefreshing + _refreshQueue) ensures only one refresh
 * request is in-flight at a time; concurrent 401s queue up and
 * resolve once the single refresh completes.
 */
let _isRefreshing = false;
let _refreshQueue = []; // { resolve, reject }[]

const processQueue = (error, token = null) => {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  _refreshQueue = [];
};

client.axiosInstance.interceptors.response.use(
  (response) => {
    observeActivityRead(response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    observeActivityRead(error.response, originalRequest, error.code);

    // Only handle 401 and only retry once per request
    if (
      error.response?.status !== 401 ||
      originalRequest?.pearNoAuthReplay ||
      !originalRequest ||
      originalRequest._retry ||
      /\/login\/?$|\/refresh\/?$/.test(originalRequest.url || '')
    ) {
      return Promise.reject(error);
    }

    // Every request gets one refresh attempt, including requests in the queue.
    originalRequest._retry = true;
    // If a refresh is already in progress, queue this request
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client.axiosInstance(originalRequest);
      });
    }

    _isRefreshing = true;

    try {
      const refreshToken = await authStorage.getToken('userRefreshTokenV1');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the refresh endpoint directly with axios to avoid interceptor loop
      const refreshResponse = await axios.post(
        `${V1_BASE}/refresh/`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = refreshResponse.data || {};
      const newAccessToken =
        data.accessToken ||
        data.token ||
        data.access_token ||
        (data.data &&
          (data.data.accessToken || data.data.token || data.data.access_token));
      const newRefreshToken =
        data.refreshToken ||
        data.refresh_token ||
        (data.data && (data.data.refreshToken || data.data.refresh_token));

      if (!newAccessToken) {
        throw new Error('Refresh response did not contain an access token');
      }

      // Store new tokens
      await authStorage.storeToken('userAuthTokenV1', newAccessToken);
      if (newRefreshToken) {
        await authStorage.storeToken('userRefreshTokenV1', newRefreshToken);
      }

      // Update default header for future requests
      client.setHeaders({ Authorization: `Bearer ${newAccessToken}` });

      // Resolve all queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client.axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — session is truly expired
      if (!_sessionExpiredFired && _onSessionExpired) {
        _sessionExpiredFired = true;
        _onSessionExpired();
      }

      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);

/*
 * Helper to set global headers dynamically (used in login)
 */
client.setHeaders = (headers) => {
  Object.assign(client.axiosInstance.defaults.headers.common, headers);
};

/*
 * Export for other APIs
 */
export default client;
