import React from 'react';
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

import colors from 'app/config/colors';
import typography from 'app/config/typography';
function AddPatientAllergy({
  i,
  title,
  formData,
  handleFormData,
  errorMessage,
}) {
  const page = 'allergyInfo';
  const allergy = formData.allergyInfo[i]; //allergyInfo[0].allergyName

  const isShown = () => {
    return allergy.AllergyListID == 2 ? false : true;
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
    <Box w="100%">
      <VStack>
        <Center>
          {title == 1 ? null : <Divider w="80%" mt={10} />}

          <Text
            marginTop={6}
            bold
            fontSize="2xl"
            color={colors.green}
            style={styles.text}
          >
            Allergy Information {title}
          </Text>

          <FormControl
            w="80%"
            mt="5"
            isRequired
            isInvalid={[`[${i}].AllergyListID`] in errorMessage}
          >
            <FormControl.Label _text={styles.text}>Allergy </FormControl.Label>
            <Select
              accessibilityLabel="Select Allergy"
              borderRadius="25"
              fontFamily={
                Platform.OS === 'ios' ? typography.ios : typography.android
              }
              height="50"
              minWidth="full"
              minHeight="3%"
              placeholderTextColor={colors.medium}
              size="18"
              placeholder="Select Allergy"
              selectedValue={allergy.AllergyListID}
              onValueChange={handleFormData(page, 'AllergyListID', i)}
            >
              {listOfAllergies.map((item, index) => (
                <Select.Item
                  key={index}
                  label={item.value}
                  value={item.list_AllergyID}
                />
              ))}
            </Select>

            <FormControl.ErrorMessage>
              {errorMessage[`[${i}].AllergyListID`]}
            </FormControl.ErrorMessage>
          </FormControl>

          {isShown() ? (
            <>
              <FormControl
                w="80%"
                mt="5"
                isRequired
                isInvalid={[`[${i}].AllergyReactionListID`] in errorMessage}
              >
                <FormControl.Label _text={styles.text}>
                  Reaction
                </FormControl.Label>
                <Select
                  accessibilityLabel="Select Reaction"
                  borderRadius="25"
                  fontFamily={
                    Platform.OS === 'ios' ? typography.ios : typography.android
                  }
                  height="50"
                  minWidth="full"
                  minHeight="3%"
                  placeholderTextColor={colors.medium}
                  size="18"
                  placeholder={'Select Allergy Reaction'}
                  selectedValue={allergy.AllergyReactionListID}
                  onValueChange={handleFormData(
                    page,
                    'AllergyReactionListID',
                    i,
                  )}
                >
                  {listOfAllergyReactions.map((item, index) => (
                    <Select.Item
                      key={index}
                      label={item.value}
                      value={item.list_AllergyReactionID}
                    />
                  ))}
                </Select>

                <FormControl.ErrorMessage>
                  {errorMessage[`[${i}].AllergyReactionListID`]}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl
                w="80%"
                mt="5 "
                isRequired
                isInvalid={[`[${i}].AllergyRemarks`] in errorMessage}
              >
                <FormControl.Label _text={styles.text}>
                  Remarks
                </FormControl.Label>
                <TextArea
                  borderRadius="25"
                  fontFamily={
                    Platform.OS === 'ios' ? typography.ios : typography.android
                  }
                  height="50"
                  minWidth="full"
                  minHeight="3%"
                  placeholderTextColor={colors.medium}
                  size="18"
                  placeholder={'Remarks'}
                  value={allergy.AllergyRemarks}
                  onChangeText={handleFormData(page, 'AllergyRemarks', i)}
                />
                <FormControl.ErrorMessage>
                  {errorMessage[`[${i}].AllergyRemarks`]}
                </FormControl.ErrorMessage>
              </FormControl>
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
