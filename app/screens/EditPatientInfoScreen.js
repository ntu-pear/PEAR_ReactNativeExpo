// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base';

//Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import DateInputField from 'app/components/DateInputField';
import CommonInputField from 'app/components/CommonInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import AppButton from 'app/components/AppButton';

function EditPatientInfoScreen(props) {
  const { displayData } = props.route.params;
  const patientDictionary = displayData.reduce((dict, item) => {
    dict[item.label] = item.value;
    return dict;
  }, {});
  const displayDOB = new Date(patientDictionary['DOB']);
  
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];


  // error state for component
  const [isInputErrors, setIsInputErrors] = useState(false);

  // error states for child components
  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isGenderError, setIsGenderError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isHomeNumberError, setIsHomeNumberError] = useState(false);
  const [isMobileNumberError, setIsMobileNumberError] = useState(false);

  // Error state handling for child components
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
  const handleGenderState = useCallback(
    (state) => {
      setIsGenderError(state);
      // console.log('Gender: ', state);
    },
    [isGenderError],
  );
  const handleDOBState = useCallback(
    (state) => {
      setIsDOBError(state);
      // console.log('DOB: ', state);
    },
    [isDOBError],
  );
  const handleAddrState = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log('Addr: ', state);
    },
    [isAddrError],
  );
  const handleTempAddrState = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log('Addr: ', state);
    },
    [isTempAddrError],
  );
  const handleHomeNumberState = useCallback(
    (state) => {
      setIsHomeNumberError(state);
      // console.log('Home Number: ', state);
    },
    [isHomeNumberError],
  );
  const handleMobileNumberState = useCallback(
    (state) => {
      setIsMobileNumberError(state);
      // console.log('Mobile Number: ', state);
    },
    [isMobileNumberError],
  );

  // Error state handling for this component
  useEffect(() => {
    setIsInputErrors(
      isFirstNameError || 
      isLastNameError || 
      isNRICError || 
      isGenderError ||
      isDOBError || 
      isAddrError ||
      isTempAddrError ||
      isHomeNumberError ||
      isMobileNumberError,
    );
    // console.log(isInputErrors);

  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isGenderError,
    isDOBError,
    isAddrError,
    isTempAddrError,
    isHomeNumberError,
    isMobileNumberError,
    isInputErrors,
  ]);

  const [formData, setFormData] = useState({
    FirstName: patientDictionary['First Name'],
    LastName: patientDictionary['Last Name'],
    NRIC: patientDictionary['NRIC'],
    Gender: listOfGenders.find((item) => item.label === patientDictionary['Gender']).value,  // convert label to value
    DOB: displayDOB,
    Address: patientDictionary['Address'],
    TempAddress: patientDictionary['Temp. Address'],
    HomeNo: patientDictionary['Home Number'],
    HandphoneNo: patientDictionary['Mobile Number'],
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
      // set show as false when date is selected on datepicker
      // console.log('index: ', page, index);

      const newData = formData;
      // additional check to convert HomeNo and HandphoneNo to string
      if (
        input === 'HomeNo' ||
        input === 'HandphoneNo' ||
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
                  title={'First Name'}
                  value={formData['FirstName']}
                  onChangeText={handleFormData('FirstName')}
                  onChildData={handleFirstNameState}
                />

                <NameInputField
                  isRequired
                  title={'Last Name'}
                  value={formData['LastName']}
                  onChangeText={handleFormData('LastName')}
                  onChildData={handleLastNameState}
                />

                <NRICInputField
                  isRequired
                  title={'NRIC'}
                  value={formData['NRIC']}
                  onChangeText={handleFormData('NRIC')}
                  onChildData={handleNRICState}
                />

                <RadioButtonInput
                  isRequired
                  title={'Gender'}
                  value={formData['Gender']}
                  onChangeData={handleFormData('Gender')}
                  onChildData={handleGenderState}
                  dataArray={listOfGenders}
                />

               <View style={styles.dateSelectionContainer}>
                 <DateInputField
                   isRequired
                   selectionMode={'DOB'}
                   title={'Date of Birth'}
                   value={formData['DOB']}
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
                  title={'Temporary Address'}
                  value={formData['TempAddress']}
                  onChangeText={handleFormData('TempAddress')}
                  onChildData={handleTempAddrState}
                />

                <TelephoneInputField
                  title={'Home Number'}
                  value={formData['HomeNo']}
                  numberType={'home'}
                  onChangeText={handleFormData('HomeNo')}
                  onChildData={handleHomeNumberState}
                />

                <TelephoneInputField
                  title={'Mobile Number'}
                  value={formData['HandphoneNo']}
                  numberType={'mobile'}
                  onChangeText={handleFormData('HandphoneNo')}
                  onChildData={handleMobileNumberState}
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

EditPatientInfoScreen.defaultProps = {
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

export default EditPatientInfoScreen;
