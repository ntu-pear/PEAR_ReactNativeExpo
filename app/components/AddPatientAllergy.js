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
  const page = 'allergyList';
  const allergy = formData.allergyList[i]; //allergyList[0].allergyName

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
          <Select.Item label="Allergy 1" value="1" />
          <Select.Item label="Allergy 2" value="2" />
          <Select.Item label="To be updated" value="3" />
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
