import React from 'react';
import { Box, Input, FormControl, Text, Select, Divider } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientGuardian({ i, title, formData, handleFormData }) {
  // console.log('GUARDIAN', formData);

  const page = 'guardianList';
  const guardian = formData.guardianList[i]; //guardianList[0].guardianName

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
        Guardian Information {title}
      </Text>

      <FormControl marginTop={4}>
        <FormControl.Label>Guardian Name</FormControl.Label>
        <Input
          placeholder="Guardian Name"
          value={guardian.guardianName}
          onChangeText={handleFormData(page, 'guardianName', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian NRIC</FormControl.Label>
        <Input
          placeholder="Guardian NRIC"
          value={guardian.guardianNric}
          onChangeText={handleFormData(page, 'guardianNric', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian is Patient's</FormControl.Label>
        <Select
          placeholder="Select"
          selectedValue={guardian.guardianPatient}
          onValueChange={handleFormData(page, 'guardianPatient', i)}
        >
          <Select.Item label="Parent" value="parent" />
          <Select.Item label="Child" value="child" />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Handphone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Handphone Number"
          value={guardian.guardianHandphone}
          onChangeText={handleFormData(page, 'guardianHandphone', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Home Telephone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Home Telephone Number (Optional)"
          value={guardian.guardianHomeTel}
          onChangeText={handleFormData(page, 'guardianHomeTel', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian Email </FormControl.Label>
        <Input
          placeholder="Guardian Email"
          value={guardian.guardianEmail}
          onChangeText={handleFormData(page, 'guardianEmail', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientGuardian;
