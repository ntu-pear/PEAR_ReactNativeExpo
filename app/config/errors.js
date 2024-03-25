export default {
  loginError: 'Invalid email and/or user role and/or password',
  notEmptyError: 'Field cannot be empty',
  notUnselectedError: 'Field must have a selection',
  nameError: 'Field cannot contain numbers or symbols',
  alphaOnly: 'Field can only contain alphabets',
  nricFormatError: 'Invalid NRIC format',
  nricError: 'Invalid NRIC',
  homePhoneNoError: 'Home telephone no. must start with the digit 6, and must have 8 digits.',
  mobilePhoneNoError: 'Mobile no. must start with the digit 8 or 9, and must have 8 digits.',
  postalCodeError: 'Postal code must have 6 digits',
  emailError: 'Invalid Email',
  duplicatePrefNameError: 'Preferred name is already in use. Please enter a different value.'
};

export const getErrorMsgFromCode = (codr) => {
  switch(code) {
    case 400: 
      return "There was a problem with your request. Please double-check your inputs and try again.";
    case 401: 
      return "You are not authorized to access this resource. Please make sure you're logged in with the correct credentials.";
    case 403: 
      return "You don't have permission to access this resource. If you believe this is an error, please contact support for assistance.";
    case 404: 
      return "The resource you are looking for could not be found.";
    case 500: 
      return "Something went wrong on our end. Please try again later.";
    case 503: 
      return "The service is temporarily unavailable. Please try again later. If the problem persists, please contact support.";
    default:
      return "Something went wrong. Please try again later."

  }

}