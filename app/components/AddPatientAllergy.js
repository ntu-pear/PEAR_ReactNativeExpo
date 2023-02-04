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

function AddPatientAllergy({ i, title, formData, handleFormData }) {
  const page = 'allergyInfo';
  const allergy = formData.allergyInfo[i]; //allergyInfo[0].allergyName

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
          <Select.Item label="To Be Updated" value={1} />
          <Select.Item label="None" value={2} />
          <Select.Item label="Corn" value={3} />
          <Select.Item label="Eggs" value={4} />
          <Select.Item label="Fish" value={5} />
          <Select.Item label="Meat" value={6} />
          <Select.Item label="Milk" value={7} />
          <Select.Item label="Peanuts" value={8} />
          <Select.Item label="Tree nuts" value={9} />
          <Select.Item label="Shellfish" value={10} />
          <Select.Item label="Soy" value={11} />
          <Select.Item label="Wheat" value={12} />
          <Select.Item label="Seafood" value={13} />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Reaction</FormControl.Label>
        <Select
          placeholder="Select Allergy Reaction"
          selectedValue={allergy.AllergyReactionListID}
          onValueChange={handleFormData(page, 'AllergyReactionListID', i)}
        >
          <Select.Item label="Rashes" value={1} />
          <Select.Item label="Sneezing" value={2} />
          <Select.Item label="Vomitting" value={3} />
          <Select.Item label="Nausea" value={4} />
          <Select.Item label="Swelling" value={5} />
          <Select.Item label="Difficulty Breathing" value={6} />
          <Select.Item label="Diarrhea" value={7} />
          <Select.Item label="Abdominal cramp or pain" value={8} />
          <Select.Item label="Nasal Congestion" value={9} />
          <Select.Item label="Itching" value={10} />
          <Select.Item label="Hives" value={11} />
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
