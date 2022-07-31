import { create } from "apisauce";
import cache from "../utility/cache";
import authStorage from "../auth/authStorage";

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

apiClient.addAsyncResponseTransform(async (response) => {
  // const { setUser } = useContext(AuthContext);
  if (response.data.code === 401 || response.data.code === 403) {
    const accessToken = await authStorage.get("userAuthToken");
    const refreshToken = await authStorage.get("userRefreshToken");
    const data = await apiClient.post(`${userRefreshToken}`, {
      accessToken: accessToken, 
      refreshToken: refreshToken,
    });
    const res = data.data;
    if (!res.success) {
      // if refreshToken invalid, logout
      // setUser(null);
      await authStorage.removeToken();
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
