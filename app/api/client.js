import { create } from "apisauce";
import cache from "../utility/cache";
import authStorage from "../auth/authStorage";

const baseURL = "https://coremvc.fyp2017.com/api";
const endpoint = "/User";
const userRefreshToken = endpoint + "/RefereshToken";
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  baseURL: "https://coremvc.fyp2017.com/api",
});

// Method override on apiClient.get()
const get = apiClient.get;
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
  const bearerToken = await authStorage.getToken("userAuthToken");
  bearerToken
    ? apiClient.setHeaders({
        Authorization: `Bearer ${bearerToken}`,
      })
    : null;
};

// Reference: https://github.com/infinitered/apisauce/issues/206
// Purpose: If token expired, performs a token refresh and replaces
// existing token with the refreshed token
apiClient.addAsyncResponseTransform(async (response) => {
  console.log("TESTING FAILED NETWORK")
  console.log(response);
  // const { setUser } = useContext(AuthContext);
  if (response.status === 401 || response.status === 403) {
    console.log("HELLO IM HERE")
    const accessToken = await authStorage.getToken("userAuthToken");
    const refreshToken = await authStorage.getToken("userRefreshToken");
    console.log("this is access token")
    console.log(accessToken)
    console.log("this is refreshtoken")
    console.log(refreshToken)
    const data = await apiClient.post(`${userRefreshToken}`, {
      accessToken: accessToken, 
      refreshToken: refreshToken,
    });
    console.log("THIS IS DATA")
    console.log(data)
    const res = data;
    if (!res.ok) {
      // if refreshToken invalid, remove token
      await authStorage.removeToken();
      // TODO: Implement logout() here.
    } else {
      const bearerToken = res.accessToken;
      apiClient.setHeaders({
        Authorization: `Bearer ${bearerToken}`,
      })
      await authStorage.removeToken();
      authStorage.storeToken("userAuthToken", res.accessToken);
      authStorage.storeToken("userRefreshToken", res.refreshToken);
      // retry
      const data = await apiClient.any(response.config);
      // replace data
      response.data = data.data;
    }
  }
});

setHeader();

export default apiClient;
