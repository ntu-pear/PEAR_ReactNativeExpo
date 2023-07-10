import { create } from 'apisauce';
import authStorage from 'app/auth/authStorage';
import cache from 'app/utility/cache';
// import { Platform } from 'react-native';
import { useContext } from 'react';
import AuthContext from 'app/auth/context';

const baseURL = 'https://coremvc.fyp2017.com/api';
// for CORS error
// API for local BE
// const baseURLWeb = 'http://localhost:5383/api';
// API for BE staging stage
const baseURLWeb = 'https://ntu-fyp-pear-core.azurewebsites.net/api';
const endpoint = '/User';
const userRefreshToken = `${endpoint}/RefreshToken`;
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  // for local/ staging BE
  // baseURL: Platform.OS === 'web' ? baseURLWeb : baseURL,
  baseURL,
});
// Method override on apiClient.get()
const { get } = apiClient;
apiClient.get = async (url, params, axiosConfig) => {
  const response = await get(url, params, axiosConfig);
  const url_obj = new URL(url, baseURL);
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

// Reference: https://github.com/infinitered/apisauce/issues/206
// Purpose: If token expired, performs a token refresh and replaces
// existing token with the refreshed token
// TODO: FIX RefreshToken Issue [https://trello.com/c/LiDqXESB/163-fix-refreshtoken-issue]
apiClient.addAsyncResponseTransform(async (response) => {
  if (
    response &&
    response.status &&
    (response.status === 401 || response.status === 403)
  ) {
    console.log('client.js: Renewing user tokens');
    const unformattedUserAccessToken = await authStorage.getToken(
      'userAuthToken',
    );
    const unformattedUserRefreshToken = await authStorage.getToken(
      'userRefreshToken',
    );
    const accessToken = unformattedUserAccessToken.replace(/['"]+/g, '');
    const refreshToken = unformattedUserRefreshToken.replace(/['"]+/g, '');

    const body = JSON.stringify({ accessToken, refreshToken });
    // console.log('Body is: ');
    // console.log(body);
    // console.log('POST is: ', `${baseURL}${userRefreshToken}`, body);
    const data = await apiClient.post(`${baseURL}${userRefreshToken}`, body);
    // if token refresh is unsuccessful
    if (!data.ok || !data.data.data.success) {
      const { setUser } = useContext(AuthContext);
      console.log('client.js: !data.ok || !data.data.data.success');
      console.log(data);
      // if refreshToken invalid, remove token
      await authStorage.removeToken();
      // // TODO: Implement logout() here.
      // navigation.navigate(routes.WELCOME);
      if (data.data.message) {
        // TODO: include alert component
        // return Promise.reject(data.data.title);
        console.log('Error: ', data.data.error);
      }
      // return Promise.reject(data.data.error);
      // TODO: include alert component
      setUser(null);
      return Promise.resolve();
    }
    // if token refresh is successful
    const bearerToken = data.data.data.accessToken;
    apiClient.setHeaders({
      Authorization: `Bearer ${bearerToken}`,
    });
    await authStorage.removeToken();
    // console.log('accessToken: ', data.data.data.accessToken);
    // console.log('refreshToken: ', data.data.data.refreshToken);
    await authStorage.storeToken('userAuthToken', data.data.data.accessToken);
    await authStorage.storeToken(
      'userRefreshToken',
      data.data.data.refreshToken,
    );
    if (response && response.config) {
      // Replace response.config.header's Authorization with the new Bearer token
      response.config.headers
        ? (response.config.headers.Authorization = `Bearer ${bearerToken}`)
        : null;
      // retry;
      const res = await apiClient.any(response.config);
      // replace data
      response.data = res.data;
    }
    console.log('Token renewed');
    console.log('New access token: ', data.data.data.accessToken);
    console.log('New refresh token: ', data.data.data.refreshToken);
    return Promise.resolve();
  }
});

export default apiClient;
