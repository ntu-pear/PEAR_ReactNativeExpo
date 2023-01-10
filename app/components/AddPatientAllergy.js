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
  const allergy = formData.allergyInfo[i]; //allergyList[0].allergyName

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
          selectedValue={allergy.allergyName}
          onValueChange={handleFormData(page, 'allergyName', i)}
        >
          <Select.Item label="To Be Updated" value="1" />
          <Select.Item label="None" value="2" />
          <Select.Item label="Corn" value="3" />
          <Select.Item label="Eggs" value="4" />
          <Select.Item label="Fish" value="5" />
          <Select.Item label="Meat" value="6" />
          <Select.Item label="Milk" value="7" />
          <Select.Item label="Peanuts" value="8" />
          <Select.Item label="Tree nuts" value="9" />
          <Select.Item label="Shellfish" value="10" />
          <Select.Item label="Soy" value="11" />
          <Select.Item label="Wheat" value="12" />
          <Select.Item label="Seafood" value="13" />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Reaction</FormControl.Label>
        <Input
          placeholder="Allergy Reaction"
          value={allergy.allergyReaction}
          onChangeText={handleFormData(page, 'allergyReaction', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Notes</FormControl.Label>
        <TextArea
          placeholder="Notes (optional)"
          value={allergy.allergyNotes}
          onChangeText={handleFormData(page, 'allergyNotes', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientAllergy;
