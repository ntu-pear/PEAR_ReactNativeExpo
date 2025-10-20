// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList, Text } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// API (v1 direct)
import client, { PATIENT_V1_BASE } from 'app/api/client';

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
  
  
    const looksMaskedNRIC = (v) => {
      const s = (v ?? '').toString();
      return /(x{2,}|\*{2,}|•{2,}|#{2,})/i.test(s);
    };
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
  //const from01 = (v) => v === true || v === 1 || v === '1'; // "1"/1/true -> true, else false
  //const as01 = (v) => (v === true || v === 'Yes' || v === '1' ? '1' : '0'); 
  const fromBoolish = (v) => v === true || v === 1 || v === '1' || v === 'true';// booleans -> "1"/"0"
  const toStr = v => (v ?? '').toString().trim();
  const toISO = d => (d ? new Date(d).toISOString().slice(0,10) : null);
  const asBool01 = v => v === 1 || v === '1' || v === true;
  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const toInt = (v, fallback = null) => {
    if (v === undefined || v === null || v === '') return fallback;
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? fallback : n;
  };
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
    IsRespiteCare: fromBoolish(patientProfile.isRespiteCare),
    PrivacyLevel:
  patientProfile.privacyLevel != null && patientProfile.privacyLevel !== 'null'
    ? String(patientProfile.privacyLevel)
    : '',
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

  const present = (v) => v !== undefined && v !== null && v !== '';
  const as01 = (v) =>
    (v === true || v === 1 || v === '1' || v === 'true') ? '1' : '0';

  const toPatientUpdatePayload = (f) => {
    const withPostal = (addr, pc) => {
      const a = (addr ?? '').toString().trim();
      const p = (pc ?? '').toString().trim();
      if (!a && !p) return '';          // empty string means “clear”
      return p ? `${a} S(${p})` : a;    // keep address even if postal is blank
    };
  
    const fullName = [f.FirstName, f.LastName].filter(Boolean).join(' ').trim();
    const safeName = fullName || (f.PreferredName ?? '').toString().trim();
  
    // helpers
    const asBoolString = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 'true' : 'false');
    const toInt = (v, fb = 0) => {
      if (v === undefined || v === null || v === '') return fb;
      const n = parseInt(String(v), 10);
      return Number.isNaN(n) ? fb : n;
    };
  
    return {
      // strings
      name: safeName,
      nric: f.NRIC ?? '',
      gender: f.Gender ?? '',
  
      // ISO datetimes
      dateOfBirth: f.DOB ? new Date(f.DOB).toISOString() : null,
      startDate:   f.StartDate ? new Date(f.StartDate).toISOString() : null,
      endDate:     f.EndDate ? new Date(f.EndDate).toISOString() : null,    
  
      isActive:      as01(f.IsActive),       // "1" or "0"
      isRespiteCare: as01(f.IsRespiteCare),
  
      // ints
      privacyLevel: toInt(f.PrivacyLevel, 0),
  
      // optionals
      preferredName:       f.PreferredName ?? null,
      preferredLanguageId: f.PreferredLanguageListID ?? 1,
      address:     withPostal(f.Address, f.PostalCode),
      tempAddress: withPostal(f.TempAddress, f.TempPostalCode),
      homeNo:      f.HomeNo ?? null,
      handphoneNo: f.HandphoneNo ?? null,
      terminationReason: f.TerminationReason ?? null,
      inActiveReason:    f.InactiveReason ?? null,
      inActiveDate:      f.InactiveDate ? new Date(f.InactiveDate).toISOString() : null,
      profilePicture: null,
      isDeleted: '0',
  
      // meta (strings per your previous calls)
      isApproved: '0',
      updateBit:  '0',
      autoGame:   '0',
      modifiedDate: new Date().toISOString(),
      ModifiedById: String(f.ModifiedById ?? '0'),
    };
  };
  

  useEffect(() => {
    const looksMasked = v => !v || /[*xX]/.test(String(v));
    if (!looksMasked(formData.NRIC)) return;
  
    let cancelled = false;
    (async () => {
      try {
        const id = patientProfile?.patientID;
        if (!id) return;
        // if your backend supports mask=false, great; if not, remove the query
        const res = await client.get(`${PATIENT_V1_BASE}/patients/${id}/?mask=false`, { require_auth: true });
        if (!cancelled && res?.ok && res.data) {
          const nric = res.data.nric ?? res.data.NRIC;
          if (nric && !looksMasked(nric)) {
            setFormData(prev => ({ ...prev, NRIC: nric }));
          }
        }
      } catch (e) {
        console.log('[Edit] v1 unmask NRIC failed:', e?.message || e);
      }
    })();
  
    return () => { cancelled = true; };
  }, [patientProfile?.patientID, formData.NRIC]);// runs once per patient
  // form submission when save button is pressed
  const submitForm = async () => {
    let tempFormData = { ...formData };
  
    // normalize EndDate
    const isEpoch = (d) =>
      !d ||
      d === '1970-01-01T00:00:00' ||
      d === '1970-01-01T00:00:00Z' ||
      d === '1970-01-01T00:00:000Z';
    if (isEpoch(tempFormData.EndDate)) tempFormData.EndDate = null;
  
    // date guard
    if (
      tempFormData.EndDate &&
      tempFormData.StartDate &&
      new Date(tempFormData.EndDate).getTime() < new Date(tempFormData.StartDate).getTime()
    ) {
      Alert.alert('Error in Editing Patient Information', 'Leave date cannot be earlier than join date!');
      return;
    }
  
    // (Optional) NRIC mask guard — remove if not needed on this screen
    // const nricStr = (tempFormData.NRIC ?? '').toString();
    // if (/(x{2,}|\*{2,}|•{2,}|#{2,})/i.test(nricStr)) {
    //   Alert.alert('Invalid NRIC', 'The NRIC appears masked (e.g., Sxxxx443F). Please enter the full NRIC before saving.');
    //   return;
    // }
  
    // build payload & PUT
    const payload = toPatientUpdatePayload(tempFormData);
    console.log('[DEBUG] form Address/Postal ->', tempFormData.Address, tempFormData.PostalCode);
    console.log('[DEBUG] payload.address ->', payload.address);
    const url = `${PATIENT_V1_BASE}/patients/update/${tempFormData.PatientID}`;
    console.log('[PUT] url=', url);
    console.log('[PUT] payload=', JSON.stringify(payload));
  
    const result = await client.put(url, payload, { require_auth: true });
    console.log('[PUT] status=', result.status, 'ok=', result.ok, 'data=', result.data);
  
    if (result.ok) {
      Alert.alert('Saved Successfully', '');
      navigation.goBack(routes.PATIENT_PROFILE, { navigation });
    } else {
      // unwrap common error shapes: string | {detail} | {message}
      let msg = 'Please try again.';
      const data = result.data;
    
      if (typeof data?.detail === 'string') {
        msg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // join validation messages from pydantic/fastapi style errors
        msg = data.detail.map(e => e.msg || JSON.stringify(e)).join('\n');
      } else if (typeof data?.message === 'string') {
        msg = data.message;
      }
    
      console.log('[PUT ERROR]', JSON.stringify(result));
      Alert.alert('Error in Editing Patient Information', msg);
    }
  
    console.log('formData', JSON.stringify(formData));
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
              title="Address"
              dataType="address"
              value={formData.Address}
              onChangeText={(t) => handleFormData('Address')((t ?? '').toString())}
              onEndEditing={handleAddrError}
              />

              <InputField
              isRequired={formData.Address.length > 0}
              title="Postal Code"
              value={formData.PostalCode}
              onChangeText={(t) => handleFormData('PostalCode')((t ?? '').toString())}
              onEndEditing={handlePostalCodeError}
              dataType="postal code"
              keyboardType="numeric"
               maxLength={6}
                />

              <InputField
               title="Temporary Address"
              value={formData.TempAddress}
              dataType="address"
              onChangeText={(t) => handleFormData('TempAddress')((t ?? '').toString())}
               onEndEditing={handleTempAddrError}
              />

              <InputField
              title="Temporary Postal Code"
              value={formData.TempPostalCode}
              onChangeText={(t) => handleFormData('TempPostalCode')((t ?? '').toString())}
               onEndEditing={handleTempPostalCodeError}
              dataType="postal code"
              keyboardType="numeric"
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
