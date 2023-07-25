// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base';

// Configurations
import routes from 'app/navigation/routes';

//API
import patientApi from 'app/api/patient';

//Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import DateInputField from 'app/components/DateInputField';
import CommonInputField from 'app/components/CommonInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import AppButton from 'app/components/AppButton';

function EditPatientInfoScreen(props) {
  const { navigation, patientProfile } = props.route.params;

  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later
  
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  const listOfRespiteCare = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
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
  const [isJoiningError, setIsJoiningError] = useState(false);
  const [isLeavingError, setIsLeavingError] = useState(false);
  const [isRespiteError, setIsRespiteError] = useState(false);
  const listOfLanguages = [
    { label: 'Cantonese', value: 1 },
    { label: 'English', value: 2 },
    { label: 'Hainanese', value: 3 },
    { label: 'Hakka', value: 4 },
    { label: 'Hindi', value: 5 },
    { label: 'Hokkien', value: 6 },
    { label: 'Malay', value: 7 },
    { label: 'Mandarin', value: 8 },
    { label: 'Tamil', value: 9 },
    { label: 'Teochew', value: 10 },
    { label: 'Japanese', value: 11 },
    { label: 'Spanish', value: 12 },
    { label: 'Korean', value: 13 },
  ];
  // Error state handling for child components
  const handleFirstNameState = useCallback(
    (state) => {
      setIsFirstNameError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFirstNameError],
  );
  const handleLastNameState = useCallback(
    (state) => {
      setIsLastNameError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLastNameError],
  );
  const handleNRICState = useCallback(
    (state) => {
      setIsNRICError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNRICError],
  );
  const handleGenderState = useCallback(
    (state) => {
      setIsGenderError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGenderError],
  );
  const handleDOBState = useCallback(
    (state) => {
      setIsDOBError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDOBError],
  );
  const handleAddrState = useCallback(
    (state) => {
      setIsAddrError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAddrError],
  );
  const handleTempAddrState = useCallback(
    (state) => {
      setIsTempAddrError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTempAddrError],
  );
  const handleHomeNumberState = useCallback(
    (state) => {
      setIsHomeNumberError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHomeNumberError],
  );
  const handleMobileNumberState = useCallback(
    (state) => {
      setIsMobileNumberError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobileNumberError],
  );
  const handleJoiningState = useCallback(
    (state) => {
      setIsJoiningError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isJoiningError],
  );
  const handleLeavingState = useCallback(
    (state) => {
      setIsLeavingError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLeavingError],
  );
  const handleRespiteState = useCallback(
    (state) => {
      setIsRespiteError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRespiteError],
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
    PatientID: patientProfile.patientID,
    PreferredLanguageListID: listOfLanguages.find((item) => item.label === patientProfile.preferredLanguage).value,  // convert label to value with listOfLanguages
    PrefLanguage: patientProfile.preferredLanguage,
    FirstName: patientProfile.firstName,
    LastName: patientProfile.lastName,
    NRIC: patientProfile.nric,
    Gender: patientProfile.gender,
    DOB: patientProfile.dob,
    PreferredName: patientProfile.preferredName,
    Address: patientProfile.address,
    TempAddress: patientProfile.tempAddress,
    HomeNo: patientProfile.homeNo,
    HandphoneNo: patientProfile.handphoneNo,
    StartDate: patientProfile.startDate,
    EndDate: patientProfile.endDate,
    IsRespiteCare: patientProfile.isRespiteCare,
    PrivacyLevel: patientProfile.privacyLevel,
    UpdateBit: patientProfile.updateBit,
    AutoGame: patientProfile.autoGame,
    IsActive: patientProfile.isActive,
  });

  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (input = null) =>
    (e, date = null) => {
      if (
        input === 'HomeNo' ||
        input === 'HandphoneNo' ||
        input === 'Address' ||
        input === 'TempAddress'
      ) {
        e.toString(); // convert to string
      } else if (
        input === 'DOB' ||
        input === 'StartDate' ||
        input === 'EndDate'
      ) {
        e = e.toISOString().replace('.000Z', ''); // replacement of date values as '.000Z' is not allowed in database
      } else {
        date
          ? date
          : e.$d //e['$d']-check if input from MUI date-picker
          ? e.$d
          : parseInt(e) // check if integer (for dropdown)
          ? parseInt(e) // change to integer
          : e; // eg. guardianInfo[0].FirstName = e
      }
      setFormData((previousState) => ({
        ...previousState,
        [input]: e,
      }));
    };

  // form submission when save button is pressed
  const submitForm = async () => {
    const result = await patientApi.updatePatient(formData);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      navigation.goBack(routes.PATIENT_INFORMATION, {
        navigation: navigation,
      });
      alertTitle = 'Saved Successfully';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Editing Patient Information';
      console.log("result error "+JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
    console.log("formData "+JSON.stringify(formData));
  };

  return (
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <View style={styles.formContainer}>
{
//                <NameInputField
//                  isRequired
//                  title={'First Name'}
//                  value={formData['FirstName']}
//                  onChangeText={handleFormData('FirstName')}
//                  onChildData={handleFirstNameState}
//                />
//
//                <NameInputField
//                  isRequired
//                  title={'Last Name'}
//                  value={formData['LastName']}
//                  onChangeText={handleFormData('LastName')}
//                  onChildData={handleLastNameState}
//                />
//
//                <NRICInputField
//                  isRequired
//                  title={'NRIC'}
//                  value={formData['NRIC']}
//                  onChangeText={handleFormData('NRIC')}
//                  onChildData={handleNRICState}
//                />
//
//                <RadioButtonInput
//                  isRequired
//                  title={'Gender'}
//                  value={formData['Gender']}
//                  onChangeData={handleFormData('Gender')}
//                  onChildData={handleGenderState}
//                  dataArray={listOfGenders}
//                />
//
//               <View style={styles.dateSelectionContainer}>
//                 <DateInputField
//                   isRequired
//                   selectionMode={'DOB'}
//                   title={'Date of Birth'}
//                   value={new Date(formData['DOB'])}
//                   handleFormData={handleFormData('DOB')}
//                   onChildData={handleDOBState}
//                 />
//               </View>
}
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

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    isRequired
                    title={'Date of Joining'}
                    value={new Date(formData['StartDate'])}
                    handleFormData={handleFormData('StartDate')}
                    onChildData={handleJoiningState}
                    minimumInputDate={minimumJoiningDate}
                    maximumInputDate={maximumJoiningDate}
                  />
                </View>

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    title={'Date of Leaving (Optional)'}
                    value={new Date(formData['EndDate']) || new Date(0)}
                    handleFormData={handleFormData('EndDate')}
                    onChildData={handleLeavingState}
                  />
                </View>

                <RadioButtonInput
                  isRequired
                  title={'Respite Care'}
                  value={formData['IsRespiteCare']}
                  onChangeData={handleFormData('IsRespiteCare')}
                  dataArray={listOfRespiteCare}
                  onChildData={handleRespiteState}
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
