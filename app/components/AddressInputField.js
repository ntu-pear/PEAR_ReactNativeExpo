import React, { useState, useEffect } from 'react';
import BaseInputField from 'app/components/BaseInputField';

function AddressInputField({
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
    let message = '';
    if (isRequired && value <= 0) {
      message = 'Address is a required field.';
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

AddressInputField.defaultProps = {
  isRequired: false,
  keyboardType: 'default',
};

export default AddressInputField;
