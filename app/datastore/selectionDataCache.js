// This is cache system for selection dropdown inputs
let data = {};

// adds new entry to the data storage object
export function setSelectionOptionsCache(key, value) {
  data[key] = JSON.stringify(value);
  // console.log(data);
}

// returns the value of the key(if any) already parsed!
export function getSelectionOptionCache(key) {
  if (data[key]) {
    return JSON.parse(data[key]);
  } else {
    return null;
  }
}
