// Libs
import React, { useState } from 'react';

// Components
import BaseInputField from 'app/components/BaseInputField';

function NRICInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  keyboardType,
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
  // 2) 1st character contains characters other than "S", "T", "F", "G" or "M"
  // 3) More than 9 total characters
  const validation = () => {
    let message;
    if (isRequired && value <= 0) {
      message = 'NRIC cannot be empty.';
    } else if (value.length > 0 && !/^[STFGMstfgm]\d{7}[A-Za-z]$/.test(value)) {
      message = 'Invalid NRIC.';
    } else {
      message = '';
    }
    setIsError({
      ...isError,
      error: message === '' ? false : true,
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
      maxLength={9}
      validation={validation}
      isError={isError}
      onChildData={onChildData}
      setErrorState={setIsError}
    />
  );
}

NRICInputField.defaultProps = {
  isRequired: false,
};

export default NRICInputField;
