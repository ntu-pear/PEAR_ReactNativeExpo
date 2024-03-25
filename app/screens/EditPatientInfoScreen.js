// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList, Text } from 'native-base';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// API
import patientApi from 'app/api/patient';

// Components
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import DateInputField from 'app/components/input-components/DateInputField';
import InputField from 'app/components/input-components/InputField';
import AppButton from 'app/components/AppButton';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';

function EditPatientInfoScreen(props) {
  const { navigation, patientProfile } = props.route.params;

  // Set initial value for preferred language select field
  const [listOfLanguages, setListOfLanguages] = useState(
    parseSelectOptions([
      'Cantonese',
      'English',
      'Hainanese',
      'Hakka',
      'Hindi',
      'Hokkien',
      'Malay',
      'Mandarin',
      'Tamil',
      'Teochew',
      'Japanese',
      'Spanish',
      'Korean',
    ]),
    );
  
    // Used for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const [listOfRespiteCare, setListOfRespiteCare] = useState([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isAddrError, setIsAddrError] = useState(false);
  const [isPostalCodeError, setIsPostalCodeError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isTempPostalCodeError, setIsTempPostalCodeError] = useState(false);
  const [isHomeNoError, setIsHomeNoError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);
  const [isRespiteError, setIsRespiteError] = useState(false);
  const [isJoiningError, setIsJoiningError] = useState(false);
  const [isLeavingError, setIsLeavingError] = useState(false);

  // Patient data to be submitted
  const [formData, setFormData] = useState({
    PatientID: patientProfile.patientID,
    PreferredLanguageListID: listOfLanguages.find(
      (item) => item.label === patientProfile.preferredLanguage,
    ).value, // convert label to value with listOfLanguages
    PrefLanguage: patientProfile.preferredLanguage != null && patientProfile.preferredLanguage != 'null' ? patientProfile.preferredLanguage : '',
    FirstName: patientProfile.firstName != null && patientProfile.firstName != 'null' ? patientProfile.firstName : '',
    LastName: patientProfile.lastName != null && patientProfile.lastName != 'null' ? patientProfile.lastName : '',
    NRIC: patientProfile.nric != null && patientProfile.nric != 'null' ? patientProfile.nric : '',
    Gender: patientProfile.gender != null && patientProfile.gender != 'null' ? patientProfile.gender : '',
    DOB: patientProfile.dob != null && patientProfile.dob != 'null' ? patientProfile.dob : null,
    PreferredName: patientProfile.preferredName != null && patientProfile.preferredName != 'null' ? patientProfile.preferredName : '',
    Address: patientProfile.address != null && patientProfile.address != 'null' ? patientProfile.address : '',
    PostalCode: patientProfile.postalCode != null && patientProfile.postalCode != 'null' ? patientProfile.postalCode : '',
    TempAddress: patientProfile.tempAddress != null && patientProfile.tempAddress != 'null' ? patientProfile.tempAddress : '',
    TempPostalCode: patientProfile.tempPostalCode != null && patientProfile.tempPostalCode != 'null' ? patientProfile.tempPostalCode : '',
    HomeNo: patientProfile.homeNo != null && patientProfile.homeNo != 'null' ? patientProfile.homeNo : '',
    HandphoneNo: patientProfile.handphoneNo != null && patientProfile.handphoneNo != 'null' ? patientProfile.handphoneNo : '',
    StartDate: patientProfile.startDate != null && patientProfile.startDate != 'null' ? patientProfile.startDate : null,
    EndDate: patientProfile.endDate != null && patientProfile.endDate != 'null' ? patientProfile.endDate : null,
    IsRespiteCare: patientProfile.isRespiteCare != null && patientProfile.isRespiteCare != 'null' ? patientProfile.isRespiteCare : '',
    PrivacyLevel: patientProfile.privacyLevel != null && patientProfile.privacyLevel != 'null' ? patientProfile.privacyLevel : '',
    UpdateBit: patientProfile.updateBit != null && patientProfile.updateBit != 'null' ? patientProfile.updateBit : '',
    AutoGame: patientProfile.autoGame != null && patientProfile.autoGame != 'null' ? patientProfile.autoGame : '',
    IsActive: patientProfile.isActive != null && patientProfile.isActive != 'null' ? patientProfile.isActive : '',
  });

  console.log(formData)
  
  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later


  // Error state handling for this component
  useEffect(() => {
    setIsInputErrors(
      isAddrError ||
      isPostalCodeError ||
      isTempAddrError ||
      isTempPostalCodeError ||
      isHomeNoError ||
      isMobileNoError ||
      isRespiteError ||
      isJoiningError ||
      isLeavingError,
    );
    // console.log(isInputErrors);
  }, [
    isAddrError,
    isPostalCodeError,
    isTempAddrError,
    isTempPostalCodeError,
    isHomeNoError,
    isMobileNoError,
    isRespiteError,
    isJoiningError,
    isLeavingError,
  ]);
  
  // Functions for error state reporting for the child components
  const handleAddrError = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log("addr", state)
    },
    [isAddrError],
  );

  const handlePostalCodeError = useCallback(
    (state) => {
      setIsPostalCodeError(state);
      // console.log("addr", state)
    },
    [isPostalCodeError],
  );
  
  const handleTempAddrError = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log("temp addr", state)
    },
    [isTempAddrError],
  );

  const handleTempPostalCodeError = useCallback(
    (state) => {
      setIsTempPostalCodeError(state);
      // console.log("addr", state)
    },
    [isTempPostalCodeError],
  );
  
  const handleHomeNoError = useCallback(
    (state) => {
      setIsHomeNoError(state);
      // console.log("home", state)
    },
    [isHomeNoError],
  );

  const handleMobileNoError = useCallback(
    (state) => {
      setIsMobileNoError(state);
      // console.log("mobile", state)
    },
    [isMobileNoError],
  );
  
  const handleRespiteError = useCallback(
    (state) => {
      setIsRespiteError(state);
      // console.log("respite", state)
    },
    [isRespiteError],
  );

  const handleJoiningError = useCallback(
    (state) => {
      setIsJoiningError(state);
      // console.log("joining", state)
    },
    [isJoiningError],
  );

  const handleLeavingError = useCallback(
    (state) => {
      setIsLeavingError(state);
      // console.log("leaving", state)
    },
    [isLeavingError],
  );

  // Function to update patient data
  const handleFormData = (field) => (e) => {
    if(field == 'StartDate' || field == 'EndDate') {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e != null ? new Date(e).toISOString() : null
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e
      }))
    }
  };

  // form submission when save button is pressed
  const submitForm = async () => {
    let tempFormData = {...formData};
    if(tempFormData['EndDate'] == null) {
      tempFormData['EndDate'] = new Date(null).toISOString();
    }

    const result = await patientApi.updatePatient(tempFormData);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      navigation.goBack(routes.PATIENT_PROFILE, {
        navigation: navigation,
      });
      alertTitle = 'Saved Successfully';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Editing Patient Information';
      console.log('result error ' + JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
    console.log('formData ' + JSON.stringify(formData));
  };

  return (
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <View style={styles.formContainer}>
                <InputField
                  isRequired
                  title={'Address'}
                  value={formData.Address}
                  onChangeText={handleFormData('Address')}
                  onEndEditing={handleAddrError}
                />
                
                <InputField
                  isRequired={formData.Address.length > 0}
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
                  onChangeText={handleFormData('TempAddress')}
                  onEndEditing={handleTempAddrError}
                />

                <InputField
                  isRequired={formData.TempAddress ? formData.TempAddress.length > 0 : false}
                  title={'Temporary Postal Code'}
                  value={formData.TempPostalCode}
                  onChangeText={handleFormData('TempPostalCode')}
                  onEndEditing={handleTempPostalCodeError}
                  dataType='postal code'
                  keyboardType='numeric'
                  maxLength={6}
                />

                <InputField
                  title={'Home Telephone No.'}
                  value={formData.HomeNo}
                  onChangeText={handleFormData('HomeNo')}
                  onEndEditing={handleHomeNoError}
                  dataType={'home phone'}
                  keyboardType='numeric'
                  maxLength={8}
                />

                <InputField
                  title={'Mobile No.'}
                  value={formData.HandphoneNo}
                  onChangeText={handleFormData('HandphoneNo')}
                  onEndEditing={handleMobileNoError}
                  dataType={'mobile phone'}
                  keyboardType='numeric'                      
                  maxLength={8}
                />   

                <RadioButtonInput
                  isRequired
                  title={'Respite Care'}
                  value={formData.IsRespiteCare}
                  onChangeData={handleFormData('IsRespiteCare')}
                  dataArray={listOfRespiteCare}
                  onEndEditing={handleRespiteError}
                />

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    isRequired
                    title={'Date of Joining'}
                    value={new Date(formData['StartDate'])}
                    hideDayOfWeek={true}
                    handleFormData={handleFormData('StartDate')}
                    onEndEditing={handleJoiningError}
                    minimumInputDate={minimumJoiningDate}
                    maximumInputDate={maximumJoiningDate}
                  />
                </View>

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    title={'Date of Leaving'}
                    value={formData['EndDate'] == "1970-01-01T00:00:00" || formData['EndDate'] == null ? null : new Date(formData['EndDate'])}
                    handleFormData={handleFormData('EndDate')}
                    hideDayOfWeek={true}
                    onEndEditing={handleLeavingError}
                    allowNull
                    minimumInputDate={new Date()}
                    centerDate
                  />
                </View>

                <Text style={styles.redText}>
                  Note: To edit other information, please contact system
                  administrator.
                </Text>
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
    width: '100%',
  },
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  redText: {
    marginBottom: 4,
    alignSelf: 'center',
    color: colors.red,
  },
});

export default EditPatientInfoScreen;
