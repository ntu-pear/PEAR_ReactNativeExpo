import { create } from "apisauce";
import cache from "../utility/cache";
import authStorage from "../auth/authStorage";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import WelcomeScreen from "../screens/WelcomeScreen";

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
// TODO: FIX RefreshToken Issue [https://trello.com/c/LiDqXESB/163-fix-refreshtoken-issue]
apiClient.addAsyncResponseTransform(async (response) => {
  // const navigation = useNavigation();
  console.log("TESTING FAILED NETWORK")
  console.log(response);
  // const { setUser } = useContext(AuthContext);
  if (response && response.status && (response.status === 401 || response.status === 403)) {
    console.log("HELLO IM HERE")
    const accessToken = await authStorage.getToken("userAuthToken");
    const refreshToken = await authStorage.getToken("userRefreshToken");
    console.log("this is access token")
    console.log(accessToken)
    console.log("this is refreshtoken")
    console.log(refreshToken)
    var body = JSON.stringify({accessToken, refreshToken})
    console.log("THIS IS THE BODY");
    console.log(body)
    const data = await apiClient.post(`${baseURL}${userRefreshToken}`, body);
    console.log("THIS IS DATA")
    console.log(data)
    const res = data;
    if (!res.ok) {
      // if refreshToken invalid, remove token
      // await authStorage.removeToken();
      // console.log("HELLO IM HERE")
      // // TODO: Implement logout() here.
      // navigation.navigate(routes.WELCOME);
      return (
        <WelcomeScreen />
      )
    } else {
      const bearerToken = res.accessToken;
      apiClient.setHeaders({
        Authorization: `Bearer ${bearerToken}`,
      })
      await authStorage.removeToken();
      authStorage.storeToken("userAuthToken", res.accessToken);
      authStorage.storeToken("userRefreshToken", res.refreshToken);
      // // retry
      // const data = await apiClient.any(response.config);
      // // replace data
      // response.data = data.data;
    }
  }
});

setHeader();

export default apiClient;
