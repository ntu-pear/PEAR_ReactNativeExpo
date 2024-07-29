import errors from 'app/config/errors';

export const notEmpty = (value) => {
  if (!value) {
    return errors.notEmptyError;
  }
};

export const notUnselected = (value) => {
  if (value == 0) {
    return errors.notUnselectedError;
  }
};

export const nameFormat = (value) => {
  if (/[!@#$%^&*(),.?":{}|<>]/g.test(value) || /\d+/g.test(value)) {
    return errors.alphaOnlyError;
  }
};

export const nricFormat = (value) => {
  if (!/^[STFGMstfgm]\d{7}[A-Za-z]$/.test(value)) {
    return errors.nricFormatError;
  }
};

export const passwordFormat = (value) => {
  if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(value)) {
    return errors.passwordFormatError;
  }
};

export const addressFormat = (value) => {
  if(!/^(?!\s)(?!.*\s{2})([a-zA-Z0-9\s,#-]*[a-zA-Z0-9])$/.test(value)) {
    return errors.addressFormatError;
  }
};

export const nricValid = (value) => {
  const first = value[0];
  const digits = value.slice(1, -1);
  const last = value[8];

  const weights = [2, 7, 6, 5, 4, 3, 2];
  let checksum = 0;

  for (var c in digits) {
    checksum += digits[c] * weights[c];
  }

  if (first.toUpperCase() == 'T' || first.toUpperCase() == 'G') {
    checksum += 4;
  }

  checksum = checksum % 11;

  const checkFG = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
  const checkST = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

  const valid =
    ((first.toUpperCase() == 'F' || first.toUpperCase() == 'G') &&
      last.toUpperCase() == checkFG[checksum]) ||
    ((first.toUpperCase() == 'S' || first.toUpperCase() == 'T') &&
      last.toUpperCase() == checkST[checksum]);
  if (!valid) {
    return errors.nricError;
  }
};

export const homePhoneNoFormat = (value) => {
  if (!/^$|^6[0-9]{7}$/.test(value)) {
    return errors.homePhoneNoError;
  }
};

export const mobilePhoneNoFormat = (value) => {
  if (!/^$|^[89][0-9]{7}$/.test(value)) {
    return errors.mobilePhoneNoError;
  }
};

export const postalCodeFormat = (value) => {
  if (!/^$|[0-9]{6}$/.test(value)) {
    return errors.postalCodeError;
  }
};

export const emailFormat = (value) => {
  if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)) {
    return errors.emailError;
  }
};

export const uniquePrefName = (value, list) => {
  if (list.map((x) => x.toUpperCase()).includes(value)) {
    return errors.duplicatePrefNameError;
  }
};

export const temperatureFormat = (value) => {
  //regular expression to match number with decimal places
  const regex = /^-?\d+(\.\d+)?$/;

  if (!regex.test(value)) {
    return errors.temperatureError; // Invalid number format
  }
  
  // Convert the value to a floating-point number
  const temperature = parseFloat(value);

  if (temperature < 35.0 || temperature > 42.0) {
    return errors.temperatureError;
  }
};

export const systolicBPRange = (value) => {
  if (!(value >= 70 && value <= 160)) {
    return errors.systolicBPError;
  }
};

export const diastolicBPRange = (value) => {
  if (!(value >= 40 && value <= 120)) {
    return errors.diastolicBPError;
  }
};

export const spO2Range = (value) => {
  if (!(value >= 60 && value <= 120)) {
    return errors.spO2Error;
  }
};

export const bloodSugarLevelRange = (value) => {
  if (!(value >= 50 && value <= 250)) {
    return errors.bloodSugarLevelError;
  }
};

export const heartRateRange = (value) => {
  if (!(value >= 0 && value <= 300)) {
    return errors.heartRateError;
  }
};

export const weightRange = (value) => {
  if (!(value >= 0 && value <= 200)) {
    return errors.weightError;
  }
};

export const heightRange = (value) => {
  if (!(value >= 0 && value <= 200)) {
    return errors.heightError;
  }
};

export const frequencyPerDayRange = (value) => {
  if (!(value >= 1 && value <= 24)) {
    return errors.frequencyPerDayError;
  }
};

export const validationFunctions = {
  name: [nameFormat],
  nric: [nricFormat, nricValid],
  'address': [addressFormat],
  'home phone': [homePhoneNoFormat],
  'mobile phone': [mobilePhoneNoFormat],
  email: [emailFormat],
  'postal code': [postalCodeFormat],
  'temperature': [temperatureFormat],
  'systolicBP' : [systolicBPRange],
  'diastolicBP' : [diastolicBPRange],
  'spO2' : [spO2Range],
  'bloodSugarLevel': [bloodSugarLevelRange],
  'heartRate' : [heartRateRange], 
  'weight' : [weightRange],
  'height' : [heightRange],
  'frequencyPerDay': [frequencyPerDayRange],
  password: [passwordFormat],
};
