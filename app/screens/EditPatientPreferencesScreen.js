// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Configurations
import routes from 'app/navigation/routes';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// APIs
import patientApi from 'app/api/patient';

// Components
import AppButton from 'app/components/AppButton';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import ActivityIndicator from 'app/components/ActivityIndicator';

// Utilities
import { parseSelectOptions } from 'app/utility/miscFunctions';
import InputField from 'app/components/input-components/InputField';

function EditPatientPreferencesScreen(props) {
  const { navigation, patientProfile } = props.route.params;
  const [isLoading, setIsLoading] = useState(true);
  
  // Variables relatied to retrieving preferred language select options from API
  const {
    data: languageData,
    isError: languageError,
    isLoading: languageLoading,
  } = useGetSelectionOptions('Language');

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

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isPrefLanguageError, setIsPrefLanguageError] = useState(false);

  // States for getting list of preferred names
  const [isPrefNamesLoading, setIsPrefNamesLoading] = useState(false);
  const [prefNames, setPrefNames] = useState([]);

  // Patient data to be submitted
  const [formData, setFormData] = useState({
    PatientID: patientProfile.patientID,
    PreferredLanguageListID: parseSelectOptions([
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
    ]).filter((item) => item.label === patientProfile.preferredLanguage)[0].value,
    PrefLanguage: patientProfile.preferredLanguage,
    FirstName: patientProfile.firstName,
    LastName: patientProfile.lastName,
    NRIC: patientProfile.nric,
    Address: patientProfile.address,
    PostalCode: patientProfile.postalCode,
    TempAddress: patientProfile.tempAddress,
    TempPostalCode: patientProfile.tempPostalCode,
    HomeNo: patientProfile.homeNo,
    HandphoneNo: patientProfile.handphoneNo,
    Gender: patientProfile.gender,
    DOB: patientProfile.dob,
    PreferredName: patientProfile.preferredName,
    PrivacyLevel: patientProfile.privacyLevel,
    UpdateBit: patientProfile.updateBit,
    AutoGame: patientProfile.autoGame,
    StartDate: patientProfile.startDate,
    IsActive: patientProfile.isActive,
    IsRespiteCare: patientProfile.isRespiteCare,
  });

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.  
  useEffect(() => {
    setIsInputErrors(
      isPrefNameError || 
      isPrefLanguageError,
    );

  }, [
    isPrefNameError,
    isPrefLanguageError,
    isInputErrors,
  ]);
   // Try to get langugage list from backend. If retrieval from the hook is successful, replace the content in
  // listOfLanguages with the retrieved one.
  useEffect(() => {
    if (!languageLoading && !languageError && languageData) {
      // console.log('selection data!');
      setListOfLanguages(languageData);
      setIsLoading(false);
    }
  }, [languageData, languageError, languageLoading]);

  // Get patient preferred names from API
  useEffect(() => {
    getPrefNames();
  }, []);

  // Get list of preferred names from backend to detect duplicate preferred names
  const getPrefNames = async () => {
    setIsPrefNamesLoading(true);
    const response = await patientApi.getPatientList(false, 'active');
    if (!response.ok) {
      setUser(null);
      return;
    }
    setPrefNames(response.data.data.map((x) => x.preferredName));
    setIsPrefNamesLoading(false);
  };

  // Functions for error state reporting for the child components
  const handlePrefNameError = useCallback(
    (state) => {
      setIsPrefNameError(state);
      // console.log('FirstName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handlePrefLanguageError = useCallback(
    (state) => {
      setIsPrefLanguageError(state);
      // console.log('LastName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefLanguageError],
  );

  // Function to update patient data
  const handleFormData = (field) => (e) => {
    if (field === 'PreferredLanguageListID') {
      setFormData((prevState) => ({
        ...prevState,
        [field]: parseInt(e)
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e
      }));
    }    
  };  

  // form submission when save button is pressed
  const submitForm = async () => {
    const result = await patientApi.updatePatient(formData);

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

      alertTitle = 'Error in Editing Patient Preferences';
      console.log("result error "+JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
    console.log("formData "+JSON.stringify(formData));
  };

  return languageLoading || isLoading ? (
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
                  title={'Preferred Name'}
                  value={formData.PreferredName}
                  onChangeText={handleFormData('PreferredName')}
                  onEndEditing={handlePrefNameError}                    
                  dataType="name"
                  otherProps={{prefNameList: prefNames}}
                />

                <SelectionInputField
                  isRequired
                  title={'Preferred Language'}
                  placeholder={formData['PrefLanguage']}
                  onDataChange={handleFormData('PreferredLanguageListID')}
                  value={formData.PreferredLanguageListID}
                  dataArray={listOfLanguages}
                  onEndEditing={handlePrefLanguageError}
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

EditPatientPreferencesScreen.defaultProps = {
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

export default EditPatientPreferencesScreen;
