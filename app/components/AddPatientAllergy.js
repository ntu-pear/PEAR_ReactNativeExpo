// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Box, VStack, Text, Divider } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Utils
import { initSelectDisable, parseSelectOptions } from 'app/utility/miscFunctions';

// Components
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import LoadingWheel from 'app/components/LoadingWheel';
import InputField from './input-components/InputField';

function AddPatientAllergy({ i, title, formData, handleFormData, onError, testID }) {
  const page = 'allergyInfo';
  const allergy = formData[page][i];

  // Variables relatied to retrieving allergy and reaction select options from API
  const { data: allergies, isError: isAllergiesError, isLoading: isAllergiesLoading } = useGetSelectionOptions('Allergy');
  const { data: reactions, isError: isReactionsError, isLoading: isReactionsLoading } = useGetSelectionOptions('AllergyReaction');
 
  // Set initial value for allergies select field
  const [listOfAllergies, setListOfAllergies] = useState(parseSelectOptions([
    'To Be Updated',
    'None',
    'Corn',
    'Eggs',
    'Fish',
    'Meat',
    'Milk',
    'Peanuts',
    'Tree nuts',
    'Shellfish',
    'Soy',
    'Wheat',
    'Seafood',
  ]).filter(x => {return x.value !== 1;})); // remove "t "

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
  
  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);
  
  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isAllergyError, setIsAllergyError] = useState(false);
  const [isReactionError, setIsReactionError] = useState(false);
  const [isRemarksError, setIsRemarksError] = useState(false);  
  
  // Keeps track of which items in the allergy select field are to be disabled
  // If multiple allergies, "None" and any already selected options are disabled 
  const [isDisabledItems, setIsDisabledItems] = useState(initSelectDisable(parseSelectOptions([
    'To Be Updated',
    'None',
    'Corn',
    'Eggs',
    'Fish',
    'Meat',
    'Milk',
    'Peanuts',
    'Tree nuts',
    'Shellfish',
    'Soy',
    'Wheat',
    'Seafood',
  ]).filter(x => {return x.value !== 1;})))

  // Set input errors when there is a change in the error values of child components
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
  
  // Try to get allergy list from backend. If retrieval from the hook is successful, 
  // replace the content in listOfAllergies with the retrieved one
  useEffect(() => {
    if (!isAllergiesLoading && !isAllergiesError && allergies.length > 0) {      
    let tempListOfAllergies = allergies.sort((a,b) => a.value - b.value)
    tempListOfAllergies = tempListOfAllergies.filter(x => {return x.value !== 1;}); // remove "To be updated" option
    setListOfAllergies(tempListOfAllergies);  
    }
  }, [allergies, isAllergiesError, isAllergiesLoading]);  

  // Try to get allergy reaction list from backend. If retrieval from the hook is successful, 
  // replace the content in listOfAllergyReactions with the retrieved one
  useEffect(() => {
    if (!isReactionsLoading && !isReactionsError && reactions) {
      setListOfAllergyReactions(reactions.sort((a,b) => a.value - b.value));
    }
  }, [reactions, isReactionsError, isReactionsLoading]);

  // When allergy id is updated, change allerrgy form data accordingly
  // If "None" selected, reset errors and reset remarks and reactions
  useEffect(() => {
    if (allergy.AllergyListID > 2 && !allergy.AllergyReactionListID) {
      handleFormData('AllergyReactionListID', i)(1);
    } else if (allergy.AllergyListID === 2) {
      handleFormData('AllergyReactionListID', i)(null);
      handleFormData('AllergyRemarks', i)('');
      setIsAllergyError(false);
      setIsReactionError(false);
      setIsRemarksError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergy.AllergyListID]);  
  
  // Update disabled allergy options when change in form data
  // When allergy is added or removed, edit list of allergy options
  // If multiple allergies, "None" option and already selected options are disabled
  useEffect(() => {
    if(formData['allergyInfo'].length > 1) {
      let tempIsDisabledItem = initSelectDisable(listOfAllergies);
      tempIsDisabledItem[2] = true;
      
      const selectedAllergies = formData['allergyInfo'].map(x => x.AllergyListID) 
      for(var j in selectedAllergies) {
        if (j != i) {
          if(selectedAllergies[j] != null) {
            tempIsDisabledItem[selectedAllergies[j]] = true;
          }
        }        
      } 
      setIsDisabledItems(tempIsDisabledItem);
    } else {
      // if only 1 allergy, enable all options
      setIsDisabledItems(initSelectDisable(listOfAllergies));    
    }
  }, [formData])

  
  // Functions for error state reporting for the child components
  const handleAllergyError = useCallback(
    (state) => {
      setIsAllergyError(state);
      // console.log("allergy",stat e)
    },
    [isAllergyError],
  );

  const handleReactionError = useCallback(
    (state) => {
      setIsReactionError(state);
      // console.log("reaction", state);
    },
    [isReactionError],
  );
  
  const handleRemarksError = useCallback(
    (state) => {
      setIsRemarksError(state);
      // console.log("remarks", estat); 
    },
    [isRemarksError],
  );

  return isAllergiesLoading || isReactionsLoading ? (
    <LoadingWheel />
  ) : (
    <Box w="100%">
      <VStack>
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            {title === 1 ? null : <Divider w="80%" mt={10} />}
            <Text
              testID={`${testID}_title`}
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
            testID={`${testID}_AllergyListID`}
            isRequired
            title={'Select Allergy'}
            placeholder={'Select Allergy'}
            onDataChange={handleFormData('AllergyListID', i)}
            value={allergy.AllergyListID}
            dataArray={listOfAllergies}
            onEndEditing={handleAllergyError}
            isDisabledItems={isDisabledItems}
          />
          {allergy.AllergyListID > 2 ? (
            <>
              <SelectionInputField
                testID={`${testID}_ReactionListID`}
                isRequired={allergy.AllergyListID > 2 ? true : false}
                title={'Select Reaction'}
                placeholder={'Select Reaction'}
                onDataChange={handleFormData('AllergyReactionListID', i)}
                value={allergy.AllergyReactionListID}
                dataArray={listOfAllergyReactions}
                onEndEditing={handleReactionError}
              />

              <InputField
                testID={`${testID}_AllergyRemarks`}
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
