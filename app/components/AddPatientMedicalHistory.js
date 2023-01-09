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

function AddPatientMedicalHistory({ i, title, formData, handleFormData }) {
  const page = 'medicalInfo';
  const medical = formData.medicalInfo[i];

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
        <Select
          placeholder="Select Medical Detail"
          selectedValue={medical.medicalDetails}
          onValueChange={handleFormData(page, 'medicalDetails', i)}
        >
          <Select.Item label="Medical Detail 1" value="1" />
          <Select.Item label="Medical Detail 2" value="2" />
          <Select.Item label="To be updated" value="3" />
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Source of Information</FormControl.Label>
        <Input
          placeholder="Source of Information"
          value={medical.medicalInfo}
          onChangeText={handleFormData(page, 'medicalInfo', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Medical Notes</FormControl.Label>
        <TextArea
          placeholder="Medical Notes (optional)"
          value={medical.medicalNotes}
          onChangeText={handleFormData(page, 'medicalNotes', i)}
        />
      </FormControl>

      <FormControl>
        <HStack />
        <FormControl.Label>Date of Medical Record </FormControl.Label>
        <DateTimePicker
          value={medical.medicalDate}
          onChange={handleFormData(page, 'medicalDate', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientMedicalHistory;
