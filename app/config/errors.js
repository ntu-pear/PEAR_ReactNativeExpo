export default {
  loginError: 'Invalid credentials',
  emptyParameters: 'Field(s) cannot be left empty',
  notUnselectedError: 'Field must have a selection',
  alphaOnlyError: 'Field cannot contain numbers or symbols',
  nricFormatError: 'Invalid NRIC format',
  nricError: 'Invalid NRIC',
  addressFormatError: 'Invalid Address format',
  homePhoneNoError: 'Home telephone no. must start with the digit 6, and must have 8 digits.',
  mobilePhoneNoError: 'Mobile no. must start with the digit 8 or 9, and must have 8 digits.',
  postalCodeError: 'Postal code must have 6 digits',
  emailError: 'Invalid Email',
  duplicatePrefNameError: 'Preferred name is already in use. Please enter a different value.',
  temperatureError: 'Temprature should be within range of 35.0 to 43.0.',
  systolicBPError: 'Systolic BP should be between 70 to 160 and an integer.',
  diastolicBPError: 'Diastolic BP should be between 40 to 120 and an integer.',
  spO2Error: 'SpO2 should be between 60 to 120 and an integer.',
  bloodSugarLevelError: 'Blood Sugar Level should be within 50 to 250.',
  heartRateError: 'Heart Rate should be within 0 to 300.',
  weightError: 'Weight should be within 0 to 200',
  heightError: 'Height should be within 0 to 200',
  passwordFormatError: 'Password must be 8-16 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
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