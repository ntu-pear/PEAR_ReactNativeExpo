/*
 * Responsible for storing and retrieving user authentication.
 * Abstraction for persistent storage.
 * Documentation: https://docs.expo.dev/versions/latest/sdk/securestore/
 */
import * as SecureStore from "expo-secure-store";

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
    getToken,
    removeToken,
    storeToken
}