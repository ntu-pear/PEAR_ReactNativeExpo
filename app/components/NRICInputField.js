import React, { useState, useEffect } from 'react';
import BaseInputField from 'app/components/BaseInputField';

function NRICInputField({
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
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

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
      maxLength={maxLength}
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
