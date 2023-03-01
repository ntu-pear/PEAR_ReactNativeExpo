import React from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Select,
  Divider,
  TextArea,
} from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import ErrorMessage from 'app/components/ErrorMessage';

function AddPatientAllergy({
  i,
  title,
  formData,
  handleFormData,
  errorMessage,
}) {
  const page = 'allergyInfo';
  const allergy = formData.allergyInfo[i]; //allergyInfo[0].allergyName

  const isDisabled = () => {
    return allergy.AllergyListID == 2 ? true : false;
  };

  // constant values for list of allergies
  const listOfAllergies = [
    // { list_AllergyID: 1, value: 'To Be Updated' },
    { list_AllergyID: 2, value: 'None' },
    { list_AllergyID: 3, value: 'Corn' },
    { list_AllergyID: 4, value: 'Eggs' },
    { list_AllergyID: 5, value: 'Fish' },
    { list_AllergyID: 6, value: 'Meat' },
    { list_AllergyID: 7, value: 'Milk' },
    { list_AllergyID: 8, value: 'Peanuts' },
    { list_AllergyID: 9, value: 'Tree nuts' },
    { list_AllergyID: 10, value: 'Shellfish' },
    { list_AllergyID: 11, value: 'Soy' },
    { list_AllergyID: 12, value: 'Wheat' },
    { list_AllergyID: 13, value: 'Seafood' },
  ];

  // constant values for list of allergy reactions
  const listOfAllergyReactions = [
    { list_AllergyReactionID: 1, value: 'Rashes' },
    { list_AllergyReactionID: 2, value: 'Sneezing' },
    { list_AllergyReactionID: 3, value: 'Vomitting' },
    { list_AllergyReactionID: 4, value: 'Nausea' },
    { list_AllergyReactionID: 5, value: 'Swelling' },
    { list_AllergyReactionID: 6, value: 'Difficulty Breathing' },
    { list_AllergyReactionID: 7, value: 'Diarrhea' },
    { list_AllergyReactionID: 8, value: 'Abdominal cramp or pain' },
    { list_AllergyReactionID: 9, value: 'Nasal Congestion' },
    { list_AllergyReactionID: 10, value: 'Itching' },
    { list_AllergyReactionID: 11, value: 'Hives' },
  ];

  return (
    <Box>
      {title == 1 ? null : <Divider mt={10} />}

      <Text
        textAlign="center"
        marginTop={6}
        bold
        fontSize="2xl"
        color={colors.green}
      >
        Allergy {title}
      </Text>

      <FormControl marginTop={4}>
        <FormControl.Label>Allergy</FormControl.Label>
        <Select
          placeholder="Select Allergy"
          selectedValue={allergy.AllergyListID}
          onValueChange={handleFormData(page, 'AllergyListID', i)}
        >
          {listOfAllergies.map((item) => (
            <Select.Item
              key={item}
              label={item.value}
              value={item.list_AllergyID}
            />
          ))}
        </Select>
      </FormControl>
      {errorMessage[`[${i}].AllergyListID`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].AllergyListID`]} />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Reaction</FormControl.Label>
        <Select
          placeholder={'Select Allergy Reaction'}
          selectedValue={allergy.AllergyReactionListID}
          onValueChange={handleFormData(page, 'AllergyReactionListID', i)}
          isDisabled={isDisabled()}
        >
          {listOfAllergyReactions.map((item) => (
            <Select.Item
              key={item}
              label={item.value}
              value={item.list_AllergyReactionID}
            />
          ))}
        </Select>
      </FormControl>
      {errorMessage[`[${i}].AllergyReactionListID`] ? (
        <ErrorMessage
          visible
          message={errorMessage[`[${i}].AllergyReactionListID`]}
        />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Remarks</FormControl.Label>
        <TextArea
          placeholder={'Remarks'}
          value={allergy.AllergyRemarks}
          onChangeText={handleFormData(page, 'AllergyRemarks', i)}
          isDisabled={isDisabled()}
        />
      </FormControl>
      {errorMessage[`[${i}].AllergyRemarks`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].AllergyRemarks`]} />
      ) : (
        <></>
      )}
    </Box>
  );
}

export default AddPatientAllergy;
