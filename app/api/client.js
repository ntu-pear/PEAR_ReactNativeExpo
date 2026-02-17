/* eslint eslint-comments/no-unlimited-disable: error */
import { create } from 'apisauce';
import authStorage from 'app/auth/authStorage';

/*
 * Base URLs for different services
 * (update IPs if your backend changes)
 */
export const V1_BASE = 'http://10.96.188.185/api/v1';  // User Service v1 (.185 - staging, .171:5678 - prod)

export const PATIENT_V1_BASE = 'http://10.96.188.180/api/v1';  // Patient Service v1 (.180 - staging, .172:5679 - prod)

export const SCHEDULER_V1_BASE = 'http://10.96.188.186:5679'; // Scheduler Service v1

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
 * Helper to set global headers dynamically (used in login)
 */
client.setHeaders = (headers) => {
  Object.assign(client.axiosInstance.defaults.headers.common, headers);
};

/*
 * Export for other APIs
 */
export default client;
