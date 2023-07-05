// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import EmailInputField from 'app/components/EmailInputField';
import AppButton from 'app/components/AppButton';

function EditPatientGuardianScreen(props) {
  const { displayData } = props.route.params;
  const guardianDictionary = displayData.reduce((dict, item) => {
    dict[item.label] = item.value;
    return dict;
  }, {});

  // constant values for relationships
  const listOfRelationships = [
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
  ];

  const [isInputErrors, setIsInputErrors] = useState(false);

  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isRelationError, setIsRelationError] = useState(false);
  const [isPhoneError, setIsPhoneError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

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
    [isLastNameError],
  );
  const handleNRICState = useCallback(
    (state) => {
      setIsNRICError(state);
      // console.log('NRIC: ', state);
    },
    [isNRICError],
  );
  const handleRelationState = useCallback(
    (state) => {
      setIsRelationError(state);
      // console.log('Relation: ', state);
    },
    [isRelationError],
  );
  const handlePhoneState = useCallback(
    (state) => {
      setIsPhoneError(state);
      // console.log('Phone: ', state);
    },
    [isPhoneError],
  );
  const handleEmailState = useCallback(
    (state) => {
      setIsEmailError(state);
      // console.log('Email: ', state);
    },
    [isEmailError],
  );

  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
      isLastNameError ||
      isNRICError ||
      isPhoneError ||
      isRelationError ||
      isEmailError ||
      isLoginError,
    );
    // console.log(isInputErrors);
  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isPhoneError,
    isRelationError,
    isEmailError,
    isInputErrors,
    isLoginError,
  ]);
  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if formData['Email'] is empty or not.
  // console.log(i);
  //useEffect(() => {
  //  setIsLoginError(() => {
  //    if ((formData['IsActive'] !== undefined && formData['IsActive']) && 
  //    (formData['Email'] !== undefined && formData['Email']=== '')) {
  //      return true;
  //    } else {
  //      return false;
  //    }
  //  });
  //}, [formData['IsActive'], formData['Email']]);

  const [formData, setFormData] = useState({
    FirstName: guardianDictionary['First Name'],
    LastName: guardianDictionary['Last Name'],
    NRIC: guardianDictionary['NRIC'],
    Relationship: guardianDictionary['Relationship'],
    ContactNo: guardianDictionary['Contact Number'],
    IsActive: guardianDictionary['Is Active'],
    Email: guardianDictionary['Email'],
  });

  //const concatFormData = (key, values) => {
  //  setFormData((prevFormData) => ({
  //    ...prevFormData,
  //    [key]: prevFormData[key].concat(values),
  //  }));
  //};

  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (input = null) =>
    (e, date = null) => {

      const newData = formData;
      // additional check to convert HomeNo and HandphoneNo to string
      if (
        input === 'ContactNo' ||
        // BUGFIX: Address not saved properly when number specifed first -- Justin
        // soln: Address is included: fixes a bug where if number is specified first address will not be captured properly
        // i.e: '123 abc lane' -- saved as --> '123'
        input === 'Address' ||
        input === 'TempAddress'
      ) {
        newData[input] = e.toString(); // convert to string
      } else {
        newData[input] = date
          ? date
          : e.$d //e['$d']-check if input from MUI date-picker
          ? e.$d
          : parseInt(e) // check if integer (for dropdown)
          ? parseInt(e) // change to integer
          : e; // eg. guardianInfo[0].FirstName = e
      }

      setFormData((previousState) => ({
        ...previousState,
        newData,
      }));
    };
  const submitForm = async () => {
    console.log("sumbit");
  }

//  const submitForm = async () => {
//    // -- Validation is now real-time no need to have on submit validation - Justin
//    const result = await patientApi.addPatient(formData);
//
//    // let alertTxt = '';
//    let alertTitle = '';
//    let alertDetails = '';
//
//    // console.log('response: ', result);
//
//    if (result.ok) {
//      const allocations = result.data.data.patientAllocationDTO;
//      const caregiver = allocations.caregiverName;
//      const doctor = allocations.doctorName;
//      const gameTherapist = allocations.gameTherapistName;
//
//      alertTitle = 'Successfully added Patient';
//      alertDetails = `Patient has been allocated to\nCaregiver: ${caregiver}\nDoctor: ${doctor}\nGame Therapist: ${gameTherapist}`;
//      // alertTxt = alertTitle + alertDetails;
//      // Platform.OS === 'web'
//      //   ? navigate('/' + routes.PATIENTS)
//      //   : navigation.navigate(routes.PATIENTS_SCREEN);
//      navigation.navigate(routes.PATIENTS_SCREEN);
//    } else {
//      const errors = result.data?.message;
//
//      result.data
//        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
//        : (alertDetails = 'Please try again.');
//
//      alertTitle = 'Error in Adding Patient';
//      // alertTxt = alertTitle + alertDetails;
//    }
//    // Platform.OS === 'web'
//    //   ? alert(alertTxt)
//    //   : Alert.alert(alertTitle, alertDetails);
//    // }
//    Alert.alert(alertTitle, alertDetails);
//  };

  return (
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
                  placeholderText={guardianDictionary['Relationship']}
                  onDataChange={handleFormData('RelationshipID')}
                  value={formData['Relationship']}
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

                <SingleOptionCheckBox
                  title={'Check this box to specify Guardian wants to log in'}
                  value={(formData['IsActive'] !== undefined && formData['IsActive'])}
                  onChangeData={handleFormData('IsActive')}
                />

                <EmailInputField
                  isRequired={(formData['IsActive'] !== undefined && formData['IsActive'])}
                  title={'Guardian Email'}
                  value={formData['Email']}
                  onChangeText={handleFormData('Email')}
                  onChildData={handleEmailState}
                />
              </View>
              <View style={styles.saveButtonContainer}>
                <Box width='70%'>
                  <AppButton title="Save" color="green" onPress={submitForm} />
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
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default EditPatientGuardianScreen;
