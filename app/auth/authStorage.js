// Re-factor for react native web (SecureStore not supported)
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // await AsyncStorage.setItem(key, JSON.stringify(authToken));
    await AsyncStorage.setItem(key, authToken);
  } catch (error) {
    console.log('Error storing the auth token', error);
  }
};

/*
 * Gets token from global secure storage
 */
const getToken = async (key) => {
  try {
    // const authToken = await AsyncStorage.getItem(key);
    // return JSON.parse(authToken) ? JSON.parse(authToken) : null;
    const authToken = await AsyncStorage.getItem(key);
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
  if (token) {
    const user = jwt_decode(token);
    return user;
  }
  return null;
};

/*
 * Removes token from global secure storage when user logs out
 */
const removeToken = async () => {
  try {
    // await AsyncStorage.removeItem(authKey);
    // await AsyncStorage.removeItem(refreshKey);
    await Promise.all([AsyncStorage.removeItem(authKey), AsyncStorage.removeItem(refreshKey)])
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
