import { create } from 'apisauce';
import cache from 'app/utility/cache';
import authStorage from 'app/auth/authStorage';
import { Platform } from 'react-native';

const baseURL = 'https://coremvc.fyp2017.com/api';
// for CORS error
// const baseURLWeb = 'http://localhost:5383/api';
// API for BE staging stage 
const baseURLWeb = 'https://ntu-fyp-pear-core.azurewebsites.net/api';
const endpoint = '/User';
const userRefreshToken = `${endpoint}/RefreshToken`;
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  baseURL: Platform.OS === 'web' ? baseURLWeb : baseURL,
});

// Method override on apiClient.get()
const { get } = apiClient;
apiClient.get = async (url, params, axiosConfig) => {
  const response = await get(url, params, axiosConfig);

  // If there's network connectivity == we can query api successfully; then store data in cache
  if (response.ok) {
    cache.store(url, response.data);
    return response;
  }

  // Else, we do not have network connectivity == cannot query api; then retrieve from cache
  const data = await cache.get(url);
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

// Reference: https://github.com/infinitered/apisauce/issues/206
// Purpose: If token expired, performs a token refresh and replaces
// existing token with the refreshed token
// TODO: FIX RefreshToken Issue [https://trello.com/c/LiDqXESB/163-fix-refreshtoken-issue]
apiClient.addAsyncResponseTransform(async (response) => {
  // const navigation = useNavigation();
  if (
    response &&
    response.status &&
    (response.status === 401 || response.status === 403)
  ) {
    const accessToken = await authStorage.getToken('userAuthToken');
    const refreshToken = await authStorage.getToken('userRefreshToken');
    const body = JSON.stringify({ accessToken, refreshToken });
    const data = await apiClient.post(`${baseURL}${userRefreshToken}`, body);
    // const res = JSON.stringify(tmp)
    if (!data.ok || !data.data.success) {
      // if refreshToken invalid, remove token
      // await authStorage.removeToken();
      // console.log("HELLO IM HERE")
      // // TODO: Implement logout() here.
      // navigation.navigate(routes.WELCOME);

      if (data.data.title) {
        // TODO: include alert component
        // return Promise.reject(data.data.title);
        // console.log(data.data.title);
      }
      // return Promise.reject(data.data.error);
      // TODO: include alert component
      // console.log(data.data.error);
      return Promise.resolve();
    }
    const bearerToken = data.data.data.accessToken;
    apiClient.setHeaders({
      Authorization: `Bearer ${bearerToken}`,
    });
    // remove existing token
    await authStorage.removeToken();
    authStorage.storeToken('userAuthToken', data.data.data.accessToken);
    authStorage.storeToken('userRefreshToken', data.data.data.refreshToken);
    if (response && response.config) {
      // replace response.config.header's Authorization with the new Bearer token
      response.config.headers
        ? (response.config.headers.Authorization = `Bearer ${bearerToken}`)
        : null;
      // retry;
      const res = await apiClient.any(response.config);
      // replace data
      response.data = res.data;
    } else {
      return Promise.resolve();
    }
  }
});

export default apiClient;
