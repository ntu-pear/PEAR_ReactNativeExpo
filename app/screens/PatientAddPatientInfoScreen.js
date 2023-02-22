import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Center,
  Image,
  Radio,
  HStack,
  Select,
  Pressable,
} from 'native-base';
import { ScrollView } from 'react-native';
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import colors from 'app/config/colors';
import DatePickerComponent from 'app/components/DatePickerComponent';

export function PatientAddPatientInfoScreen(props) {
  const {
    nextQuestionHandler,
    handleFormData,
    formData,
    pickImage,
    show,
    setShow,
  } = props;

  const page = 'patientInfo';
  const patient = formData.patientInfo;
  // console.log('patient Info', patient);
  // constant values for languages
  const listOfLanguages = [
    { list_LanguageID: 1, value: 'Cantonese' },
    { list_LanguageID: 2, value: 'English' },
    { list_LanguageID: 3, value: 'Hainanese' },
    { list_LanguageID: 4, value: 'Hakka' },
    { list_LanguageID: 5, value: 'Hindi' },
    { list_LanguageID: 6, value: 'Hokkien' },
    { list_LanguageID: 7, value: 'Malay' },
    { list_LanguageID: 8, value: 'Mandarin' },
    { list_LanguageID: 9, value: 'Tamil' },
    { list_LanguageID: 10, value: 'Teochew' },
    { list_LanguageID: 11, value: 'Japanese' },
    { list_LanguageID: 12, value: 'Spanish' },
    { list_LanguageID: 13, value: 'Korean' },
  ];

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={30} />
          <Text
            textAlign="center"
            marginTop={6}
            bold
            fontSize="2xl"
            color={colors.green}
          >
            Patient Information
          </Text>

          <Box mt="3.5" mb="3.5" overflow="hidden" rounded="lg">
            <Center>
              <Pressable onPress={pickImage(page, 'UploadProfilePicture')}>
                <Image
                  alt="patient_image"
                  borderRadius="full"
                  // Note: This is a fall-back uri. Will only be used if source fails to render the image.
                  fallbackSource={{
                    uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1673348736/Assets/bvtnichzakwtzwu2zqt5.jpg',
                  }}
                  resizeMode="cover"
                  size="xl"
                  source={{
                    uri: patient.UploadProfilePicture.uri
                      ? `${patient.UploadProfilePicture.uri}`
                      : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1673348736/Assets/bvtnichzakwtzwu2zqt5.jpg',
                  }}
                />
              </Pressable>
            </Center>
          </Box>

          <FormControl>
            <FormControl.Label>First Name</FormControl.Label>
            <Input
              placeholder="First Name"
              value={patient.FirstName}
              onChangeText={handleFormData(page, 'FirstName')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Last Name</FormControl.Label>
            <Input
              placeholder="Last Name"
              value={patient.LastName}
              onChangeText={handleFormData(page, 'LastName')}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Preferred Name</FormControl.Label>
            <Input
              placeholder="Preferred Name"
              value={patient.PreferredName}
              onChangeText={handleFormData(page, 'PreferredName')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Preferred Language</FormControl.Label>
            <Select
              placeholder="Select Language"
              selectedValue={patient.PreferredLanguageListID}
              onValueChange={handleFormData(page, 'PreferredLanguageListID')}
            >
              {listOfLanguages.map((item) => (
                <Select.Item label={item.value} value={item.list_LanguageID} />
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormControl.Label>NRIC</FormControl.Label>
            <Input
              placeholder="NRIC"
              value={patient.NRIC}
              onChangeText={handleFormData(page, 'NRIC')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Address</FormControl.Label>
            <Input
              placeholder="Address"
              value={patient.Address}
              onChangeText={handleFormData(page, 'Address')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Home Telephone No.</FormControl.Label>
            <Input
              placeholder="Home Telephone Number (Optional)"
              value={patient.HomeNo}
              onChangeText={handleFormData(page, 'HomeNo')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Handphone No.</FormControl.Label>
            <Input
              placeholder="Handphone Number (Optional)"
              value={patient.HandphoneNo}
              onChangeText={handleFormData(page, 'HandphoneNo')}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Gender </FormControl.Label>
            <Radio.Group
              value={patient.Gender}
              onChange={handleFormData(page, 'Gender')}
            >
              <HStack space={4}>
                <Radio value="M" size="sm">
                  Male
                </Radio>
                <Radio value="F" size="sm">
                  Female
                </Radio>
              </HStack>
            </Radio.Group>
          </FormControl>

          {/* Reference: https://github.com/react-native-datetimepicker/datetimepicker
          TODO: Align to the left*/}
          <DatePickerComponent
            label={'Date of Birth'}
            value={patient.DOB}
            page={page}
            field="DOB"
            handleFormData={handleFormData}
            show={show}
            setShow={setShow}
          />
          <DatePickerComponent
            label={'Date of Joining'}
            value={patient.StartDate}
            page={page}
            field="StartDate"
            handleFormData={handleFormData}
            show={show}
            setShow={setShow}
          />
          <DatePickerComponent
            label={'Date of Leaving (Optional)'}
            value={patient.EndDate}
            page={page}
            field="EndDate"
            handleFormData={handleFormData}
            show={show}
            setShow={setShow}
          />
        </Box>
        <AddPatientBottomButtons nextQuestionHandler={nextQuestionHandler} />
      </Box>
    </ScrollView>
  );
}
