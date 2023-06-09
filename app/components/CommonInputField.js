// Libs
import React, { useState } from 'react';

// Components
import BaseInputField from 'app/components/BaseInputField';

function CommonInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  keyboardType,
  maxLength,
  onChildData,
  variant,
}) {
  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  // Validation function for user input:
  // Error if:
  // 1) required but empty
  const validation = () => {
    let message = '';
    if (isRequired && value <= 0) {
      message = 'This is a required field.';
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
      variant={variant}
    />
  );
}

// This settings will be used if the props are not specified in the parent component.
CommonInputField.defaultProps = {
  isRequired: false,
  keyboardType: 'default',
};

export default CommonInputField;
