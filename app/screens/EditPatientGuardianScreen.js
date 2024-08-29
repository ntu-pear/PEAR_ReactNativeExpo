// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// Configurations
import routes from 'app/navigation/routes';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// API
import guardianApi from 'app/api/guardian';

// Components
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import DateInputField from 'app/components/input-components/DateInputField';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import InputField from 'app/components/input-components/InputField';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';

function EditPatientGuardianScreen(props) {
  const { guardianProfile } = props.route.params;
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later

  // retrive list data from database using useGetSelectionOptions
  const {
    data: relationshipData,
    isError: relationshipError,
    isLoading: relationshipLoading,
  } = useGetSelectionOptions('relationship');

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
  
  // Guardian data to be submitted 
  const [formData, setFormData] = useState({
    GuardianID: guardianProfile.guardianID,
    FirstName: guardianProfile.firstName,
    LastName: guardianProfile.lastName,
    ContactNo: guardianProfile.contactNo,
    PreferredName: guardianProfile.preferredName,
    Gender: guardianProfile.gender,
    DOB: guardianProfile.dob ? new Date(guardianProfile.dob) : minimumJoiningDate,
    Address: guardianProfile.address ? guardianProfile.address : '',
    Nric: guardianProfile.nric ? guardianProfile.nric : '',
    PostalCode: guardianProfile.postalCode ? guardianProfile.postalCode : '',
    TempAddress: guardianProfile.tempAddress ? guardianProfile.tempAddress : '',
    TempPostalCode: guardianProfile.tempPostalCode ? guardianProfile.tempPostalCode : '',
    Email: guardianProfile.email ? guardianProfile.email : '',
    RelationshipID: guardianProfile.relationshipID,
    isActive: guardianProfile.isActive,
  });

  console.log(formData);

  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if guardian.Email is empty or not.
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
      isLoginError,
    );
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
  
  // Try to get relationships list from backend. If retrieval from the hook is successful,
  // replace the content in listOfRelationships with the retrieved one
  useEffect(() => {
    if (!relationshipLoading && !relationshipError && relationshipData) {
      setListOfRelationships(relationshipData); // sort by value
      setIsLoading(false);
    }
  }, [relationshipData, relationshipError, relationshipLoading]);

  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if formData['Email'] is empty or not.
  // console.log(i);
  //useEffect(() => {
  //  setIsGuardianLoginError(() => {
  //    if ((formData['isActive'] !== undefined && formData['isActive']) &&
  //    (formData['Email'] !== undefined && formData['Email'] === '')) {
  //      return true;
  //    } else {
  //      return false;
  //    }
  //  });
  //}, [formData['isActive'], formData['Email']]);
  
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

  // handling form input data by taking onchange value and updating our previous form data state
    const handleFormData = (field) => (e) => {
      if (field === 'RelationshipID') {
        setFormData(prevState=>({
          ...prevState,
          [field]: parseInt(e)
        }))
      } else {
        setFormData(prevState=>({
          ...prevState,
          [field]: e
        }))
      }
    };

  // form submission when save button is pressed
  const submitForm = async () => {
    console.log(formData);
    const result = await guardianApi.updateGuardian(formData);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      navigation.goBack(routes.PATIENT_PROFILE, {
        navigation: navigation,
        ...guardianProfile,
      });
      alertTitle = 'Saved Successfully';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Editing Guardian Info';
      console.log('result error ' + JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
  };

  return relationshipLoading || isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <View style={styles.formContainer}>
                <InputField
                  isRequired
                  title={'First Name'}
                  value={formData.FirstName}
                  onChangeText={handleFormData('FirstName')}
                  onEndEditing={handleFirstNameError}
                  dataType="name"
                />

                <InputField
                  isRequired
                  title={'Last Name'}
                  value={formData.LastName}
                  onChangeText={handleFormData('LastName')}
                  onEndEditing={handleLastNameError}
                  dataType="name"
                />

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    isRequired
                    selectionMode={'DOB'}
                    hideDayOfWeek={true}
                    title={'Date of Birth'}
                    value={formData.DOB}
                    handleFormData={handleFormData('DOB')}
                    onChildData={handleDOBError}
                  />
                </View>  

                <RadioButtonInput
                  isRequired
                  title={'Gender'}
                  value={formData['Gender']}
                  onChangeData={handleFormData('Gender')}
                  onChildData={handleGenderError}
                  dataArray={listOfGenders}
                />

                <InputField
                  isRequired
                  title={'Address'}
                  value={formData.Address}
                  dataType="address"
                  onChangeText={handleFormData('Address')}
                  onEndEditing={handleAddrError}
                />

                <InputField
                  isRequired
                  title={'Postal Code'}
                  value={formData.PostalCode}
                  onChangeText={handleFormData('PostalCode')}
                  onEndEditing={handlePostalCodeError}
                  dataType='postal code'
                  keyboardType='numeric'
                  maxLength={6}
                />

                <InputField
                  title={'Temporary Address'}
                  value={formData.TempAddress}
                  dataType="address"
                  onChangeText={handleFormData('TempAddress')}
                  onEndEditing={handleTempAddrError}
                />

                <InputField
                  isRequired={formData.TempAddress.length > 0}
                  title={'Temporary Postal Code'}
                  value={formData.TempPostalCode}
                  onChangeText={handleFormData('TempPostalCode')}
                  onEndEditing={handleTempPostalCodeError}
                  dataType='postal code'
                  keyboardType='numeric'
                  maxLength={6}
                />

                <InputField
                  isRequired
                  title={'Mobile No.'}
                  value={formData.ContactNo}
                  onChangeText={handleFormData('ContactNo')}
                  onEndEditing={handleMobileNoError}
                  dataType={'mobile phone'}
                  keyboardType='numeric' 
                  maxLength={8}                   
                />

                <InputField
                  isRequired
                  title={'Preferred Name'}
                  value={formData.PreferredName}
                  onChangeText={handleFormData('PreferredName')}
                  onEndEditing={handlePrefNameError}                    
                  dataType="name"
                />

                <SelectionInputField
                  isRequired
                  title={"Guardian is Patient's"}
                  placeholder={guardianProfile.relationship}
                  onDataChange={handleFormData('RelationshipID')}
                  value={guardianProfile.relationship}
                  dataArray={listOfRelationships}
                  onChildData={handleRelationError}
                />

                {
                  //<SingleOptionCheckBox
                  //  title={'Check this box to specify Guardian wants to log in'}
                  //  value={(formData['isActive'] !== undefined && formData['isActive'])}
                  //  onChangeData={handleFormData('isActive')}
                  ///>
                }

                <InputField
                  title={'Email'}
                  value={formData.Email}
                  onChangeText={handleFormData('Email')}
                  onEndEditing={handleEmailError}
                  dataType="email"
                />
              </View>
              <View style={styles.saveButtonContainer}>
                <Box width="70%">
                  <AppButton
                    title="Save"
                    color="green"
                    onPress={submitForm}
                    isDisabled={isInputErrors}
                  />
                </Box>
              </View>
            </VStack>
          </Box>
        </Box>
      )}
    />
  );
}

EditPatientGuardianScreen.defaultProps = {
  isRequired: true,
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
    marginBottom: 20,
  },
  dateSelectionContainer: {
    width: '100%',
  },
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default EditPatientGuardianScreen;
