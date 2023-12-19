// Libs
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, Divider, VStack } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import EmailInputField from 'app/components/EmailInputField';
import LoadingWheel from 'app/components/LoadingWheel';
import CommonInputField from 'app/components/CommonInputField';
import DateInputField from 'app/components/DateInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import { parseSelectOptions } from 'app/utility/miscFunctions';
import InputField from './input-fields/InputField';
import SensitiveInputField from './input-fields/SensitiveInputField';

function AddPatientGuardian({ i, title, formData, handleFormData, onError }) {
  const page = 'guardianInfo';
  const guardian = formData[page][i]; 

  // variables relatied to retrieving relationship select options from API
  const { data, isError, isLoading } = useGetSelectionOptions('Relationship');

  // set initial value for relationship select field
  const [listOfRelationships, setListOfRelationships] = useState(parseSelectOptions([
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
    'Grandparent'
  ]));

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
  const [isAddrError, setIsAddrError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

  // used for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  // Functions for error state reporting for the child components  

  const handleFirstNameError = (e) => {
    setIsFirstNameError(e);
    // console.log("first name", e)
  }
  
  const handleLastNameError = (e) => {
    setIsLastNameError(e);
    // console.log("last name", e)
  }
  
  const handlePrefNameError = (e) => {
    setIsPrefNameError(e);
    // console.log("pref name", e)
  }
  
  const handleNRICError = (e) => {
    setIsNRICError(e);
    // console.log("nric", e)
  }
      
  const handleGenderError = (e) => {
    setIsGenderError(e);
    // console.log("gender", e)
  }
  
  const handleDOBError = (e) => {
    setIsDOBError(e);
    // console.log("dob", e)
  }

  const handleRelationError = (e) => {
    setIsRelationError(e);
    // console.log("relation", e)
  }
  
  const handleAddrError = (e) => {
    setIsAddrError(e);
    // console.log("addr", e)
  }
  
  const handleTempAddrError = (e) => {
    setIsTempAddrError(e);
    // console.log("temp addr", e)
  }

  const handleMobileNoError = (e) => {
    setIsMobileNoError(e);
    // console.log("mobile", e)
  }

  const handleEmailError = (e) => {
    setIsEmailError(e);
    // console.log("email", e)
  }

  const handleLoginError = (e) => {
    setIsLoginError(e);
    // console.log("email", e)
  }

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
      isTempAddrError ||
      isMobileNoError ||
      isEmailError ||
      isLoginError
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
    isTempAddrError,
    isMobileNoError,
    isEmailError,
    isLoginError,
    isInputErrors,
  ]);
  
  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if guardian.Email is empty or not.
  // console.log(i);
  useEffect(() => {
    setIsLoginError(() => {
      if (guardian.IsChecked && guardian.Email === '') {
        return true;
      } else {
        return false;
      }
    });
  }, [guardian.IsChecked, guardian.Email]);

  /* If retrieval from the hook is successful, replace the content in
     listOfLanguages with the retrieved one. */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setListOfRelationships(data.sort((a,b) => a.value - b.value)); // sort by value
    }
  }, [data, isError, isLoading]);

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

          <InputField
            isRequired
            title={'Preferred Name'}
            value={guardian.PreferredName}
            onChangeText={handleFormData('PreferredName', i)}
            onEndEditing={handlePrefNameError}                    
            dataType="name"
          />

          <SensitiveInputField
            isRequired
            title={'NRIC'}
            autoCapitalize='characters'
            value={guardian.NRIC}
            onChangeText={handleFormData('NRIC', i)}
            onEndEditing={handleNRICError}
            dataType="nric"
          />

          <RadioButtonInput
            isRequired
            title={'Gender'}
            value={guardian.Gender}
            onChangeData={handleFormData('Gender', i)}
            onChildData={handleGenderError}
            dataArray={listOfGenders}
          />

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              isRequired
              selectionMode={'DOB'}
              title={'Date of Birth'}
              value={guardian.DOB}
              handleFormData={handleFormData('DOB', i)}
              onChildData={handleDOBError}
            />
          </View>

          <SelectionInputField
            isRequired
            title={'Relationship'}
            placeholder={'Select Relationship'}
            onDataChange={handleFormData('RelationshipID', i)}
            value={guardian.RelationshipID}
            dataArray={listOfRelationships}
            onChildData={handleRelationError}
          />

          <InputField
            isRequired
            title={'Mobile No.'}
            value={guardian.ContactNo}
            onChangeText={handleFormData('ContactNo', i)}
            onEndEditing={handleMobileNoError}
            dataType={'mobile phone'}
            keyboardType='numeric'                    
          />

          <InputField
            isRequired
            title={'Address'}
            value={guardian.Address}
            onChangeText={handleFormData('Address', i)}
            onEndEditing={handleAddrError}
          />

          <InputField
            title={'Temporary Address'}
            value={guardian.Address}
            onChangeText={handleFormData('TempAddress', i)}
            onEndEditing={handleTempAddrError}
          />

          <SingleOptionCheckBox
            title={'Check this box to specify Guardian wants to log in'}
            value={guardian.IsChecked}
            onChangeData={handleFormData('IsChecked', i)}
          />

          <InputField
            isRequired={guardian.IsChecked}
            title={'Email'}
            value={guardian.Email}
            onChangeText={handleFormData('Email', i)}
            onEndEditing={handleEmailError}
            dataType='email'
          />
        
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
    width: '70%',
  },
});
export default AddPatientGuardian;
