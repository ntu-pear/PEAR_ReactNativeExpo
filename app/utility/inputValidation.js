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

export const validationFunctions = {
  name: [nameFormat],
  nric: [nricFormat, nricValid],
  'home phone': [homePhoneNoFormat],
  'mobile phone': [mobilePhoneNoFormat],
  email: [emailFormat],
  'postal code': [postalCodeFormat],
};
