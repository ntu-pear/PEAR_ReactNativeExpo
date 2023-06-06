// Libs
import React, { useState } from 'react';

// Components
import BaseInputField from 'app/components/BaseInputField';

function EmailInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  keyboardType,
  maxLength,
  onChildData,
}) {
  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  // Validation function for user input:
  // Error if:
  // 1) required but empty
  // 2) there are number and/or symbols within the input
  const validation = () => {
    let message = '';
    // const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (isRequired && value.length <= 0) {
      message = 'This field is required';
    } else if (
      value.length > 0 &&
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)
    ) {
      message = 'Invalid Email';
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
      keyboardType={keyboardType}
      maxLength={maxLength}
      validation={validation}
      isError={isError}
      onChildData={onChildData}
      setErrorState={setIsError}
    />
  );
}

EmailInputField.defaultProps = {
  isRequired: false,
};

export default EmailInputField;
