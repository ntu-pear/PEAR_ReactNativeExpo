// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

//Components
import CommonInputField from 'app/components/CommonInputField';
import AppButton from 'app/components/AppButton';
import SelectionInputField from 'app/components/SelectionInputField';

function EditPatientPreferencesScreen(props) {
  const { displayData } = props.route.params;
  const prefDictionary = displayData.reduce((dict, item) => {
    dict[item.label] = item.value;
    return dict;
  }, {});

  // error state for component
  const [isInputErrors, setIsInputErrors] = useState(false);

  // error states for child components
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isPrefLanguageError, setIsPrefLanguageError] = useState(false);

  // Use for the SelectionInputField dataArray prop -> follow format of "label" and "value"
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

  const [formData, setFormData] = useState({
    PreferredName: prefDictionary['Preferred name'],
    PrefLanguage: prefDictionary['Preferred language'],
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
      newData[input] = date
        ? date
        : e.$d //e['$d']-check if input from MUI date-picker
        ? e.$d
        : parseInt(e) // check if integer (for dropdown)
        ? parseInt(e) // change to integer
        : e; // eg. guardianInfo[0].FirstName = e

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
                  placeholderText={prefDictionary['Preferred language']}
                  onDataChange={handleFormData('PrefLanguage')}
                  value={formData['PrefLanguage']}
                  dataArray={listOfLanguages}
                  onChildData={handlePrefLanguageState}
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
