// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList, Text } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// API (v1 direct)
import client, { V1_BASE } from 'app/api/client';

// Components
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import DateInputField from 'app/components/input-components/DateInputField';
import InputField from 'app/components/input-components/InputField';
import AppButton from 'app/components/AppButton';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';

function EditPatientInfoScreen(props) {
  const { patientProfile } = props.route.params;

  const navigation = useNavigation();
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
  const pickLangId = (label, options) => {
    const key = (label ?? '').toString().trim().toLowerCase();
    const match = options?.find(o => (o.label ?? '').toLowerCase() === key);
    return match?.value ?? options?.[0]?.value ?? 1; // fallback to first option or 1
  };
  const from01 = (v) => v === true || v === 1 || v === '1'; // "1"/1/true -> true, else false
  const as01 = (v) => (v === true || v === 'Yes' || v === '1' ? '1' : '0'); // booleans -> "1"/"0"
  const toIso = (d) => (d ? new Date(d).toISOString() : null);              // ensure ISO
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
    PreferredLanguageListID: pickLangId(patientProfile.preferredLanguage, listOfLanguages),
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
    IsRespiteCare: from01(patientProfile.isRespiteCare),
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

  const toPatientUpdatePayload = (f) => {
    // IMPORTANT: your screen stores StartDate/EndDate as strings already (you set ISO in handleFormData).
    // We'll still normalize to ISO to be safe.
    const withPostal = (addr, pc) =>
      pc && pc.length ? `${addr || ''} S(${pc})`.trim() : (addr ?? null);
  
    return {
      // required by PatientUpdate
      name: [f.FirstName, f.LastName].filter(Boolean).join(' ').trim(),
      nric: f.NRIC ?? '',
      gender: f.Gender ?? '',                       // "M" or "F"
      dateOfBirth: toIso(f.DOB),
      isApproved: '0',
      updateBit: '0',
      autoGame: '0',
      startDate: toIso(f.StartDate),
      isActive: '1',
      isRespiteCare: as01(f.IsRespiteCare),
      
      privacyLevel: toInt(f.PrivacyLevel, 0),
  
      // optional / nullable fields
      preferredName: f.PreferredName ?? null,
      preferredLanguageId: f.PreferredLanguageListID ?? 1,
      endDate: toIso(f.EndDate),
      address: withPostal(f.Address, f.PostalCode),             // v1 has no postalCode field
      tempAddress: withPostal(f.TempAddress, f.TempPostalCode), // concat temp postal
      homeNo: f.HomeNo ?? null,
      handphoneNo: f.HandphoneNo ?? null,
      terminationReason: f.TerminationReason ?? null,
      inActiveReason: f.InactiveReason ?? null,
      inActiveDate: toIso(f.InactiveDate),
      profilePicture: null,
      isDeleted: null,
  
      // server requires these in v1 update
      modifiedDate: new Date().toISOString(),
      ModifiedById: String(f.ModifiedById ?? '0'),
    };
  };
  // form submission when save button is pressed
  const submitForm = async () => {
    let tempFormData = {...formData};
    let alertTitle = '';
    let alertDetails = '';

    // treat epoch or empty as null
      if (
        !tempFormData['EndDate'] ||
        tempFormData['EndDate'] === '1970-01-01T00:00:00' ||
        tempFormData['EndDate'] === '1970-01-01T00:00:00Z' ||
        tempFormData['EndDate'] === '1970-01-01T00:00:000Z'
      ) {
        tempFormData['EndDate'] = null;
      }
    
    else if(tempFormData['EndDate'] &&
      tempFormData['StartDate'] &&
      new Date(tempFormData['EndDate']).getTime() < new Date(tempFormData['StartDate']).getTime()
    ) {
      alertTitle = 'Error in Editing Patient Information';
      alertDetails = 'Leave date cannot be earlier than join date!';
      Alert.alert(alertTitle, alertDetails);

      return null;
    }

       // v1 PUT /patients/update/{patient_id}
    const payload = toPatientUpdatePayload(tempFormData);
    const url = `${V1_BASE}/patients/update/${tempFormData.PatientID}`;
    const result = await client.put(url, payload, { require_auth: true });


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
                  dataType="address"
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
                  dataType="address"
                  onChangeText={handleFormData('TempAddress')}
                  onEndEditing={handleTempAddrError}
                />

                <InputField
                  //isRequired={formData.TempAddress ? formData.TempAddress.length > 0 : false}
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
                    title={'Start Date'}
                    value={formData['StartDate'] ? new Date(formData['StartDate']) : null}
                    hideDayOfWeek={true}
                    handleFormData={handleFormData('StartDate')}
                    onEndEditing={handleJoiningError}
                    minimumInputDate={minimumJoiningDate}
                    maximumInputDate={maximumJoiningDate}
                  />
                </View>

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    title={'End Date'}
                    value={!formData['EndDate'] || formData['EndDate'] === '1970-01-01T00:00:00' || formData['EndDate'] === '1970-01-01T00:00:00Z' ||
                      formData['EndDate'] === '1970-01-01T00:00:000Z' ? null : new Date(formData['EndDate'])
                    }
                    handleFormData={handleFormData('EndDate')}
                    hideDayOfWeek={true}
                    onEndEditing={handleLeavingError}
                    allowNull
                    minimumInputDate={minimumJoiningDate}
                    maximumInputDate={maximumJoiningDate}
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
