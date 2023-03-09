import React from 'react';
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
  FlatList,
  Checkbox,
  VStack,
} from 'native-base';
import { StyleSheet, Platform } from 'react-native';

import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import DatePickerComponent from 'app/components/DatePickerComponent';
import ErrorMessage from 'app/components/ErrorMessage';
import CustomFormControl from 'app/components/CustomFormControl';

import colors from 'app/config/colors';
import typography from 'app/config/typography';

function PatientAddPatientInfoScreen(props) {
  const {
    nextQuestionHandler,
    handleFormData,
    formData,
    pickImage,
    show,
    setShow,
    errorMessage,
  } = props;

  const page = 'patientInfo';
  const patient = formData.patientInfo;

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
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <Center>
                <AddPatientProgress value={30} />
                <Text
                  // textAlign="center"
                  marginTop={6}
                  fontSize="2xl"
                  color={colors.green}
                  style={styles.text}
                >
                  Patient Information
                </Text>

                <Box mt="3.5" mb="3.5" overflow="hidden" rounded="lg">
                  <Center>
                    <Pressable
                      onPress={pickImage(page, 'UploadProfilePicture')}
                    >
                      <Image
                        alt="patient_image"
                        borderRadius="full"
                        // Note: This is a fall-back uri. Will only be used if source fails to render the image.
                        fallbackSource={{
                          uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1677039560/Assets/jzfbdl15jstf8bgt5ax0.png',
                        }}
                        resizeMode="cover"
                        size="xl"
                        source={{
                          uri: patient.UploadProfilePicture.uri
                            ? `${patient.UploadProfilePicture.uri}`
                            : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1677917228/Assets/w2vyggaj8loyi0lmkrwo.png',
                        }}
                      />
                    </Pressable>
                    {patient.UploadProfilePicture.uri ? (
                      <></>
                    ) : (
                      <Text
                        style={styles.text}
                        color={colors.black_var1}
                        mt="2"
                      >
                        Upload a Profile Picture
                      </Text>
                    )}
                  </Center>
                </Box>

                <CustomFormControl
                  isRequired
                  isInvalid={'FirstName' in errorMessage}
                  title="First Name"
                  value={patient.FirstName}
                  onChangeText={handleFormData(page, 'FirstName')}
                  placeholder="First Name"
                  ErrorMessage={errorMessage.FirstName}
                />

                <CustomFormControl
                  isRequired
                  isInvalid={'LastName' in errorMessage}
                  title="Last Name"
                  value={patient.LastName}
                  onChangeText={handleFormData(page, 'LastName')}
                  placeholder="Last Name"
                  ErrorMessage={errorMessage.LastName}
                />

                <CustomFormControl
                  isRequired
                  isInvalid={'PreferredName' in errorMessage}
                  title="Preferred Name"
                  value={patient.PreferredName}
                  onChangeText={handleFormData(page, 'PreferredName')}
                  placeholder="Preferred Name"
                  ErrorMessage={errorMessage.PreferredName}
                />

                <FormControl w="80%" mt="5" isRequired>
                  <FormControl.Label _text={styles.text}>
                    Preferred Language
                  </FormControl.Label>
                  <Select
                    accessibilityLabel="Select Language"
                    borderRadius="25"
                    fontFamily={
                      Platform.OS === 'ios'
                        ? typography.ios
                        : typography.android
                    }
                    height="50"
                    minWidth="full"
                    minHeight="3%"
                    placeholder="Select role"
                    placeholderTextColor={colors.medium}
                    size="18"
                    selectedValue={patient.PreferredLanguageListID}
                    onValueChange={handleFormData(
                      page,
                      'PreferredLanguageListID',
                    )}
                  >
                    {listOfLanguages.map((item) => (
                      <Select.Item
                        key={item}
                        label={item.value}
                        value={item.list_LanguageID}
                      />
                    ))}
                  </Select>
                </FormControl>
                <Box>
                  <ErrorMessage
                    visible={'PreferredLanguage' in errorMessage}
                    message={errorMessage.PreferredLanguage}
                  />
                </Box>

                <CustomFormControl
                  isRequired
                  isInvalid={'NRIC' in errorMessage}
                  title="NRIC"
                  value={patient.NRIC}
                  onChangeText={handleFormData(page, 'NRIC')}
                  placeholder="NRIC"
                  ErrorMessage={errorMessage.NRIC}
                />

                <CustomFormControl
                  isRequired
                  isInvalid={'Address' in errorMessage}
                  title="Address"
                  value={patient.Address}
                  onChangeText={handleFormData(page, 'Address')}
                  placeholder="Address"
                  ErrorMessage={errorMessage.Address}
                />

                <CustomFormControl
                  isInvalid={'TempAddress' in errorMessage}
                  title="Temporary Address"
                  value={patient.TempAddress}
                  onChangeText={handleFormData(page, 'TempAddress')}
                  placeholder="Temporary Address (Optional)"
                  ErrorMessage={errorMessage.TempAddress}
                />

                <CustomFormControl
                  isInvalid={'HomeNo' in errorMessage}
                  title="Home Telephone No."
                  value={patient.HomeNo}
                  onChangeText={handleFormData(page, 'HomeNo')}
                  placeholder="Home Telephone No. (Optional)"
                  ErrorMessage={errorMessage.HomeNo}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <CustomFormControl
                  isInvalid={'HandphoneNo' in errorMessage}
                  title="Handphone No."
                  value={patient.HandphoneNo}
                  onChangeText={handleFormData(page, 'HandphoneNo')}
                  placeholder="Handphone No. (Optional)"
                  ErrorMessage={errorMessage.HandphoneNo}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <FormControl w="80%" mt="5" isRequired>
                  <FormControl.Label _text={styles.text}>
                    Gender
                  </FormControl.Label>
                  <Radio.Group
                    value={patient.Gender}
                    onChange={handleFormData(page, 'Gender')}
                  >
                    <HStack space={4}>
                      <Radio
                        value="M"
                        size="sm"
                        _icon={{ color: colors.green }}
                        _checked={{
                          borderColor: colors.green,
                        }}
                      >
                        Male
                      </Radio>
                      <Radio
                        value="F"
                        size="sm"
                        _icon={{ color: colors.green }}
                        _checked={{
                          borderColor: colors.green,
                        }}
                      >
                        Female
                      </Radio>
                    </HStack>
                  </Radio.Group>
                </FormControl>
                <Box>
                  <ErrorMessage
                    visible={'Gender' in errorMessage}
                    message={errorMessage.Gender}
                  />
                </Box>

                <FormControl w="80%" mt="5" isRequired>
                  <FormControl.Label _text={styles.text}>
                    Respite Care
                  </FormControl.Label>
                  <Radio.Group
                    value={patient.IsRespiteCare}
                    onChange={handleFormData(page, 'IsRespiteCare')}
                  >
                    <HStack space={6}>
                      <Radio
                        value={true}
                        size="sm"
                        _icon={{ color: colors.green }}
                        _checked={{
                          borderColor: colors.green,
                        }}
                      >
                        Yes
                      </Radio>
                      <Radio
                        value={false}
                        size="sm"
                        _icon={{ color: colors.green }}
                        _checked={{
                          borderColor: colors.green,
                        }}
                      >
                        No
                      </Radio>
                    </HStack>
                  </Radio.Group>
                </FormControl>
                <Box>
                  <ErrorMessage
                    visible={'IsRespiteCare' in errorMessage}
                    message={errorMessage.IsRespiteCare}
                  />
                </Box>

                {/* Reference: https://github.com/react-native-datetimepicker/datetimepicker
          TODO: Align to the left*/}
                <FormControl w="80%" mt="5" isRequired>
                  <DatePickerComponent
                    label={'Date of Birth'}
                    value={patient.DOB}
                    page={page}
                    field="DOB"
                    handleFormData={handleFormData}
                    show={show}
                    setShow={setShow}
                  />
                  <Box>
                    <ErrorMessage
                      visible={'DOB' in errorMessage}
                      message={errorMessage.DOB}
                    />
                  </Box>
                </FormControl>

                <FormControl w="80%" mt="5" isRequired>
                  <DatePickerComponent
                    label={'Date of Joining'}
                    value={patient.StartDate}
                    page={page}
                    field="StartDate"
                    handleFormData={handleFormData}
                    show={show}
                    setShow={setShow}
                  />
                  <Box>
                    <ErrorMessage
                      visible={'StartDate' in errorMessage}
                      message={errorMessage.StartDate}
                    />
                  </Box>
                </FormControl>

                <FormControl w="80%" mt="5">
                  <HStack justifyContent="space-between" alignItems="center">
                    <FormControl.Label _text={styles.text}>
                      Check this box to specify Date of Leaving
                    </FormControl.Label>
                    <Checkbox
                      isChecked={patient.IsChecked}
                      value={patient.IsChecked}
                      onChange={handleFormData(page, 'IsChecked')}
                      aria-label=" Do you wish to key in the Date of Leaving?"
                    />
                  </HStack>
                </FormControl>

                <FormControl w="80%" mt="5" isRequired>
                  <DatePickerComponent
                    label={'Date of Leaving (Optional)'}
                    value={patient.EndDate}
                    page={page}
                    field="EndDate"
                    handleFormData={handleFormData}
                    show={show}
                    setShow={setShow}
                    isChecked={patient.IsChecked}
                  />
                </FormControl>

                <Box>
                  <ErrorMessage
                    visible={'EndDate' in errorMessage}
                    message={errorMessage.EndDate}
                  />
                </Box>
              </Center>
            </VStack>
          </Box>
          <AddPatientBottomButtons
            nextQuestionHandler={nextQuestionHandler}
            formData={formData}
          />
        </Box>
      )}
    />
  );
}
const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
});
export default PatientAddPatientInfoScreen;
