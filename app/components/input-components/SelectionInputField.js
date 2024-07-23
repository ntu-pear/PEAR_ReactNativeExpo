// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, Select } from 'native-base';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import RequiredIndicator from '../RequiredIndicator';

function SelectionInputField({
  isRequired = false,
  hideError = true,
  showTitle = true,
  title = '',
  placeholder = '',
  onDataChange = () => {},
  value = '',
  dataArray = [],
  onEndEditing = () => {},
  inputLeftElement = null,
  inputRightElement = null,
  isDisabledItems = {},
  otherProps={},
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
  const [error, setError] = useState({isError: false, errorMsg: ''});

  /*
  This state is used to track the value of the selected item
  */
  const [selectedValue, setSelectedValue] = useState(
    //value ? value : Object.keys(isDisabledItems).length > 0 ? null : dataArray[0].value,
    // uncomment ^ if want value to show in selectioninputfield
    null
  );


  useEffect(() => {
    onEndEditing ? onEndEditing(isFirstRender || error.isError) : null;
    setIsFirstRender(false);
    setError({
      ...error,
      isError: isRequired && value === 0,
    });
  }, []);

  useEffect(() => {
    if(isDisabledItems.length > 0) {
      if(isDisabledItems[value] == true) {
        setSelectedValue(Object.keys(isDisabledItems).find((key) => isDisabledItems[key] === true) || null)
      }
    }

  }, [isDisabledItems])

   /* 
  This is used to update the parent component that there is a validation error
  Validation is passed via the onEndEditing prop.
  */
  useEffect(() => {
    if (!isFirstRender) {
      onEndEditing ? onEndEditing(error.isError) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, onEndEditing]);

  /*
  This is used to update the selected item
  */
  const handleValueChanged = (selected) => {
    setSelectedValue(selected);
    onDataChange(selected);
  };  

  return (
    <View style={styles.componentContainer}>
      <VStack>
        {showTitle ? (
          <Text style={styles.titleMsg}>
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
          height="50"
          minWidth="full"
          minHeight="3%"
          placeholder={placeholder}
          placeholderTextColor={colors.medium}
          fontSize="16"
          selectedValue={selectedValue}
          onValueChange={handleValueChanged}
          InputLeftElement={inputLeftElement}
          inputRightElement={inputRightElement}
          {...otherProps}
        >
          {dataArray.map((item) => (
            <Select.Item key={item} label={item.label} value={item.value} isDisabled={isDisabledItems ? isDisabledItems[item.value] : false}/>
          ))}
        </Select>
        {hideError && !error.errorMsg ? 
        null : (
        <ErrorMessage message={error.errorMsg}/>
        )}   
        </VStack>
    </View>
  );
}

SelectionInputField.defaultProps = {
  isRequired: false,
};

const styles = StyleSheet.create({
  componentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  titleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default SelectionInputField;
