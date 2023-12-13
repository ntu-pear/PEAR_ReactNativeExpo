// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Select } from 'native-base';
import PropTypes from 'prop-types';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Utils
import { notEmpty, notUnselected } from 'app/utility/inputValidation';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import RequiredIndicator from '../RequiredIndicator';

function SelectionInputField({
  isRequired = false,
  showTitle = true,
  title = '',
  placeholder: placeholder,
  onDataChange = () => {},
  value = '',
  dataArray = [],
  onChildData = () => {},
  inputLeftElement = null,
  inputRightElement = null,
}) {
  /*
  This state and subsequent useEffect are used to track if the component is in its first render. This is mainly used to
  ensure that the submission blocking in the parent component is active (as it is first rendered, user will not
  likely have filled anything). This also ensures that since there will be no input, the component error message
  does not show until the user focuses and violates the validation with their input.
  */   
  const [isFirstRender, setIsFirstRender] = useState(true);

  /* 
  This state is used to track the error state of this component via validation
  */
  const [errorMsg, setErrorMsg] = useState(null);

  /*
  This state is used to track the value of the selected item
  */
  const [selectedValue, setSelectedValue] = useState(
    value ? value : dataArray[0].value,
  );


  useEffect(() => {
    onChildData ? onChildData(isFirstRender || errorMsg.error) : null;
    setIsFirstRender(false);
    if(isRequired) {
      setErrorMsg(notUnselected(selectedValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   /* 
  This is used to update the parent component that there is a validation error
  Validation is passed via the onChildData prop.
  */
  useEffect(() => {
    if (!isFirstRender) {
      onChildData ? onChildData(errorMsg) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMsg, onChildData]);

  /*
  This is used to update the selected item
  */
  const handleValueChanged = (selected) => {
    setSelectedValue(selected);
    onDataChange(selected);
  };  

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        {showTitle ? (
          <Text style={styles.TitleMsg}>
            {title}:{isRequired ? <RequiredIndicator/> : ''}
          </Text>
        ) : (
          <></>
        )}
        <Select
          accessibilityLabel={title}
          borderRadius="25"
          fontFamily={
            Platform.OS === 'ios' ? typography.ios : typography.android
          }
          height="55"
          minWidth="full"
          minHeight="3%"
          placeholder={placeholder}
          placeholderTextColor={colors.medium}
          fontSize="16"
          selectedValue={selectedValue}
          onValueChange={handleValueChanged}
          InputLeftElement={inputLeftElement}
          inputRightElement={inputRightElement}
        >
          {dataArray.map((item) => (
            <Select.Item key={item} label={item.label} value={item.value} />
          ))}
        </Select>
        <ErrorMessage message={errorMsg}/>        
      </VStack>
    </View>
  );
}

SelectionInputField.defaultProps = {
  isRequired: false,
};

const styles = StyleSheet.create({
  ComponentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  TitleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  RequiredIndicator: {
    color: colors.red,
    fontSize: 18,
  },
});

export default SelectionInputField;
