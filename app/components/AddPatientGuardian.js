import React from 'react';
import { Box, Input, FormControl, Text, Select, Divider } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientGuardian({ i, title, formData, handleFormData }) {
  // console.log('GUARDIAN', formData);

  const page = 'guardianInfo';
  const guardian = formData.guardianInfo[i]; //guardianInfo[0].firstName

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
        <FormControl.Label>Guardian First Name</FormControl.Label>
        <Input
          placeholder="Guardian First Name"
          value={guardian.FirstName}
          onChangeText={handleFormData(page, 'FirstName', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian Last Name</FormControl.Label>
        <Input
          placeholder="Guardian Last Name"
          value={guardian.LastName}
          onChangeText={handleFormData(page, 'LastName', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian NRIC</FormControl.Label>
        <Input
          placeholder="Guardian NRIC"
          value={guardian.NRIC}
          onChangeText={handleFormData(page, 'NRIC', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian is Patient's</FormControl.Label>
        <Select
          placeholder="Select"
          selectedValue={guardian.RelationshipID}
          onValueChange={handleFormData(page, 'RelationshipID', i)}
        >
          <Select.Item label="Husband" value={1} />
          <Select.Item label="Wife" value={2} />
          <Select.Item label="Child" value={3} />
          <Select.Item label="Parent" value={4} />
          <Select.Item label="Sibling" value={5} />
          <Select.Item label="Grandchild" value={6} />
          <Select.Item label="Friend" value={7} />
          <Select.Item label="Nephew" value={8} />
          <Select.Item label="Niece" value={9} />
          <Select.Item label="Aunt" value={10} />
          <Select.Item label="Uncle" value={11} />
          <Select.Item label="Grandparent" value={12} />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Handphone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Handphone Number"
          value={guardian.ContactNo}
          onChangeText={handleFormData(page, 'ContactNo', i)}
        />
      </FormControl>

      {/* <FormControl>
        <FormControl.Label>Guardian's Home Telephone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Home Telephone Number (Optional)"
          value={guardian.guardianHomeTel}
          onChangeText={handleFormData(page, 'guardianHomeTel', i)}
        />
      </FormControl> */}

      <FormControl>
        <FormControl.Label>Guardian Email </FormControl.Label>
        <Input
          placeholder="Guardian Email"
          value={guardian.Email}
          onChangeText={handleFormData(page, 'Email', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientGuardian;
