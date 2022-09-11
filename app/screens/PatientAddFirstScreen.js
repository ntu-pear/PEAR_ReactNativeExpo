import React, { useState } from 'react';
import {
  Box,
  Input,
  Icon,
  FormControl,
  Text,
  Button,
  Progress,
  Radio,
  HStack,
  Image,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ScrollView } from 'react-native';

export function PatientAddFirstScreen(props) {
  const { nextQuestionHandler } = props;

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <Box marginTop={10}>
            <Progress colorScheme="primary" value={25} />
          </Box>
          <Text textAlign="center" marginTop={6} bold fontSize="2xl">
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
            <FormControl.Label>Preferred Name (Optional)</FormControl.Label>
            <Input placeholder="Preferred Name" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Language</FormControl.Label>
            <Input placeholder="Preferred Language" />
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
            <FormControl.Label>Home No. </FormControl.Label>
            <Input placeholder="Home Number" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Handphone No. </FormControl.Label>
            <Input placeholder="Handphone Number" />
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
        <Button dark w="20" margin="10" onPress={nextQuestionHandler}>
          Next
        </Button>
      </Box>
    </ScrollView>
  );
}
