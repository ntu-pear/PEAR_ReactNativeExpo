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
  const { nextQuestionHandler, handleFormData, formData } = props;
  // console.log('PATIENT', formData);

  const page = 'patientList';
  // const [error, setError] = useState(false);

  // const submitFormData = (e) => {
  //   e.preventDefault();

  //   // checking if value of first name and last name is empty show error else take to step 2
  //   if (
  //     validator.isEmpty(values.firstName) ||
  //     validator.isEmpty(values.lastName)
  //   ) {
  //     setError(true);
  //   } else {
  //     nextQuestionHandler();
  //   }
  // };
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
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={handleFormData(page, 'firstName')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Last Name</FormControl.Label>
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={handleFormData(page, 'lastName')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Name</FormControl.Label>
            <Input
              placeholder="Preferred Name"
              value={formData.preferredName}
              onChangeText={handleFormData(page, 'preferredName')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Language</FormControl.Label>
            <Select
              placeholder="Select Language"
              selectedValue={formData.preferredLanguage}
              onValueChange={handleFormData(page, 'preferredLanguage')}
            >
              <Select.Item label="English" value="English" />
              <Select.Item label="Chinese" value="Chinese" />
              <Select.Item label="Malay" value="Malay" />
              <Select.Item label="Tamil" value="Tamil" />
            </Select>
          </FormControl>

          <FormControl>
            <FormControl.Label>NRIC</FormControl.Label>
            <Input
              placeholder="NRIC"
              value={formData.nric}
              onChangeText={handleFormData(page, 'nric')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Address</FormControl.Label>
            <Input
              placeholder="Address"
              value={formData.address}
              onChangeText={handleFormData(page, 'address')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Home Telephone No.</FormControl.Label>
            <Input
              placeholder="Home Telephone Number (Optional)"
              value={formData.homeTel}
              onChangeText={handleFormData(page, 'homeTel')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Handphone No.</FormControl.Label>
            <Input
              placeholder="Handphone Number (Optional)"
              value={formData.handphone}
              onChangeText={handleFormData(page, 'handphone')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Gender </FormControl.Label>
            <Radio.Group
              value={formData.gender}
              onChange={handleFormData(page, 'gender')}
            >
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
            <DateTimePicker
              value={formData.dob}
              onChange={handleFormData(page, 'dob')}
            />
          </FormControl>

          <FormControl>
            <HStack />
            <FormControl.Label>Date of Joining </FormControl.Label>
            <DateTimePicker
              value={formData.doj}
              onChange={handleFormData(page, 'doj')}
            />
          </FormControl>

          <FormControl>
            <HStack />
            <FormControl.Label>Date of Leaving (Optional) </FormControl.Label>
            <DateTimePicker
              value={formData.dol}
              onChange={handleFormData(page, 'dol')}
            />
          </FormControl>
        </Box>
        <AddPatientBottomButtons nextQuestionHandler={nextQuestionHandler} />
      </Box>
    </ScrollView>
  );
}
