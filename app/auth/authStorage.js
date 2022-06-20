/*
 * Responsible for storing and retrieving user authentication.
 * Abstraction for persistent storage.
 * Documentation: https://docs.expo.dev/versions/latest/sdk/securestore/
 */
import * as SecureStore from "expo-secure-store";
import jwt_decode from 'jwt-decode';

/*
 * All constants to be defined here
 */
const key = "userAuthToken";

/*
 * Stores (key, authToken) into a global secure storage
 */
const storeToken = async (authToken) => {
  try {
    await SecureStore.setItemAsync(key, authToken);
  } catch (error) {
    console.log("Error storing the auth token", error);
  }
};

/*
 * Gets token from global secure storage
 */
const getToken = async () => {
  try {
    const authToken = await SecureStore.getItemAsync(key);
    return authToken;
  } catch (error) {
    console.log("Error retrieving the auth token", error);
  }
};

/*
* Responsible for decoding existing token 
* and returning the `user` results [used in app.js]
*/
const getUser = async () => {
  const token = await getToken();
  const user = jwt_decode(token)
  return (token) ? user : null;
}

/*
 * Removes token from global secure storage when user logs out
 */
const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log("Error removing the auth token", error);
  }
};

export default {
    getUser,
    removeToken,
    storeToken
}