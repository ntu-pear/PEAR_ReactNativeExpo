import { create } from 'apisauce';
import authStorage from 'app/auth/authStorage';
import cache from 'app/utility/cache';

// const baseURL = 'http://172.21.148.180:5678/api'; // old NTU server - changes to new api
//const baseURL = 'http://10.96.188.173:5678/api'; // old server for PEAR_CORE webapp
// const baseURL = 'http://192.168.188.173:5678/api'; // changed on 13 jan
// const baseURL = 'https://coremvc.fyp2017.com/api'; // old server

// === User-service lives on a different server ===
export const V1_BASE = 'http://10.96.188.185/api/v1';

// === Patient-service (FastAPI) ===
export const PATIENT_V1_BASE = 'http://10.96.188.180/api/v1';

//const endpoint = '/User';
//const userRefreshToken = `${endpoint}/RefreshToken`;
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  // for local/ staging BE
  baseURL: V1_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});


// Attach ONLY v1 auth. Never fall back to legacy tokens or legacy endpoints.
apiClient.addAsyncRequestTransform(async (request) => {
  const url = `${(request.baseURL || V1_BASE)}${request.url || ''}`;
   
  // Don't attach auth for login/refresh
  if (url.endsWith('/login/') || url.endsWith('/refresh/')) return;
  if (request.params?.require_auth === false || request.headers?.['X-No-Auth'] === '1') return;

  const token = await authStorage.getToken('userAuthTokenV1');
   if (token) {
     request.headers = { ...(request.headers || {}), Authorization: `Bearer ${token}` };
   }
 });


// Parse JSON strings when server returns text/plain
apiClient.addResponseTransform((response) => {
  if (typeof response.data === 'string') {
    try { response.data = JSON.parse(response.data); } catch {} 
     }
   });



apiClient.addAsyncResponseTransform(async (response) => {
   if (response?.status === 401) {
   await authStorage.deleteToken?.('userAuthTokenV1');
   await authStorage.deleteToken?.('userRefreshTokenV1');
     }
   });


export default apiClient;
