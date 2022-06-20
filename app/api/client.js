import { create } from "apisauce";
import cache from "../utility/cache";

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
export default apiClient;
