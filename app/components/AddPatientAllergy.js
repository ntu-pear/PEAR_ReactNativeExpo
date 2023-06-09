// Lib
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  Center,
  FormControl,
  Text,
  Select,
  Divider,
  TextArea,
} from 'native-base';
import { StyleSheet, Platform } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import CommonInputField from 'app/components/CommonInputField';
import SelectionInputField from 'app/components/SelectionInputField';

function AddPatientAllergy({ i, title, formData, handleFormData, onError }) {
  const page = 'allergyInfo';
  const allergy = formData.allergyInfo[i]; //allergyInfo[0].allergyName
  const [isErrors, setIsErrors] = useState([false]);
  const [allergyOption, setAllergyOption] = useState(allergy.AllergyListID);

  // constant values for list of allergies
  const listOfAllergies = [
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
  ];

  // constant values for list of allergy reactions
  const listOfAllergyReactions = [
    { value: 1, label: 'Rashes' },
    { value: 2, label: 'Sneezing' },
    { value: 3, label: 'Vomitting' },
    { value: 4, label: 'Nausea' },
    { value: 5, label: 'Swelling' },
    { value: 6, label: 'Difficulty Breathing' },
    { value: 7, label: 'Diarrhea' },
    { value: 8, label: 'Abdominal cramp or pain' },
    { value: 9, label: 'Nasal Congestion' },
    { value: 10, label: 'Itching' },
    { value: 11, label: 'Hives' },
  ];

  const handleAllergyState = useCallback(
    (state) => {
      setIsErrors((prevErrorStates) => {
        const updatedErrorStates = [...prevErrorStates];
        updatedErrorStates[0] = state;
        return updatedErrorStates;
      });
    },

    [],
  );
  const handleReactionState = useCallback(
    (state) => {
      setIsErrors((prevErrorStates) => {
        const updatedErrorStates = [...prevErrorStates];
        updatedErrorStates[1] = state;
        return updatedErrorStates;
      });
    },

    [],
  );
  const handleRemarksState = useCallback(
    (state) => {
      setIsErrors((prevErrorStates) => {
        const updatedErrorStates = [...prevErrorStates];
        updatedErrorStates[2] = state;
        return updatedErrorStates;
      });
    },

    [],
  );
  // parent callback function to enable editing of the errorStates array tracked by
  // the parent
  useEffect(() => {
    onError(i, isErrors.includes(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isErrors]);

  // Add/Remove the states for the additional components reaction and remarks when
  // they are rendered or de-rendered respectively.
  useEffect(() => {
    if (allergyOption <= 2 && isErrors.length > 1) {
      const errorList = [...isErrors];
      // Remove the last 2 elements corresponding to reactions and remarks fields
      let updatedErrors = errorList.slice(0, -2);
      setIsErrors(updatedErrors);
      handleFormData(page, 'AllergyReactionListID', i)(null);
      handleFormData(page, 'AllergyRemarks', i)('');
    }
    if (allergyOption > 2 && isErrors.length < 3) {
      const newStates = [true, true];
      setIsErrors([...isErrors, ...newStates]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergyOption]);

  // allergyListID is stored in a state to track it for the useEffect above.
  useEffect(() => {
    setAllergyOption(allergy.AllergyListID);
    if (allergyOption > 2 && allergy.AllergyReactionListID === null) {
      handleFormData(page, 'AllergyReactionListID', i)(1);
    } else if (allergyOption === 2) {
      handleFormData(page, 'AllergyReactionListID', i)(null);
      handleFormData(page, 'AllergyRemarks', i)('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergy.AllergyListID, allergyOption]);

  return (
    <Box w="100%">
      <VStack>
        <Center>
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

          <SelectionInputField
            isRequired
            title={'Select Allergy'}
            placeholderText={'Select Allergy'}
            onDataChange={handleFormData(page, 'AllergyListID', i)}
            value={allergy.AllergyListID}
            dataArray={listOfAllergies}
            onChildData={handleAllergyState}
          />
          {/* When Allergy is not "None" show the rest of the form*/}
          {allergy.AllergyListID > 2 ? (
            <>
              <SelectionInputField
                isRequired={allergy.AllergyListID > 2 ? true : false}
                title={'Select Reaction'}
                placeholderText={'Select Reaction'}
                onDataChange={handleFormData(page, 'AllergyReactionListID', i)}
                value={allergy.AllergyReactionListID}
                dataArray={listOfAllergyReactions}
                onChildData={handleReactionState}
              />

              <CommonInputField
                isRequired={allergy.AllergyListID > 2 ? true : false}
                title={'Remarks'}
                value={allergy.AllergyRemarks}
                onChangeText={handleFormData(page, 'AllergyRemarks', i)}
                variant={'multiLine'}
                onChildData={handleRemarksState}
              />
            </>
          ) : (
            <></>
          )}
        </Center>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
});

export default AddPatientAllergy;
