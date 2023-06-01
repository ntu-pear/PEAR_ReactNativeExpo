import React, { useState, useEffect } from 'react';
import BaseInputField from 'app/components/BaseInputField';

function TelephoneInputField({
  isRequired,
  title,
  value,
  onChangeText,
  InputRightElement,
  type,
  numberType,
  keyboardType,
  maxLength,
  onChildData,
}) {
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  const [isFirstRender, setIsFirstRender] = useState(true);

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

  // useEffect(() => {
  //   onChildData ? onChildData(isFirstRender || isError.error) : null;
  //   setIsFirstRender(false);
  //   setIsError({
  //     ...isError,
  //     error: isRequired && value.length === 0,
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if (!isFirstRender) {
  //     onChildData ? onChildData(isError.error) : null;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isError, onChildData]);

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

TelephoneInputField.defaultProps = {
  isRequired: false,
};

export default TelephoneInputField;
