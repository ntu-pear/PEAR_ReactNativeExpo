// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Divider, VStack } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import SingleOptionCheckBox from 'app/components/input-components/SingleOptionCheckBox';
import LoadingWheel from 'app/components/LoadingWheel';
import DateInputField from 'app/components/input-components/DateInputField';
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import InputField from './input-components/InputField';
import SensitiveInputField from './input-components/SensitiveInputField';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';
import SelectionInputField from './input-components/SelectionInputField';

function AddPatientGuardian({ i, title, formData, handleFormData, onError }) {
  const page = 'guardianInfo';
  const guardian = formData[page][i];

  // Variables relatied to retrieving relationship select options from hook
  const { data, isError, isLoading } = useGetSelectionOptions('Relationship');

  // Set initial value for relationship select field
  const [listOfRelationships, setListOfRelationships] = useState(
    parseSelectOptions([
      'Husband',
      'Wife',
      'Child',
      'Parent',
      'Sibling',
      'Grandchild',
      'Friend',
      'Nephew',
      'Niece',
      'Aunt',
      'Uncle',
      'Grandparent',
    ]),
  );
  
  // Used for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const [listOfGenders, setListOfGenders] = useState([
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ]);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isGenderError, setIsGenderError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isRelationError, setIsRelationError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isTempPostalCodeError, setIsTempPostalCodeError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isPostalCodeError, setIsPostalCodeError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
      isLastNameError ||
      isPrefNameError ||
      isNRICError ||
      isGenderError ||
      isDOBError ||
      isRelationError ||
      isAddrError ||
      isPostalCodeError ||
      isTempAddrError ||
      isTempPostalCodeError ||
      isMobileNoError ||
      isEmailError ||
      isLoginError,
    );
    onError(i, isInputErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFirstNameError,
    isLastNameError,
    isPrefNameError,
    isNRICError,
    isGenderError,
    isDOBError,
    isRelationError,
    isAddrError,
    isPostalCodeError,
    isTempAddrError,
    isTempPostalCodeError,
    isMobileNoError,
    isEmailError,
    isLoginError,
    isInputErrors,
  ]);

  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if guardian.Email is empty or not.
  useEffect(() => {
    setIsLoginError(guardian.IsChecked && !guardian.Email);
    setIsEmailError(guardian.IsChecked && !guardian.Email);
    if (!guardian.IsChecked) {
      handleFormData('Email', i)('');
    }
  }, [guardian.IsChecked, guardian.Email]);

  // Try to get relationships list from backend. If retrieval from the hook is successful,
  // replace the content in listOfRelationships with the retrieved one
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setListOfRelationships(data); // sort by value
    }
  }, [data, isError, isLoading]);

    // Functions for error state reporting for the child components
    const handleFirstNameError = useCallback(
      (state) => {
        setIsFirstNameError(state);
        // console.log('FirstName: ', state);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isFirstNameError],
    );
  
    const handleLastNameError = useCallback(
      (state) => {
        setIsLastNameError(state);
        // console.log("last name", state)
      },
      [isLastNameError]
    );
  
    const handlePrefNameError = useCallback(
      (state) => {
        setIsPrefNameError(state);
        // console.log("pref name", state)
      },
      [isPrefNameError]
    );
  
    const handleNRICError = useCallback(
      (state) => {
        setIsNRICError(state);
        // console.log("nric", state)
      },
      [isNRICError]
    );
  
    const handleGenderError = useCallback(
      (state) => {
        setIsGenderError(state);
        // console.log("gender", state)
      },
      [isGenderError]
    );
  
    const handleDOBError = useCallback(
      (state) => {
        setIsDOBError(state);
        // console.log("dob", state)
      },
      [isDOBError]
    );
  
    const handleRelationError = useCallback(
      (state) => {
        setIsRelationError(state);
        // console.log("relation", state)
      },
      [isRelationError]
    );
  
    const handleAddrError = useCallback(
      (state) => {
        setIsAddrError(state);
        // console.log("addr", state)
      },
      [isAddrError]
    );
  
    const handlePostalCodeError = useCallback(
      (state) => {
        setIsPostalCodeError(state);
        // console.log("addr", state)
      },
      [isPostalCodeError]
    );
  
    const handleTempAddrError = useCallback(
      (state) => {
        setIsTempAddrError(state);
        // console.log("temp addr", state)
      },
      [isTempAddrError]
    );
  
    const handleTempPostalCodeError = useCallback(
      (state) => {
        setIsTempPostalCodeError(state);
        // console.log("temp postal code", state)
      },
      [isTempPostalCodeError]
    );
  
    const handleMobileNoError = useCallback(
      (state) => {
        setIsMobileNoError(state);
        // console.log("mobile", state)
      },
      [isMobileNoError]
    );
  
    const handleEmailError = useCallback(
      (state) => {
        setIsEmailError(state);
        // console.log("email", state)
      },
      [isEmailError]
    );
  
    const handleLoginError = useCallback(
      (state) => {
        setIsLoginError(state);
        // console.log("email", state)
      },
      [isLoginError]
    );

  return isLoading ? (
    <LoadingWheel />
  ) : (
    <Box w="100%">
      <VStack>
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            {title == 1 ? null : <Divider w="80%" mt={10} />}
            <Text
              marginTop={6}
              bold
              fontSize="2xl"
              color={colors.green}
              style={styles.text}
            >
              Guardian Information {title}
            </Text>
          </View>

          <InputField
            isRequired
            title={'First Name'}
            value={guardian.FirstName}
            onChangeText={handleFormData('FirstName', i)}
            onEndEditing={handleFirstNameError}
            dataType="name"
          />

          <InputField
            isRequired
            title={'Last Name'}
            value={guardian.LastName}
            onChangeText={handleFormData('LastName', i)}
            onEndEditing={handleLastNameError}
            dataType="name"
          />

          <SensitiveInputField
            isRequired
            title={'NRIC'}
            autoCapitalize="characters"
            value={guardian.NRIC}
            onChangeText={handleFormData('NRIC', i)}
            onEndEditing={handleNRICError}
            dataType="nric"
            maxLength={9}
          />          

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              isRequired
              selectionMode={'DOB'}
              hideDayOfWeek={true}
              title={'Date of Birth'}
              value={guardian.DOB}
              handleFormData={handleFormData('DOB', i)}
              onChildData={handleDOBError}
            />
          </View>

          <RadioButtonInput
            isRequired
            title={'Gender'}
            value={guardian.Gender}
            onChangeData={handleFormData('Gender', i)}
            onChildData={handleGenderError}
            dataArray={listOfGenders}
          />

          <InputField
            isRequired
            title={'Address'}
            value={guardian.Address}
            dataType="address"
            onChangeText={handleFormData('Address', i)}
            onEndEditing={handleAddrError}
          />

          <InputField
            isRequired
            title={'Postal Code'}
            value={guardian.PostalCode}
            onChangeText={handleFormData('PostalCode', i)}
            onEndEditing={handlePostalCodeError}
            dataType='postal code'
            keyboardType='numeric'
            maxLength={6}
          />

          <InputField
            title={'Temporary Address'}
            value={guardian.TempAddress}
            dataType="address"
            onChangeText={handleFormData('TempAddress', i)}
            onEndEditing={handleTempAddrError}
          />

          <InputField
            isRequired={guardian.TempAddress.length > 0}
            title={'Temporary Postal Code'}
            value={guardian.TempPostalCode}
            onChangeText={handleFormData('TempPostalCode', i)}
            onEndEditing={handleTempPostalCodeError}
            dataType='postal code'
            keyboardType='numeric'
            maxLength={6}
          />
          
          <InputField
            isRequired
            title={'Mobile No.'}
            value={guardian.ContactNo}
            onChangeText={handleFormData('ContactNo', i)}
            onEndEditing={handleMobileNoError}
            dataType={'mobile phone'}
            keyboardType='numeric' 
            maxLength={8}                   
          />

          <InputField
            isRequired
            title={'Preferred Name'}
            value={guardian.PreferredName}
            onChangeText={handleFormData('PreferredName', i)}
            onEndEditing={handlePrefNameError}                    
            dataType="name"
          />

          <SelectionInputField
            isRequired
            title={"Guardian is Patient's"}
            value={guardian.RelationshipID}
            placeholder={'Select Relationship'}
            onDataChange={handleFormData('RelationshipID', i)}
            dataArray={listOfRelationships}
            onChildData={handleRelationError}
          />         

          <SingleOptionCheckBox
            title={'Check this box to specify Guardian wants to log in'}
            value={guardian.IsChecked}
            onChangeData={handleFormData('IsChecked', i)}
          />

          {guardian.IsChecked ? (
            <InputField
              isRequired={guardian.IsChecked}
              title={'Email'}
              value={guardian.Email}
              onChangeText={handleFormData('Email', i)}
              onEndEditing={handleEmailError}
              dataType="email"
            />
          ) : null}
        </View>
      </VStack>
    </Box>
  );
}
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
  dateSelectionContainer: {
    width: '100%',
  },
});
export default AddPatientGuardian;
