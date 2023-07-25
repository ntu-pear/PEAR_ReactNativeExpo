// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Configurations
import routes from 'app/navigation/routes';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

//API
import patientApi from 'app/api/patient';

//Components
import CommonInputField from 'app/components/CommonInputField';
import AppButton from 'app/components/AppButton';
import SelectionInputField from 'app/components/SelectionInputField';
import ActivityIndicator from 'app/components/ActivityIndicator';

function EditPatientPreferencesScreen(props) {
  const { navigation, patientProfile } = props.route.params;
  const [isLoading, setIsLoading] = useState(true);
  
  // retrive list data from database using useGetSelectionOptions
  const {
    data: languageData,
    isError: languageError,
    isLoading: languageLoading,
  } = useGetSelectionOptions('Language');

  // error state for component
  const [isInputErrors, setIsInputErrors] = useState(false);

  // error states for child components
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isPrefLanguageError, setIsPrefLanguageError] = useState(false);

  // listOfLanguages used after api is called
  const [listOfLanguages, setListOfLanguages] = useState([]);

  // set initial value for SelectionInputField dataArray prop -> follow format of "label" and "value"
  const listOfLanguagesPreset = [
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

  // Waiting for language to be fully loaded before finding and setting PreferredLanguageListID
  //useEffect(() => {
  //  if (!languageLoading && !isLoading && listOfLanguages !== undefined && listOfLanguages) {
  //    setFormData((prevData) => ({
  //      ...prevData,
  //      PreferredLanguageListID: listOfLanguagesPreset.find((item) => item.label === patientProfile.preferredLanguage).value,
  //    }));
  //  }
  //}, [languageLoading, isLoading]);

  // Error state handling for child components
  const handlePrefNameState = useCallback(
    (state) => {
      setIsPrefNameError(state);
      // console.log('FirstName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handlePrefLanguageState = useCallback(
    (state) => {
      setIsPrefLanguageError(state);
      // console.log('LastName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefLanguageError],
  );

  // Error state handling for this component
  useEffect(() => {
    setIsInputErrors(
      isPrefNameError || 
      isPrefLanguageError,
    );
    // console.log(isInputErrors);

  }, [
    isPrefNameError,
    isPrefLanguageError,
    isInputErrors,
  ]);

  // Data used on the page. This is the data that will be sent to the update API.
  const [formData, setFormData] = useState({
    PatientID: patientProfile.patientID,
    PreferredLanguageListID: listOfLanguagesPreset.find((item) => item.label === patientProfile.preferredLanguage).value,
    PrefLanguage: patientProfile.preferredLanguage,
    FirstName: patientProfile.firstName,
    LastName: patientProfile.lastName,
    NRIC: patientProfile.nric,
    Address: patientProfile.address,
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

  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (input = null) =>
    (e) => {
      if (input === 'PrefLanguage') {
        setFormData((prevData) => ({
          ...prevData,
          PreferredLanguageListID: e,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          PreferredName: e,
        }));
      }
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

      alertTitle = 'Error in Editing Patient Preferences';
      console.log("result error "+JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
    console.log("formData "+JSON.stringify(formData));
  };

  /* If retrieval from the hook is successful, replace the content in
     listOfLanguages with the retrieved one. */
  useEffect(() => {
    if (!languageLoading && !languageError && languageData) {
      setListOfLanguages(languageData);
      setIsLoading(false);
    }
  }, [languageData, languageError, languageLoading]);

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
                <CommonInputField
                  isRequired
                  title={'Preferred name'}
                  value={formData['PreferredName']}
                  onChangeText={handleFormData('PreferredName')}
                  onChildData={handlePrefNameState}
                />

                <SelectionInputField
                  isRequired
                  title={'Preferred Language'}
                  placeholderText={formData['PrefLanguage']}
                  onDataChange={handleFormData('PrefLanguage')}
                  value={formData['PrefLanguage']}
                  dataArray={listOfLanguages}
                  onChildData={handlePrefLanguageState}
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
