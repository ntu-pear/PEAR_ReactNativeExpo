// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Components
import SelectionInputField from 'app/components/SelectionInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import AppButton from 'app/components/AppButton';

function EditPatientSocialHistScreen(props) {
  const { displayData } = props.route.params;
  const socialHistDictionary = displayData.reduce((dict, item) => {
    dict[item.label] = item.value;
    return dict;
  }, {});

  // constant values
  const listOfLiveWith = [
    { value: 1, label: 'Alone' },
    { value: 2, label: 'Children' },
    { value: 3, label: 'Friend' },
    { value: 4, label: 'Relative' },
    { value: 5, label: 'Spouse' },
    { value: 6, label: 'Family' },
    { value: 7, label: 'Parents' },
  ];

  const listOfEducation = [
    { value: 1, label: 'Primary or lower' },
    { value: 2, label: 'Secondary' },
    { value: 3, label: 'Diploma' },
    { value: 4, label: 'Junior College' },
    { value: 5, label: 'Degree' },
    { value: 6, label: 'Master' },
    { value: 7, label: 'Doctorate' },
    { value: 8, label: 'Vocational' },
    { value: 9, label: 'ITE' },
  ];

  const listOfOccupation = [
    { value: 1, label: 'Accountant' },
    { value: 2, label: 'Business owner' },
    { value: 3, label: 'Chef/Cook' },
    { value: 4, label: 'Cleaner' },
    { value: 5, label: 'Clerk' },
    { value: 6, label: 'Dentist' },
    { value: 7, label: 'Doctor' },
    { value: 8, label: 'Driver' },
    { value: 9, label: 'Engineer' },
    { value: 10, label: 'Fireman' },
    { value: 11, label: 'Gardener' },
    { value: 12, label: 'Hawker' },
    { value: 13, label: 'Homemaker' },
    { value: 14, label: 'Housekeeper' },
    { value: 15, label: 'Labourer' },
    { value: 16, label: 'Lawyer' },
    { value: 17, label: 'Manager' },
    { value: 18, label: 'Mechanic' },
    { value: 19, label: 'Nurse' },
    { value: 20, label: 'Professional sportsperson' },
    { value: 21, label: 'Receptionist' },
    { value: 22, label: 'Sales person' },
    { value: 23, label: 'Secretary' },
    { value: 24, label: 'Security guard' },
    { value: 25, label: 'Teacher' },
    { value: 26, label: 'Trader' },
    { value: 27, label: 'Unemployed' },
    { value: 28, label: 'Vet' },
    { value: 29, label: 'Waiter' },
    { value: 30, label: 'Zoo keeper' },
    { value: 31, label: 'Artist' },
    { value: 32, label: 'Scientist' },
    { value: 33, label: 'Singer' },
    { value: 34, label: 'Policeman' },
    { value: 35, label: 'Actor' },
    { value: 36, label: 'Professor' },
    { value: 37, label: 'Florist' },
  ];

  const listOfReligion = [
    { value: 1, label: 'Atheist' },
    { value: 2, label: 'Buddhist' },
    { value: 3, label: 'Catholic' },
    { value: 4, label: 'Christian' },
    { value: 5, label: 'Free Thinker' },
    { value: 6, label: 'Hindu' },
    { value: 7, label: 'Islam' },
    { value: 8, label: 'Taoist' },
    { value: 9, label: 'Shintoist' },
    { value: 10, label: 'Sikhism' },
    { value: 11, label: 'Shinto' },
    { value: 12, label: 'Spiritism' },
    { value: 13, label: 'Judaism' },
    { value: 14, label: 'Confucianism' },
    { value: 15, label: 'Protestantism' },
  ];

  const listOfPet = [
    { value: 1, label: 'Bird' },
    { value: 2, label: 'Cat' },
    { value: 3, label: 'Dog' },
    { value: 4, label: 'Fish' },
    { value: 5, label: 'Hamster' },
    { value: 6, label: 'Rabbit' },
    { value: 7, label: 'Guinea Pig' },
    { value: 8, label: 'Hedgehog' },
    { value: 9, label: 'Tortoise' },
    { value: 10, label: 'Spider' },
    { value: 11, label: 'Unicorn' },
  ];

  const listOfDiet = [
    { value: 1, label: 'Diabetic' },
    { value: 2, label: 'Halal' },
    { value: 3, label: 'Vegan' },
    { value: 4, label: 'Vegetarian' },
    { value: 5, label: 'Gluten-free' },
    { value: 6, label: 'Soft food' },
    { value: 7, label: 'No Cheese' },
    { value: 8, label: 'No Peanuts' },
    { value: 9, label: 'No Seafood' },
    { value: 10, label: 'No Vegetables' },
    { value: 11, label: 'No Meat' },
    { value: 12, label: 'No Dairy' },
  ];

  const listYesNo = [
    { value: 0, label: 'No' },
    { value: 1, label: 'Yes' },
  ]

  const [isInputErrors, setIsInputErrors] = useState(false);

  const [isLiveWithError, setIsLiveWithError] = useState(false);
  const [isEducationError, setIsEducationError] = useState(false);
  const [isOccupationError, setIsOccupationError] = useState(false);
  const [isReligionError, setIsReligionError] = useState(false);
  const [isPetError, setIsPetError] = useState(false);
  const [isDietError, setIsDietError] = useState(false);
  const [isExerciseError, setIsExerciseError] = useState(false);
  const [isSexuallyActiveError, setIsSexuallyActiveError] = useState(false);
  const [isDrugUseError, setIsDrugUseError] = useState(false);
  const [isCaffeineUseError, setIsCaffeineUseError] = useState(false);
  const [isAlcoholUseError, setIsAlcoholUseError] = useState(false);
  const [isTobaccoUseError, setIsTobaccoUseError] = useState(false);
  const [isSecondhandSmokerError, setIsSecondhandSmokerError] = useState(false);

  const handleLiveWithState = useCallback(
    (state) => {
      setIsLiveWithError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLiveWithError],
  );
  const handleEducationState = useCallback(
    (state) => {
      setIsEducationError(state);
    },
    [isEducationError],
  );
  const handleOccupationState = useCallback(
    (state) => {
      setIsOccupationError(state);
    },
    [isOccupationError],
  );
  const handleReligionState = useCallback(
    (state) => {
      setIsReligionError(state);
    },
    [isReligionError],
  );
  const handlePetState = useCallback(
    (state) => {
      setIsPetError(state);
    },
    [isPetError],
  );
  const handleDietState = useCallback(
    (state) => {
      setIsDietError(state);
    },
    [isDietError],
  );
  const handleExerciseState = useCallback(
    (state) => {
      setIsExerciseError(state);
    },
    [isExerciseError],
  );
  const handleSexuallyActiveState = useCallback(
    (state) => {
      setIsSexuallyActiveError(state);
    },
    [isSexuallyActiveError],
  );
  const handleDrugUseState = useCallback(
    (state) => {
      setIsDrugUseError(state);
    },
    [isDrugUseError],
  );
  const handleCaffeineUseState = useCallback(
    (state) => {
      setIsCaffeineUseError(state);
    },
    [isCaffeineUseError],
  );
  const handleAlcoholUseState = useCallback(
    (state) => {
      setIsAlcoholUseError(state);
    },
    [isAlcoholUseError],
  );
  const handleTobaccoUseState = useCallback(
    (state) => {
      setIsTobaccoUseError(state);
    },
    [isTobaccoUseError],
  );
  const handleSecondhandSmokerState = useCallback(
    (state) => {
      setIsSecondhandSmokerError(state);
    },
    [isSecondhandSmokerError],
  );

  useEffect(() => {
    setIsInputErrors(
      isLiveWithError ||
      isEducationError ||
      isOccupationError ||
      isReligionError ||
      isPetError ||
      isDietError ||
      isExerciseError ||
      isSexuallyActiveError ||
      isDrugUseError ||
      isCaffeineUseError ||
      isAlcoholUseError ||
      isTobaccoUseError ||
      isSecondhandSmokerError,
    );
    // console.log(isInputErrors);
  }, [
    isLiveWithError,
    isEducationError,
    isOccupationError,
    isReligionError,
    isPetError,
    isDietError,
    isExerciseError,
    isSexuallyActiveError,
    isDrugUseError,
    isCaffeineUseError,
    isAlcoholUseError,
    isTobaccoUseError,
    isSecondhandSmokerError,
    isInputErrors,
  ]);
  
  const [formData, setFormData] = useState({
    LiveWith: socialHistDictionary['Live with'],
    LiveWithID: listOfLiveWith.find((item) => item.label === socialHistDictionary['Live with']).value, // convert label to value
    Education: socialHistDictionary['Education'],
    EducationID: listOfEducation.find((item) => item.label === socialHistDictionary['Education']).value,
    Occupation: socialHistDictionary['Occupation'],
    OccupationID: listOfOccupation.find((item) => item.label === socialHistDictionary['Occupation']).value,
    Religion: socialHistDictionary['Religion'],
    ReligionID: listOfReligion.find((item) => item.label === socialHistDictionary['Religion']).value,
    Pet: socialHistDictionary['Pet'],
    PetID: listOfPet.find((item) => item.label === socialHistDictionary['Pet']).value,
    Diet: socialHistDictionary['Diet'],
    DietID: listOfDiet.find((item) => item.label === socialHistDictionary['Diet']).value,
    Exercise: socialHistDictionary['Exercise'],
    SexuallyActive: socialHistDictionary['Sexually active'],
    DrugUse: socialHistDictionary['Drug use'],
    CaffeineUse: socialHistDictionary['Caffeine use'],
    AlocholUse: socialHistDictionary['Alochol use'],
    TobaccoUse: socialHistDictionary['Tobacco use'],
    SecondhandSmoker: socialHistDictionary['Secondhand smoker'],
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
      if (input === 'LiveWith') {
        newData['LiveWith'] = listOfLiveWith.find((item) => item.value === e).label;
        newData['LiveWithID'] = e.toString();
      } else if (input === 'Education') {
        newData['Education'] = listOfEducation.find((item) => item.value === e).label;
        newData['EducationID'] = e.toString();
      } else if (input === 'Occupation') {
        newData['Occupation'] = listOfOccupation.find((item) => item.value === e).label;
        newData['OccupationID'] = e.toString();
      } else if (input === 'Religion') {
        newData['Religion'] = listOfReligion.find((item) => item.value === e).label;
        newData['ReligionID'] = e.toString();
      } else if (input === 'Pet') {
        newData['Pet'] = listOfPet.find((item) => item.value === e).label;
        newData['PetID'] = e.toString();
      } else if (input === 'Diet') {
        newData['Diet'] = listOfDiet.find((item) => item.value === e).label;
        newData['DietID'] = e.toString();
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
                <SelectionInputField
                  isRequired
                  title={'Live with'}
                  placeholderText={socialHistDictionary['Live with']}
                  onDataChange={handleFormData('LiveWith')}
                  value={formData['LiveWithID']}
                  dataArray={listOfLiveWith}
                  onChildData={handleLiveWithState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Education'}
                  placeholderText={socialHistDictionary['Education']}
                  onDataChange={handleFormData('Education')}
                  value={formData['EducationID']}
                  dataArray={listOfEducation}
                  onChildData={handleEducationState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Occupation'}
                  placeholderText={socialHistDictionary['Occupation']}
                  onDataChange={handleFormData('Occupation')}
                  value={formData['OccupationID']}
                  dataArray={listOfOccupation}
                  onChildData={handleOccupationState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Religion'}
                  placeholderText={socialHistDictionary['Religion']}
                  onDataChange={handleFormData('Religion')}
                  value={formData['ReligionID']}
                  dataArray={listOfReligion}
                  onChildData={handleReligionState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Pet'}
                  placeholderText={socialHistDictionary['Pet']}
                  onDataChange={handleFormData('Pet')}
                  value={formData['PetID']}
                  dataArray={listOfPet}
                  onChildData={handlePetState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Diet'}
                  placeholderText={socialHistDictionary['Diet']}
                  onDataChange={handleFormData('Diet')}
                  value={formData['DietID']}
                  dataArray={listOfDiet}
                  onChildData={handleDietState}
                />

                <RadioButtonInput
                  isRequired
                  title={'Exercise'}
                  value={formData['Exercise']}
                  onChangeData={handleFormData('Exercise')}
                  onChildData={handleExerciseState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Sexually active'}
                  value={formData['SexuallyActive']}
                  onChangeData={handleFormData('SexuallyActive')}
                  onChildData={handleSexuallyActiveState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Drug use'}
                  value={formData['DrugUse']}
                  onChangeData={handleFormData('DrugUse')}
                  onChildData={handleDrugUseState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Caffeine use'}
                  value={formData['CaffeineUse']}
                  onChangeData={handleFormData('CaffeineUse')}
                  onChildData={handleCaffeineUseState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Alochol use'}
                  value={formData['AlocholUse']}
                  onChangeData={handleFormData('AlocholUse')}
                  onChildData={handleAlcoholUseState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Tobacco use'}
                  value={formData['TobaccoUse']}
                  onChangeData={handleFormData('TobaccoUse')}
                  onChildData={handleTobaccoUseState}
                  dataArray={listYesNo}
                />

                <RadioButtonInput
                  isRequired
                  title={'Secondhand smoker'}
                  value={formData['SecondhandSmoker']}
                  onChangeData={handleFormData('SecondhandSmoker')}
                  onChildData={handleSecondhandSmokerState}
                  dataArray={listYesNo}
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

EditPatientSocialHistScreen.defaultProps = {
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

export default EditPatientSocialHistScreen;
