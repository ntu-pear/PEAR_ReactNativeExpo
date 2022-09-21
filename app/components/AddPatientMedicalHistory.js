import React from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Select,
  Divider,
  TextArea,
  HStack,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientMedicalHistory({ title }) {
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
        Medical History {title}
      </Text>

      <FormControl marginTop={4}>
        <FormControl.Label>Medical Details</FormControl.Label>
        <Select placeholder="Select Medical Detail">
          <Select.Item label="Medical Detail 1" value="1" />
          <Select.Item label="Medical Detail 2" value="2" />
          <Select.Item label="To be updated" value="3" />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Source of Information</FormControl.Label>
        <Input placeholder="Source of Information" />
      </FormControl>

      <FormControl>
        <FormControl.Label>Medical Notes</FormControl.Label>
        <TextArea placeholder="Medical Notes (optional)" />
      </FormControl>

      <FormControl>
        <HStack />
        <FormControl.Label>Date of Medical Record </FormControl.Label>
        <DateTimePicker value={new Date()} />
      </FormControl>
    </Box>
  );
}

export default AddPatientMedicalHistory;
