// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Configurations
import routes from 'app/navigation/routes';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

//API
import guardianApi from 'app/api/guardian';

// Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import EmailInputField from 'app/components/EmailInputField';
import CommonInputField from 'app/components/CommonInputField';
import DateInputField from 'app/components/DateInputField';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';

function EditPatientGuardianScreen(props) {
  const { navigation, guardianProfile } = props.route.params;
  const [isLoading, setIsLoading] = useState(true);

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

  // set initial value for SelectionInputField dataArray prop -> follow format of "label" and "value"
  const [listOfRelationships, setListOfRelationships] = useState([
    { value: 1, label: 'Husband' },
    { value: 2, label: 'Wife' },
    { value: 3, label: 'Child' },
    { value: 4, label: 'Parent' },
    { value: 5, label: 'Sibling' },
    { value: 6, label: 'Grandchild' },
    { value: 7, label: 'Friend' },
    { value: 8, label: 'Nephew' },
    { value: 9, label: 'Niece' },
    { value: 10, label: 'Aunt' },
    { value: 11, label: 'Uncle' },
    { value: 12, label: 'Grandparent' },
  ]);

  const [isInputErrors, setIsInputErrors] = useState(false);

  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isRelationError, setIsRelationError] = useState(false);
  const [isPhoneError, setIsPhoneError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isGuardianLoginError, setIsGuardianLoginError] = useState(false);

  const handleFirstNameState = useCallback(
    (state) => {
      setIsFirstNameError(state);
      // console.log('FirstName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFirstNameError],
  );
  const handleLastNameState = useCallback(
    (state) => {
      setIsLastNameError(state);
      // console.log('LastName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLastNameError],
  );
  const handleNRICState = useCallback(
    (state) => {
      setIsNRICError(state);
      // console.log('NRIC: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNRICError],
  );
  const handleEmailState = useCallback(
    (state) => {
      setIsEmailError(state);
      // console.log('Email: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEmailError],
  );
  const handleRelationState = useCallback(
    (state) => {
      setIsRelationError(state);
      // console.log('Relation: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRelationError],
  );
  const handlePhoneState = useCallback(
    (state) => {
      setIsPhoneError(state);
      // console.log('Phone: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPhoneError],
  );
  const handleDOBState = useCallback(
    (state) => {
      setIsDOBError(state);
      // console.log('DOB: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDOBError],
  );
  const handleAddrState = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log('Addr: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAddrError],
  );
  const handleTempAddrState = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log('TempAddr: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTempAddrError],
  );

  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
      isLastNameError ||
      isNRICError ||
      isEmailError ||
      isPhoneError ||
      isRelationError ||
      isDOBError ||
      isAddrError ||
      isTempAddrError ||
      isGuardianLoginError,
    );
    // console.log(isInputErrors);
  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isEmailError,
    isPhoneError,
    isRelationError,
    isDOBError,
    isAddrError,
    isTempAddrError,
    isInputErrors,
    isGuardianLoginError,
  ]);

  const [formData, setFormData] = useState({
    GuardianID: guardianProfile.guardianID,
    FirstName: guardianProfile.firstName,
    LastName: guardianProfile.lastName,
    NRIC: guardianProfile.nric,
    Email: guardianProfile.email ? guardianProfile.email : "",
    RelationshipID: guardianProfile.relationshipID,
    isActive: guardianProfile.isActive,
    ContactNo: guardianProfile.contactNo,
    DOB: guardianProfile.dob ? guardianProfile.dob : minimumJoiningDate,
    Address: guardianProfile.address ? guardianProfile.address : "",
    TempAddress: guardianProfile.tempAddress ? guardianProfile.tempAddress : "",
  });

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


  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
  (input = null) =>
  (e) => {
    if (input === 'ContactNo') {
      e.toString(); // convert to string
      setFormData((prevData) => ({
        ...prevData,
        [input]: e,
      }));
    } else if (input === 'Relationship') {
      setFormData((prevData) => ({
        ...prevData,
        RelationshipID: e,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [input]: e,
      }));
    }
  };

  // form submission when save button is pressed
  const submitForm = async () => {
    const result = await guardianApi.updateGuardian(formData);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      navigation.goBack(routes.PATIENT_INFORMATION, {
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
      console.log("result error "+JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
  };

  /* If retrieval from the hook is successful, replace the content in
     listOfLanguages with the retrieved one. */
  useEffect(() => {
    if (!relationshipLoading && !relationshipError && relationshipData) {
      setListOfRelationships(relationshipData);
      setIsLoading(false);
    }
  }, [relationshipData, relationshipError, relationshipLoading]);

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
                <NameInputField
                  isRequired
                  title={'Guardian First Name'}
                  value={formData['FirstName']}
                  onChangeText={handleFormData('FirstName')}
                  onChildData={handleFirstNameState}
                />

                <NameInputField
                  isRequired
                  title={'Guardian Last Name'}
                  value={formData['LastName']}
                  onChangeText={handleFormData('LastName')}
                  onChildData={handleLastNameState}
                />

                <NRICInputField
                  isRequired
                  title={'Guardian NRIC'}
                  value={formData['NRIC']}
                  onChangeText={handleFormData('NRIC')}
                  onChildData={handleNRICState}
                  maxLength={9}
                />

                <SelectionInputField
                  isRequired
                  title={'Relationship'}
                  placeholderText={guardianProfile.relationship}
                  onDataChange={handleFormData('Relationship')}
                  value={guardianProfile.relationship}
                  dataArray={listOfRelationships}
                  onChildData={handleRelationState}
                />

                <TelephoneInputField
                  isRequired
                  title={"Guardian's Handphone No."}
                  value={formData['ContactNo']}
                  onChangeText={handleFormData('ContactNo')}
                  onChildData={handlePhoneState}
                  maxLength={8}
                />

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    isRequired
                    selectionMode={'DOB'}
                    title={'Date of Birth'}
                    value={new Date(formData['DOB'])}
                    handleFormData={handleFormData('DOB')}
                    onChildData={handleDOBState}
                  />
                </View>

                <CommonInputField
                  isRequired
                  title={'Address'}
                  value={formData['Address']}
                  onChangeText={handleFormData('Address')}
                  onChildData={handleAddrState}
                />

                <CommonInputField
                  title={'Temporary Address (optional)'}
                  value={formData['TempAddress']}
                  onChangeText={handleFormData('TempAddress')}
                  onChildData={handleTempAddrState}
                />

                {
                  //<SingleOptionCheckBox
                  //  title={'Check this box to specify Guardian wants to log in'}
                  //  value={(formData['isActive'] !== undefined && formData['isActive'])}
                  //  onChangeData={handleFormData('isActive')}
                  ///>
                }
                

                <EmailInputField
                  title={'Guardian Email'}
                  value={formData['Email']}
                  onChangeText={handleFormData('Email')}
                  onChildData={handleEmailState}
                />
              </View>
              <View style={styles.saveButtonContainer}>
                <Box width='70%'>
                  <AppButton title="Save" color="green" onPress={submitForm} isDisabled={isInputErrors} />
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
    width: '70%',
  },
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default EditPatientGuardianScreen;
