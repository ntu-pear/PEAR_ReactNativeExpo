// Libs
import React, { useState } from 'react';

// Components
import BaseInputField from 'app/components/BaseInputField';

function TelephoneInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  numberType,
  onChildData,
}) {
  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  // Validation function for user input:
  // Error if:
  // 1) Required but empty
  // 2) if mobile, 1st number != 8 or 9
  // 3) if home, 1st number != 6
  // 3) More than 8 total characters
  const validation = () => {
    let message = '';
    if (isRequired && value.length <= 0) {
      message = 'This field is required';
    } else if (value.length > 0) {
      if (numberType === 'home' && !/^$|^6[0-9]{7}$/.test(value)) {
        message =
          'Home Telephone No. must start with the digit 6, and must have 8 digits.';
      } else if (numberType === 'mobile' && !/^$|^[89][0-9]{7}$/.test(value)) {
        message =
          'Mobile No. must start with the digit 8 or 9, and must have 8 digits.';
      } else {
        message = '';
      }
    } else {
      message = '';
    }
    setIsError({
      ...isError,
      error: message ? true : false,
      errorMsg: message,
    });
  };

  return (
    <BaseInputField
      isRequired={isRequired}
      title={title}
      value={value}
      onChangeText={onChangeText}
      InputRightElement={InputRightElement}
      type={type}
      keyboardType={'numeric'}
      maxLength={8}
      validation={validation}
      isError={isError}
      onChildData={onChildData}
      setErrorState={setIsError}
    />
  );
}

TelephoneInputField.defaultProps = {
  isRequired: false,
  numberType: 'mobile',
};

export default TelephoneInputField;
