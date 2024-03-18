import { create } from 'apisauce';
import authStorage from 'app/auth/authStorage';
import cache from 'app/utility/cache';

const baseURL = 'http://172.21.148.180:5678/api'; // new NTU server
// const baseURL = 'https://coremvc.fyp2017.com/api'; // old server

const endpoint = '/User';
const userRefreshToken = `${endpoint}/RefreshToken`;
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  // for local/ staging BE
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
  // console.log('addAsyncResponseTransform');
  if (
    response &&
    response.status &&
    (response.status === 401 || response.status === 403)
  ) {
    // if access token is invalid, begin renewal.
    console.log('client.js: Renewing user tokens');
    const unformattedUserAccessToken = await authStorage.getToken(
      'userAuthToken',
    );
    const unformattedUserRefreshToken = await authStorage.getToken(
      'userRefreshToken',
    );
    const accessToken = unformattedUserAccessToken.replace(/['"]+/g, '');
    const refreshToken = unformattedUserRefreshToken.replace(/['"]+/g, '');
    let bearerToken = accessToken;
    const body = JSON.stringify({ accessToken, refreshToken });
    const data = await apiClient.post(`${baseURL}${userRefreshToken}`, body);
    // if token refresh is unsuccessful
    if (!data.ok || !data.data.data.success) {
      console.log('client.js: !data.ok || !data.data.data.success');
      console.log(data);
      if (data.data.message) {
        // TODO: include alert component
        console.log('Error: ', data.data.error);
      }
      return Promise.resolve();
    }
    // if token refresh is successful and store the renewed tokens.
    if (data.data.data.accessToken && data.data.data.refreshToken) {
      await authStorage.storeToken('userAuthToken', data.data.data.accessToken);
      await authStorage.storeToken(
        'userRefreshToken',
        data.data.data.refreshToken,
      );
      // set the new bearer token
      bearerToken = data.data.data.accessToken;
      apiClient.setHeaders({
        Authorization: `Bearer ${bearerToken}`,
      });
      console.log('Token renewed');
      console.log('New access token: ', data.data.data.accessToken);
      console.log('New refresh token: ', data.data.data.refreshToken);
    }
    // retry API call
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
    return Promise.resolve();
  }
});

export default apiClient;
