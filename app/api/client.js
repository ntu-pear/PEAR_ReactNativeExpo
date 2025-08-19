import { create } from 'apisauce';
import authStorage from 'app/auth/authStorage';
import cache from 'app/utility/cache';

// const baseURL = 'http://172.21.148.180:5678/api'; // old NTU server - changes to new api
const baseURL = 'http://10.96.188.173:5678/api'; // old server for PEAR_CORE webapp
// const baseURL = 'http://192.168.188.173:5678/api'; // changed on 13 jan
// const baseURL = 'https://coremvc.fyp2017.com/api'; // old server

// === User-service lives on a different server ===
export const V1_BASE = 'http://10.96.188.185/api/v1';

const endpoint = '/User';
const userRefreshToken = `${endpoint}/RefreshToken`;
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  // for local/ staging BE
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

apiClient.addAsyncRequestTransform(async (request) => {
  const reqBase = request.baseURL || baseURL;
  const full = `${reqBase}${request.url || ''}`;

  // Skip attaching auth to login endpoints
  if (full.endsWith('/api/v1/login/') || full.endsWith('/api/User/Login')) return;

  const key = full.startsWith(V1_BASE) ? 'userAuthTokenV1' : 'userAuthTokenLegacy';
  let token = await authStorage.getToken(key);
  if (!token) token = await authStorage.getToken('userAuthToken'); // fallback

  if (token) {
    request.headers = { ...(request.headers || {}), Authorization: `Bearer ${token}` };
  }
});

apiClient.addMonitor((res) => {
  const cfg = res.config || {};
  // build full URL
  const full = `${cfg.baseURL || ''}${cfg.url || ''}`;
  // mask auth
  const headers = { ...(cfg.headers || {}) };
  if (headers.Authorization) {
    headers.Authorization = headers.Authorization.replace(/Bearer\s+.+/, 'Bearer ***');
  }
  console.log('[HTTP]', (cfg.method || 'GET').toUpperCase(), full, '->', res.status, res.ok);
  console.log('  req headers:', headers);
  if (cfg.data) {
    console.log('  req body:', typeof cfg.data === 'string' ? cfg.data : JSON.stringify(cfg.data));
  }
  if (!res.ok) {
    console.log('  resp body:', typeof res.data === 'string' ? res.data : JSON.stringify(res.data || {}));
  }
});

// Method override on apiClient.get()
const { get } = apiClient;
apiClient.get = async (url, params, axiosConfig) => {
  const response = await get(url, params, axiosConfig);
  const effectiveBase = (axiosConfig && axiosConfig.baseURL) || baseURL;
  const url_obj = new URL(url, effectiveBase);
  // add parameters to url object
  // e.g. url: /Notifications/User  params: {readStatus: false, ...}
  // becomes /Notifications/User/?readStatus=false...
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url_obj.searchParams.append(key, value);
    });
  }
  // If there's network connectivity == we can query api successfully; then store data in cache
  if (response.ok) {
    cache.store(url_obj.toString(), response.data);
    return response;
  }

  // Else, we do not have network connectivity == cannot query api; then retrieve from cache
  const data = await cache.get(url_obj.toString());
  return data ? { ok: true, data } : response;
};

const setHeader = async () => {
  const bearerToken = await authStorage.getToken('userAuthToken');
  bearerToken
    ? apiClient.setHeaders({
        Authorization: `Bearer ${bearerToken}`,
      })
    : null;
};

setHeader();

apiClient.addResponseTransform((response) => {
  if (typeof response.data === 'string') {
    try { response.data = JSON.parse(response.data); } catch {}
  }
});

// Reference: https://github.com/infinitered/apisauce/issues/206
// Purpose: If token expired, performs a token refresh and replaces
// existing token with the refreshed token
// ---------- SINGLE unified refresh interceptor (legacy + /api/v1) ----------
let refreshInFlight = null;

apiClient.addAsyncResponseTransform(async (response) => {
  const status = response?.status;
  const cfg = response?.config || {};
  if (!status || (status !== 401 && status !== 403) || cfg._retry) return;

  cfg._retry = true;

  // Which server did this request intend to hit?
  const reqBase = cfg.baseURL || baseURL;
  const isV1 = reqBase?.startsWith(V1_BASE);

  // Read tokens from storage
  const rawAccess = await authStorage.getToken('userAuthToken');
  const rawRefresh = await authStorage.getToken('userRefreshToken');
  if (!rawRefresh) return; // can't refresh

  const currentAccess = (rawAccess || '').replace(/['"]+/g, '');
  const refresh = (rawRefresh || '').replace(/['"]+/g, '');

  // Call the matching refresh endpoint
  let refreshRes;
  if (isV1) {
    // FastAPI user-service refresh
    refreshRes = await apiClient.post('/refresh/', { refreshToken: refresh }, { baseURL: V1_BASE });
  } else {
    // Legacy refresh expects BOTH accessToken and refreshToken
    refreshRes = await apiClient.post('/User/RefreshToken', {
      accessToken: currentAccess,
      refreshToken: refresh,
    });
  }

  // Extract new tokens (support multiple response shapes)
  const body = refreshRes?.data || {};
  const deep = body.data || {};
  const newAccess =
    body.accessToken ||
    body.token ||
    deep.accessToken ||
    deep.token ||
    refreshRes?.headers?.authorization?.replace(/Bearer\s+/i, '');
  const newRefresh =
    body.refreshToken || deep.refreshToken || body.RefreshToken || deep.RefreshToken;

  if (!refreshRes?.ok || !newAccess) return; // bubble the 401/403

  // Save/apply new tokens
  await authStorage.storeToken('userAuthToken', newAccess);
  if (newRefresh) await authStorage.storeToken('userRefreshToken', newRefresh);
  apiClient.setHeaders({ Authorization: `Bearer ${newAccess}` });

  // Retry original request with fresh token
  cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${newAccess}` };
  const retried = await apiClient.any(cfg);
  response.data = retried.data;
  response.ok = retried.ok;
  response.status = retried.status;
});
    

export default apiClient;
