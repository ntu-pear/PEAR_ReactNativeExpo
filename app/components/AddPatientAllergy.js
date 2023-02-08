import React, { useState, useEffect } from 'react';
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
import listApi from 'app/api/lists';

function AddPatientAllergy({ i, title, formData, handleFormData }) {
  const [listOfAllergies, setListOfAllergies] = useState([]);
  const [listOfAllergyReactions, setListOfAllergyReactions] = useState([]);

  const page = 'allergyInfo';
  const allergy = formData.allergyInfo[i]; //allergyInfo[0].allergyName

  const getAllergyList = async () => {
    const response = await listApi.getAllergyList();
    if (!response.ok) {
      console.log('An error occured when getting list of allergies', response);
      return;
    }
    setListOfAllergies(response.data);
  };

  const getAllergyReactionList = async () => {
    const response = await listApi.getAllergyReactionList();
    if (!response.ok) {
      console.log(
        'An error occured when getting list of allergy reactions',
        response,
      );
      return;
    }
    console.log(response.data);
    setListOfAllergyReactions(response.data);
  };

  useEffect(() => {
    // Fetches data from highlights api
    console.log('Calling API');
    getAllergyList();
    getAllergyReactionList();
  }, []);

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
            <Select.Item label={item.value} value={item.list_AllergyID} />
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Reaction</FormControl.Label>
        <Select
          placeholder="Select Allergy Reaction"
          selectedValue={allergy.AllergyReactionListID}
          onValueChange={handleFormData(page, 'AllergyReactionListID', i)}
        >
          {listOfAllergyReactions.map((item) => (
            <Select.Item
              label={item.value}
              value={item.list_AllergyReactionID}
            />
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Remarks</FormControl.Label>
        <TextArea
          placeholder="Remarks (optional)"
          value={allergy.AllergyRemarks}
          onChangeText={handleFormData(page, 'AllergyRemarks', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientAllergy;
