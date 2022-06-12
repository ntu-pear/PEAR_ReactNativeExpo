import { create } from "apisauce";
/*
 *   Purpose of this is create a layer of abstraction
 */
const apiClient = create({
  baseURL: "https://coremvc.fyp2017.com/api",
});

export default apiClient;
