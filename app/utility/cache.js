import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
/*
 *  Purpose of this cache.js: Provide an abstraction to get and store data in a cache layer. This will be important when app is offline.
 *  Documentation to read: https://react-native-async-storage.github.io/async-storage/docs/usage/
 */

const prefix = 'cache';
const expiryInMinutes = 5;

// Store data in cache method
const store = async (key, value) => {
  try {
    const item = {
      value,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(prefix + key, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

// Cache eviction checker
// Returns a boolean value by checking current time against storedTime
const isExpired = (item) => {
  const now = moment(Date.now());
  const storedTime = moment(item.timestamp);
  return now.diff(storedTime, 'minutes') > expiryInMinutes;
};

// Get data from cache
const get = async (key) => {
  try {
    const value = await AsyncStorage.getItem(prefix + key);
    const item = JSON.parse(value);

    // No item found
    if (!item) {
      return null;
    }

    // If expired, perform cache eviction and return null value
    if (isExpired(item)) {
      await AsyncStorage.removeItem(prefix + key);
      return null;
    }

    // returns value of item
    return item.value;
  } catch (error) {
    console.log(error);
  }
};

export default {
  store,
  get,
};
