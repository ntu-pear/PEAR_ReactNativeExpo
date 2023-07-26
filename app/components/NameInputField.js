// Libs
import React, { useState } from 'react';

// Components
import BaseInputField from 'app/components/BaseInputField';

function NameInputField({
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
    if (isRequired && value <= 0) {
      message = 'Name cannot be empty';
    } else if (/[!@#$%^&*(),.?":{}|<>]/g.test(value) || /\d+/g.test(value)) {
      message = 'Name cannot contain numbers or symbols';
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

NameInputField.defaultProps = {
  isRequired: false,
};

export default NameInputField;