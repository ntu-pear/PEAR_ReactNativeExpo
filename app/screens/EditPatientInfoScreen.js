// Libs
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import AuthContext from 'app/auth/context';
import { currentUserId } from 'app/utility/medicationAdminister';
import { buildPatientInfoUpdate } from 'app/utility/patientFieldPolicy';
import requestDeadline from 'app/utility/requestDeadline';

// API (v1 direct)
import client, { PATIENT_V1_BASE } from 'app/api/client';

// Components
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import DateInputField from 'app/components/input-components/DateInputField';
import InputField from 'app/components/input-components/InputField';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import AppButton from 'app/components/AppButton';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';

function EditPatientInfoScreen(props) {
  const { patientProfile } = props.route.params;

  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const changedFields = useRef(new Set());
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveUncertain, setSaveUncertain] = useState(false);
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

  const [listOfRespiteCare, setListOfRespiteCare] = useState([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);

  // Privacy level options
  const [privacyLevelOptions] = useState([
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 },
  ]);
  const pickLangId = (label, options) => {
    const key = (label ?? '').toString().trim().toLowerCase();
    const match = options?.find((o) => (o.label ?? '').toLowerCase() === key);
    return match?.value ?? options?.[0]?.value ?? 1; // fallback to first option or 1
  };
  //const from01 = (v) => v === true || v === 1 || v === '1'; // "1"/1/true -> true, else false
  //const as01 = (v) => (v === true || v === 'Yes' || v === '1' ? '1' : '0');
  const fromBoolish = (v) => v === true || v === 1 || v === '1' || v === 'true'; // booleans -> "1"/"0"
  const toStr = (v) => (v ?? '').toString().trim();
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
    PreferredLanguageListID: pickLangId(
      patientProfile.preferredLanguage,
      listOfLanguages,
    ),
    PrefLanguage:
      patientProfile.preferredLanguage != null &&
      patientProfile.preferredLanguage != 'null'
        ? patientProfile.preferredLanguage
        : '',
    FirstName:
      patientProfile.firstName != null && patientProfile.firstName != 'null'
        ? patientProfile.firstName
        : '',
    LastName:
      patientProfile.lastName != null && patientProfile.lastName != 'null'
        ? patientProfile.lastName
        : '',
    NRIC:
      patientProfile.nric != null && patientProfile.nric != 'null'
        ? patientProfile.nric
        : '',
    Gender:
      patientProfile.gender != null && patientProfile.gender != 'null'
        ? patientProfile.gender
        : '',
    DOB:
      patientProfile.dob != null && patientProfile.dob != 'null'
        ? patientProfile.dob
        : null,
    PreferredName:
      patientProfile.preferredName != null &&
      patientProfile.preferredName != 'null'
        ? patientProfile.preferredName
        : '',
    Address:
      patientProfile.address != null && patientProfile.address != 'null'
        ? patientProfile.address
        : '',
    PostalCode:
      patientProfile.postalCode != null && patientProfile.postalCode != 'null'
        ? patientProfile.postalCode
        : '',
    TempAddress:
      patientProfile.tempAddress != null && patientProfile.tempAddress != 'null'
        ? patientProfile.tempAddress
        : '',
    TempPostalCode:
      patientProfile.tempPostalCode != null &&
      patientProfile.tempPostalCode != 'null'
        ? patientProfile.tempPostalCode
        : '',
    HomeNo:
      patientProfile.homeNo != null && patientProfile.homeNo != 'null'
        ? patientProfile.homeNo
        : '',
    HandphoneNo:
      patientProfile.handphoneNo != null && patientProfile.handphoneNo != 'null'
        ? patientProfile.handphoneNo
        : '',
    StartDate:
      patientProfile.startDate != null && patientProfile.startDate != 'null'
        ? patientProfile.startDate
        : null,
    EndDate:
      patientProfile.endDate != null && patientProfile.endDate != 'null'
        ? patientProfile.endDate
        : null,
    IsRespiteCare: fromBoolish(patientProfile.isRespiteCare),
    PrivacyLevel:
      patientProfile.privacyLevel != null &&
      patientProfile.privacyLevel !== 'null'
        ? String(patientProfile.privacyLevel)
        : '2',
    UpdateBit:
      patientProfile.updateBit != null && patientProfile.updateBit != 'null'
        ? patientProfile.updateBit
        : '',
    AutoGame:
      patientProfile.autoGame != null && patientProfile.autoGame != 'null'
        ? patientProfile.autoGame
        : '',
    IsActive:
      patientProfile.isActive != null && patientProfile.isActive != 'null'
        ? patientProfile.isActive
        : '',
  });

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
  const handleAddrError = useCallback((state) => {
    setIsAddrError(state);
    // console.log("addr", state)
  }, []);

  const handlePostalCodeError = useCallback((state) => {
    setIsPostalCodeError(state);
    // console.log("addr", state)
  }, []);

  const handleTempAddrError = useCallback((state) => {
    setIsTempAddrError(state);
    // console.log("temp addr", state)
  }, []);

  const handleTempPostalCodeError = useCallback((state) => {
    setIsTempPostalCodeError(state);
    // console.log("addr", state)
  }, []);

  const handleHomeNoError = useCallback((state) => {
    setIsHomeNoError(state);
    // console.log("home", state)
  }, []);

  const handleMobileNoError = useCallback((state) => {
    setIsMobileNoError(state);
    // console.log("mobile", state)
  }, []);

  const handleRespiteError = useCallback((state) => {
    setIsRespiteError(state);
    // console.log("respite", state)
  }, []);

  const handleJoiningError = useCallback((state) => {
    setIsJoiningError(state);
    // console.log("joining", state)
  }, []);

  const handleLeavingError = useCallback((state) => {
    setIsLeavingError(state);
    // console.log("leaving", state)
  }, []);

  // Function to update patient data
  const handleFormData = (field) => (e) => {
    changedFields.current.add(field);
    if (field == 'StartDate' || field == 'EndDate') {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e != null ? new Date(e).toISOString() : null,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e,
      }));
    }
  };

  const submitForm = async () => {
    if (saving.current || saveUncertain || isInputErrors) return;
    saving.current = true;
    setIsSaving(true);
    let writeStarted = false;
    try {
      const id = patientProfile.patientID;
      const fresh = await requestDeadline(
        client.get(
          `/patients/${id}`,
          { require_auth: true, mask: false },
          { baseURL: PATIENT_V1_BASE, timeout: 15000 },
        ),
      );
      if (!fresh?.ok)
        throw new Error(
          'Patient information could not be loaded. Please retry.',
        );
      const record = fresh.data?.data ?? fresh.data;
      const payload = buildPatientInfoUpdate({
        record,
        edits: formData,
        changedFields: changedFields.current,
        patientId: id,
        userId: currentUserId(user),
      });
      writeStarted = true;
      const result = await requestDeadline(
        client.put(`/patients/update/${id}`, payload, {
          baseURL: PATIENT_V1_BASE,
          timeout: 15000,
        }),
      );
      if (!result?.ok) {
        if (!result?.status || result.status >= 500) {
          setSaveUncertain(true);
          Alert.alert(
            'Save could not be confirmed',
            'Reopen this patient and check the current information before saving again.',
          );
        } else {
          Alert.alert(
            'Patient information was not saved',
            'Check your permissions and entered information, then retry.',
          );
        }
        return;
      }
      navigation.replace(routes.PATIENT_PROFILE, { patientId: id });
      Alert.alert(
        'Saved Successfully',
        'Patient information has been updated.',
      );
    } catch (error) {
      if (writeStarted) {
        setSaveUncertain(true);
        Alert.alert(
          'Save could not be confirmed',
          'Reopen this patient and check the current information before saving again.',
        );
      } else {
        Alert.alert(
          'Patient information was not saved',
          error.message || 'Please retry.',
        );
      }
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
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
                  onChangeText={(t) =>
                    handleFormData('Address')((t ?? '').toString())
                  }
                  onEndEditing={handleAddrError}
                />

                <InputField
                  title="Temporary Address"
                  value={formData.TempAddress}
                  dataType="address"
                  onChangeText={(t) =>
                    handleFormData('TempAddress')((t ?? '').toString())
                  }
                  onEndEditing={handleTempAddrError}
                />

                <InputField
                  title={'Home Telephone No.'}
                  value={formData.HomeNo}
                  onChangeText={handleFormData('HomeNo')}
                  onEndEditing={handleHomeNoError}
                  dataType={'home phone'}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <InputField
                  title={'Mobile No.'}
                  value={formData.HandphoneNo}
                  onChangeText={handleFormData('HandphoneNo')}
                  onEndEditing={handleMobileNoError}
                  dataType={'mobile phone'}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <SelectionInputField
                  title={'Privacy Level'}
                  value={
                    formData.PrivacyLevel ? parseInt(formData.PrivacyLevel) : 2
                  }
                  onDataChange={(selectedValue) => {
                    handleFormData('PrivacyLevel')(selectedValue.toString());
                  }}
                  dataArray={privacyLevelOptions}
                  placeholder="Select privacy level"
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
                    value={
                      formData['StartDate']
                        ? new Date(formData['StartDate'])
                        : null
                    }
                    hideDayOfWeek={true}
                    handleFormData={handleFormData('StartDate')}
                    onEndEditing={handleJoiningError}
                  />
                </View>

                <View style={styles.dateSelectionContainer}>
                  <DateInputField
                    title={'End Date'}
                    value={
                      !formData['EndDate'] ||
                      formData['EndDate'] === '1970-01-01T00:00:00' ||
                      formData['EndDate'] === '1970-01-01T00:00:00Z' ||
                      formData['EndDate'] === '1970-01-01T00:00:000Z'
                        ? null
                        : new Date(formData['EndDate'])
                    }
                    handleFormData={handleFormData('EndDate')}
                    hideDayOfWeek={true}
                    onEndEditing={handleLeavingError}
                    allowNull
                    centerDate
                  />
                </View>

                <Text style={styles.redText}>
                  Note: To edit other information, please contact system
                  administrator.
                </Text>
              </View>
              {saveUncertain && (
                <Text style={styles.redText}>
                  Reopen the patient to confirm the save before trying again.
                </Text>
              )}
              <View style={styles.saveButtonContainer}>
                <Box width="70%">
                  <AppButton
                    title="Save"
                    color="green"
                    onPress={submitForm}
                    isDisabled={isInputErrors || isSaving || saveUncertain}
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
