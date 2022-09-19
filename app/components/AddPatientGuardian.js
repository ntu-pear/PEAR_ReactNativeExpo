import React from 'react';
import { Box, Input, FormControl, Text, Select, Divider } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientGuardian({ title }) {
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
        <Input placeholder="Guardian Name" />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian NRIC</FormControl.Label>
        <Input placeholder="Guardian NRIC" />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian is Patient's</FormControl.Label>
        <Select placeholder="Select">
          <Select.Item label="Parent" value="parent" />
          <Select.Item label="Child" value="child" />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Handphone No.</FormControl.Label>
        <Input placeholder="Guardian's Handphone Number" />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Home Telephone No.</FormControl.Label>
        <Input placeholder="Guardian's Home Telephone Number" />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian Email </FormControl.Label>
        <Input placeholder="Guardian Email" />
      </FormControl>
    </Box>
  );
}

export default AddPatientGuardian;
