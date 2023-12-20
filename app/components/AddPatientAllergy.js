// Lib
import React, { useState, useCallback, useEffect } from 'react';
import { Box, VStack, Text, Divider } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import CommonInputField from 'app/components/CommonInputField';
// import SelectionInputField from 'app/components/SelectionInputField';
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import LoadingWheel from 'app/components/LoadingWheel';
import { parseSelectOptions } from 'app/utility/miscFunctions';
import InputField from './input-fields/InputField';

function AddPatientAllergy({ i, title, formData, handleFormData, onError }) {
  const page = 'allergyInfo';
  const allergy = formData[page][i];

  // Variables relatied to retrieving allergy and reaction select options from API
  const { data, isError, isLoading } = useGetSelectionOptions('Allergy');
  const {
    data: reactionData,
    isError: reactionError,
    isLoading: reactionLoading,
  } = useGetSelectionOptions('AllergyReaction');
 
  // Set initial value for allergies select field
  const [listOfAllergies, setListOfAllergies] = useState([
    // { list_AllergyID: 1, value: 'To Be Updated' },
    { value: 2, label: 'None' },
    { value: 3, label: 'Corn' },
    { value: 4, label: 'Eggs' },
    { value: 5, label: 'Fish' },
    { value: 6, label: 'Meat' },
    { value: 7, label: 'Milk' },
    { value: 8, label: 'Peanuts' },
    { value: 9, label: 'Tree nuts' },
    { value: 10, label: 'Shellfish' },
    { value: 11, label: 'Soy' },
    { value: 12, label: 'Wheat' },
    { value: 13, label: 'Seafood' },
  ]);

  // Set initial value for allergy reactions select field
  const [listOfAllergyReactions, setListOfAllergyReactions] = useState(parseSelectOptions([
    'Rashes',
    'Sneezing',
    'Vomitting',
    'Nausea',
    'Swelling',
    'Difficulty Breathing',
    'Diarrhea',
    'Abdominal cramp or pain',
    'Nasal Congestion',
    'Itching',
    'Hives',
  ]));

  const [isErrors, setIsErrors] = useState([false]);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);

  const [allergyOption, setAllergyOption] = useState(allergy.AllergyListID);

  // Functions for error state reporting for the child components
  const handleAllergyError = (e) => {
    setIsAllergyError(e);
    // console.log("allergy", e)
  }

  const handleReactionError = (e) => {
    setIsReactionError(e);
    // console.log("reaction", e);
  }

  const handleRemarksError = (e) => {
    setIsRemarksError(e);
    // console.log("remarks", e);
  }

  useEffect(() => {
    setIsInputErrors (
      isAllergyError ||
      isReactionError ||
      isRemarksError
    )
    onError(i, isInputErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAllergyError,
    isReactionError,
    isRemarksError,
    isInputErrors
  ]);

  // // Add/Remove the states for the additional components reaction and remarks when
  // // they are rendered or de-rendered respectively.
  // useEffect(() => {
  //   if (allergyOption <= 2 && isErrors.length > 1) {
  //     setIsAllergyError(false)
  //     setIsReactionError(false)
  //     setIsRemarksError(false)
  //     handleFormData('AllergyReactionListID', i)(null);
  //     handleFormData('AllergyRemarks', i)('');
  //   }
  //   if (allergyOption > 2 && isErrors.length < 3) {
  //     setIsReactionError(true)
  //     setIsRemarksError(true)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [allergyOption]);

  // allergy  ListID is stored in a state to track it for the useEffect above.
  useEffect(() => {
    if (allergy.AllergyListID > 2 && !allergy.AllergyReactionListID) {
      handleFormData('AllergyReactionListID', i)(1);
    } else if (allergy.AllergyListID === 2) {
      handleFormData('AllergyReactionListID', i)(null);
      handleFormData('AllergyRemarks', i)('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergy.AllergyListID]);

  // Try to get allergy list from backend. If retrieval from the hook is successful, 
  // replace the content in listOfAllergies with the retrieved one
   useEffect(() => {
    if (!isLoading && !isError && data) {
      let allergyData = data.sort((a,b) => a.value - b.value)
      allergyData = allergyData.filter(x => {return x.value !== 1;});
      setListOfAllergies(allergyData); // splice to remove "to be updated" option
    }
  }, [data, isError, isLoading]);

  // Try to get allergy reaction list from backend. If retrieval from the hook is successful, 
  // replace the content in listOfAllergyReactions with the retrieved one
  useEffect(() => {
    if (!reactionLoading && !reactionError && reactionData) {
      setListOfAllergyReactions(reactionData.sort((a,b) => a.value - b.value));
    }
  }, [reactionData, reactionError, reactionLoading]);

  return isLoading || reactionLoading ? (
    <LoadingWheel />
  ) : (
    <Box w="100%">
      <VStack>
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            {title === 1 ? null : <Divider w="80%" mt={10} />}
            <Text
              marginTop={6}
              bold
              fontSize="2xl"
              color={colors.green}
              style={styles.text}
            >
              Allergy Information {title}
            </Text>
          </View>
          <SelectionInputField
            isRequired
            title={'Select Allergy'}
            placeholder={'Select Allergy'}
            onDataChange={handleFormData('AllergyListID', i)}
            value={allergy.AllergyListID}
            dataArray={listOfAllergies}
            onEndEditing={handleAllergyError}
          />
          {allergy.AllergyListID > 2 ? (
            <>
              <SelectionInputField
                isRequired={allergy.AllergyListID > 2 ? true : false}
                title={'Select Reaction'}
                placeholder={'Select Reaction'}
                onDataChange={handleFormData('AllergyReactionListID', i)}
                value={allergy.AllergyReactionListID}
                dataArray={listOfAllergyReactions}
                onEndEditing={handleReactionError}
              />

              <InputField
                isRequired={allergy.AllergyListID > 2 ? true : false}
                title={'Remarks'}
                value={allergy.AllergyRemarks}
                onChangeText={handleFormData('AllergyRemarks', i)}
                variant={'multiLine'}
                onEndEditing={handleRemarksError}
              />
            </>
          ) : (
            <View style={{backgroundColor: "black", height: 20}}/>

          )}
        </View>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
});

export default AddPatientAllergy;
