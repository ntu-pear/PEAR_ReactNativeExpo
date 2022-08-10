/*
 * Responsible for storing and retrieving user authentication.
 * Abstraction for persistent storage.
 * Documentation: https://docs.expo.dev/versions/latest/sdk/securestore/
 */
import * as SecureStore from 'expo-secure-store';
import jwt_decode from 'jwt-decode';

/*
 * All constants to be defined here
 */
const authKey = 'userAuthToken';
const refreshKey = 'userRefreshToken';

/*
 * Stores (key, authToken) into a global secure storage
 */
const storeToken = async (key, authToken) => {
  try {
    await SecureStore.setItemAsync(key, authToken);
  } catch (error) {
    console.log('Error storing the auth token', error);
  }
};

/*
 * Gets token from global secure storage
 */
const getToken = async (key) => {
  try {
    const authToken = await SecureStore.getItemAsync(key);
    return authToken;
  } catch (error) {
    console.log('Error retrieving the auth token', error);
  }
};

/*
 * Responsible for decoding existing token
 * and returning the `user` results [used in app.js]
 */
const getUser = async () => {
  const token = await getToken('userAuthToken');
  const user = jwt_decode(token);
  return token ? user : null;
};

/*
 * Removes token from global secure storage when user logs out
 */
const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(authKey);
    await SecureStore.deleteItemAsync(refreshKey);
  } catch (error) {
    console.log('Error removing the auth token', error);
  }
};

export default {
  getUser,
  getToken,
  removeToken,
  storeToken,
};
