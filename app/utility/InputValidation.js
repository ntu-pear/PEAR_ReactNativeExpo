import errors from "app/config/errors";

export const notEmpty = (value) => {
  if (!value) {
    return errors.notEmptyError;
  }
}

export const notUnselected = (value) => {
  if(value == 1) {
    return errors.notUnselectedError;
  }
}

export const alphaOnly = (value) => {
  if (/[!@#$%^&*(),.?":{}|<>]/g.test(value) || /\d+/g.test(value)) {
    return errors.alphaOnlyError;
  }   
};

export const nricFormat = (value) => {
  if(!/^[STFGMstfgm]\d{7}[A-Za-z]$/.test(value)) {
    return errors.nricError;
  }
}

export const homePhoneNoFormat = (value) => {
  if (!/^$|^6[0-9]{7}$/.test(value)) {
    return errors.homePhoneNoError;
  } 
}

export const mobilePhoneNoFormat = (value) => {
  if (!/^$|^[89][0-9]{7}$/.test(value)) {
    return errors.mobilePhoneNoError;
  }
}

export const emailFormat = (value) => {
  if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)) {
    return errors.emailError;
  }
}