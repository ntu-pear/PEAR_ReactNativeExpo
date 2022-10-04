import React, { useState } from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Button,
  Radio,
  HStack,
  Select,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ScrollView } from 'react-native';
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import colors from 'app/config/colors';

export function PatientAddPatientInfoScreen(props) {
  const { nextQuestionHandler } = props;

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={20} />
          <Text
            textAlign="center"
            marginTop={6}
            bold
            fontSize="2xl"
            color={colors.green}
          >
            Patient Information
          </Text>

          <FormControl marginTop={4}>
            <FormControl.Label>First Name</FormControl.Label>
            <Input placeholder="First Name" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Last Name</FormControl.Label>
            <Input placeholder="Last Name" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Name</FormControl.Label>
            <Input placeholder="Preferred Name" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Language</FormControl.Label>
            <Select placeholder="Select Language">
              <Select.Item label="English" value="1" />
              <Select.Item label="Chinese" value="2" />
              <Select.Item label="Malay" value="3" />
              <Select.Item label="Tamil" value="3" />
            </Select>
          </FormControl>

          <FormControl>
            <FormControl.Label>NRIC</FormControl.Label>
            <Input placeholder="NRIC" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Address</FormControl.Label>
            <Input placeholder="Address" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Home Telephone No.</FormControl.Label>
            <Input placeholder="Home Telephone Number (Optional)" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Handphone No.</FormControl.Label>
            <Input placeholder="Handphone Number (Optional)" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Gender </FormControl.Label>
            <Radio.Group defaultValue="1">
              <HStack space={4}>
                <Radio value="1" size="sm">
                  Male
                </Radio>
                <Radio value="2" size="sm">
                  Female
                </Radio>
              </HStack>
            </Radio.Group>
          </FormControl>

          {/* Reference: https://github.com/react-native-datetimepicker/datetimepicker
          TODO: Align to the left*/}
          <FormControl>
            <HStack />
            <FormControl.Label>Date of Birth </FormControl.Label>
            <DateTimePicker value={new Date()} />
          </FormControl>

          <FormControl>
            <HStack />
            <FormControl.Label>Date of Joining </FormControl.Label>
            <DateTimePicker value={new Date()} />
          </FormControl>

          <FormControl>
            <HStack />
            <FormControl.Label>Date of Leaving (Optional) </FormControl.Label>
            <DateTimePicker value={new Date()} />
          </FormControl>
        </Box>
        <AddPatientBottomButtons nextQuestionHandler={nextQuestionHandler} />
      </Box>
    </ScrollView>
  );
}
