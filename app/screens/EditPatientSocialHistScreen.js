// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList } from 'native-base'

// Configurations
import routes from 'app/navigation/routes';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

//API
import socialHistoryApi from 'app/api/socialHistory';

// Components
import SelectionInputField from 'app/components/SelectionInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';

function EditPatientSocialHistScreen(props) {
  const { navigation, socialHistory } = props.route.params;

  // retrive list data from database using useGetSelectionOptions
  const {
    data: liveWithData,
    isError: liveWithError,
    isLoading: liveWithLoading,
  } = useGetSelectionOptions('livewith');

  const {
    data: educationData,
    isError: educationError,
    isLoading: educationLoading,
  } = useGetSelectionOptions('education');

  const {
    data: occupationData,
    isError: occupationError,
    isLoading: occupationLoading,
  } = useGetSelectionOptions('occupation');

  const {
    data: religionData,
    isError: religionError,
    isLoading: religionLoading,
  } = useGetSelectionOptions('religion');

  const {
    data: petData,
    isError: petError,
    isLoading: petLoading,
  } = useGetSelectionOptions('pet');

  const {
    data: dietData,
    isError: dietError,
    isLoading: dietLoading,
  } = useGetSelectionOptions('diet');

  // set initial value for SelectionInputField dataArray props -> follow format of "label" and "value"
  const [listOfLiveWith, setListOfLiveWith] = useState([
    { value: 1, label: 'Alone' },
    { value: 2, label: 'Children' },
    { value: 3, label: 'Friend' },
    { value: 4, label: 'Relative' },
    { value: 5, label: 'Spouse' },
    { value: 6, label: 'Family' },
    { value: 7, label: 'Parents' },
  ]);

  const [listOfEducation, setListOfEducation] = useState([
    { value: 1, label: 'Primary or lower' },
    { value: 2, label: 'Secondary' },
    { value: 3, label: 'Diploma' },
    { value: 4, label: 'Junior College' },
    { value: 5, label: 'Degree' },
    { value: 6, label: 'Master' },
    { value: 7, label: 'Doctorate' },
    { value: 8, label: 'Vocational' },
    { value: 9, label: 'ITE' },
  ]);

  const [listOfOccupation, setListOfOccupation] = useState([
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
  ]);

  const [listOfReligion, setListOfReligion] = useState([
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
  ]);

  const [listOfPet, setListOfPet] = useState([
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
  ]);

  const [listOfDiet, setListOfDiet] = useState([
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
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEducationError],
  );
  const handleOccupationState = useCallback(
    (state) => {
      setIsOccupationError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOccupationError],
  );
  const handleReligionState = useCallback(
    (state) => {
      setIsReligionError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isReligionError],
  );
  const handlePetState = useCallback(
    (state) => {
      setIsPetError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPetError],
  );
  const handleDietState = useCallback(
    (state) => {
      setIsDietError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDietError],
  );
  const handleExerciseState = useCallback(
    (state) => {
      setIsExerciseError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isExerciseError],
  );
  const handleSexuallyActiveState = useCallback(
    (state) => {
      setIsSexuallyActiveError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSexuallyActiveError],
  );
  const handleDrugUseState = useCallback(
    (state) => {
      setIsDrugUseError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDrugUseError],
  );
  const handleCaffeineUseState = useCallback(
    (state) => {
      setIsCaffeineUseError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCaffeineUseError],
  );
  const handleAlcoholUseState = useCallback(
    (state) => {
      setIsAlcoholUseError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAlcoholUseError],
  );
  const handleTobaccoUseState = useCallback(
    (state) => {
      setIsTobaccoUseError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTobaccoUseError],
  );
  const handleSecondhandSmokerState = useCallback(
    (state) => {
      setIsSecondhandSmokerError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    PatientID: socialHistory.patientId,
    SocialHistoryId: socialHistory.socialHistoryId,
    LiveWithDescription: socialHistory.liveWithDescription,
    LiveWithListId: socialHistory.liveWithListId,
    EducationDescription: socialHistory.educationDescription,
    EducationListId: socialHistory.educationListId,
    OccupationDescription: socialHistory.occupationDescription,
    OccupationListId: socialHistory.occupationListId,
    ReligionDescription: socialHistory.religionDescription,
    ReligionListId: socialHistory.religionListId,
    PetDescription: socialHistory.petDescription,
    PetListId: socialHistory.petListId,
    DietDescription: socialHistory.dietDescription,
    DietListId: socialHistory.dietListId,
    Exercise: socialHistory.exercise,
    SexuallyActive: socialHistory.sexuallyActive,
    DrugUse: socialHistory.drugUse,
    CaffeineUse: socialHistory.caffeineUse,
    AlcoholUse: socialHistory.alcoholUse,
    TobaccoUse: socialHistory.tobaccoUse,
    SecondhandSmoker: socialHistory.secondhandSmoker,
  });

  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (input = null) =>
    (e) => {
      if (input === 'LiveWithDescription') {
        setFormData((previousState) => ({
          ...previousState,
          LiveWithDescription: listOfLiveWith.find((item) => item.value === e).label,
          LiveWithListId: e,
        }));
      } else if (input === 'EducationDescription') {
        setFormData((previousState) => ({
          ...previousState,
          EducationDescription: listOfEducation.find((item) => item.value === e).label,
          EducationListId: e,
        }));
      } else if (input === 'OccupationDescription') {
        setFormData((previousState) => ({
          ...previousState,
          OccupationDescription: listOfOccupation.find((item) => item.value === e).label,
          OccupationListId: e,
        }));
      } else if (input === 'ReligionDescription') {
        setFormData((previousState) => ({
          ...previousState,
          ReligionDescription: listOfReligion.find((item) => item.value === e).label,
          ReligionListId: e,
        }));
      } else if (input === 'PetDescription') {
        setFormData((previousState) => ({
          ...previousState,
          PetDescription: listOfPet.find((item) => item.value === e).label,
          PetListId: e,
        }));
      } else if (input === 'DietDescription') {
        setFormData((previousState) => ({
          ...previousState,
          DietDescription: listOfDiet.find((item) => item.value === e).label,
          DietListId: e,
        }));
      } else {
        setFormData((previousState) => ({
          ...previousState,
          [input]: e,
        }));
      }
    };

  // form submission when save button is pressed
  const submitForm = async () => {
    const result = await socialHistoryApi.updateSocialHistory(formData);

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
    }
    Alert.alert(alertTitle, alertDetails);
    console.log("result error "+JSON.stringify(result));
    console.log("formData "+JSON.stringify(formData));
  };

  /* If retrieval from the hook is successful, replace the content in the list with the retrieved one. */
  useEffect(() => {
    if (!liveWithLoading && !liveWithError && liveWithData) {
      setListOfLiveWith(liveWithData);
    }
  }, [liveWithData, liveWithError, liveWithLoading]);

  useEffect(() => {
    if (!educationLoading && !educationError && educationData) {
      setListOfEducation(educationData);
    }
  }, [educationData, educationError, educationLoading]);
  
  useEffect(() => {
    if (!occupationLoading && !occupationError && occupationData) {
      setListOfOccupation(occupationData);
    }
  }, [occupationData, occupationError, occupationLoading]);

  useEffect(() => {
    if (!religionLoading && !religionError && religionData) {
      setListOfReligion(religionData);
    }
  }, [religionData, religionError, religionLoading]);

  useEffect(() => {
    if (!petLoading && !petError && petData) {
      setListOfPet(petData);
    }
  }, [petData, petError, petLoading]);

  useEffect(() => {
    if (!dietLoading && !dietError && dietData) {
      setListOfDiet(dietData);
    }
  }, [dietData, dietError, dietLoading]);

  return liveWithLoading || educationLoading || occupationLoading || religionLoading || petLoading || dietLoading ? (
    <ActivityIndicator visible />
  ) : (
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
                  placeholderText={formData['LiveWithDescription']}
                  onDataChange={handleFormData('LiveWithDescription')}
                  value={formData['LiveWithListId']}
                  dataArray={listOfLiveWith}
                  onChildData={handleLiveWithState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Education'}
                  placeholderText={formData['EducationDescription']}
                  onDataChange={handleFormData('EducationDescription')}
                  value={formData['EducationListId']}
                  dataArray={listOfEducation}
                  onChildData={handleEducationState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Occupation'}
                  placeholderText={formData['OccupationDescription']}
                  onDataChange={handleFormData('OccupationDescription')}
                  value={formData['OccupationListId']}
                  dataArray={listOfOccupation}
                  onChildData={handleOccupationState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Religion'}
                  placeholderText={formData['ReligionDescription']}
                  onDataChange={handleFormData('ReligionDescription')}
                  value={formData['ReligionListId']}
                  dataArray={listOfReligion}
                  onChildData={handleReligionState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Pet'}
                  placeholderText={formData['PetDescription']}
                  onDataChange={handleFormData('PetDescription')}
                  value={formData['PetListId']}
                  dataArray={listOfPet}
                  onChildData={handlePetState}
                />
                
                <SelectionInputField
                  isRequired
                  title={'Diet'}
                  placeholderText={formData['DietDescription']}
                  onDataChange={handleFormData('DietDescription')}
                  value={formData['DietListId']}
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
                  title={'Alcohol use'}
                  value={formData['AlcoholUse']}
                  onChangeData={handleFormData('AlcoholUse')}
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
