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
} from 'native-base';
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import colors from 'app/config/colors';
import DatePickerComponent from 'app/components/DatePickerComponent';
import ErrorMessage from 'app/components/ErrorMessage';

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
                  <Text mt="2"> Upload a Profile Picture</Text>
                )}
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
            {errorMessage.FirstName ? (
              <ErrorMessage visible={true} message={errorMessage.FirstName} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Last Name</FormControl.Label>
              <Input
                placeholder="Last Name"
                value={patient.LastName}
                onChangeText={handleFormData(page, 'LastName')}
              />
            </FormControl>
            {errorMessage.LastName ? (
              <ErrorMessage visible={true} message={errorMessage.LastName} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Preferred Name</FormControl.Label>
              <Input
                placeholder="Preferred Name"
                value={patient.PreferredName}
                onChangeText={handleFormData(page, 'PreferredName')}
              />
            </FormControl>
            {errorMessage.PreferredName ? (
              <ErrorMessage
                visible={true}
                message={errorMessage.PreferredName}
              />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Preferred Language</FormControl.Label>
              <Select
                placeholder="Select Language"
                selectedValue={patient.PreferredLanguageListID}
                onValueChange={handleFormData(page, 'PreferredLanguageListID')}
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
            {errorMessage.PreferredLanguageListID ? (
              <ErrorMessage
                visible={true}
                message={errorMessage.PreferredLanguageListID}
              />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>NRIC</FormControl.Label>
              <Input
                placeholder="NRIC"
                value={patient.NRIC}
                maxLength={9}
                onChangeText={handleFormData(page, 'NRIC')}
              />
            </FormControl>
            {errorMessage.NRIC ? (
              <ErrorMessage visible={true} message={errorMessage.NRIC} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Address</FormControl.Label>
              <Input
                placeholder="Address"
                value={patient.Address}
                onChangeText={handleFormData(page, 'Address')}
              />
            </FormControl>
            {errorMessage.Address ? (
              <ErrorMessage visible={true} message={errorMessage.Address} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>
                Temporary Address (Optional)
              </FormControl.Label>
              <Input
                placeholder="Temporary Address (Optional)"
                value={patient.TempAddress}
                onChangeText={handleFormData(page, 'TempAddress')}
              />
            </FormControl>
            {errorMessage.TempAddress ? (
              <ErrorMessage visible={true} message={errorMessage.TempAddress} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>
                Home Telephone No. (Optional)
              </FormControl.Label>
              <Input
                placeholder="Home Telephone Number (Optional)"
                keyboardType="numeric"
                maxLength={8}
                value={patient.HomeNo}
                onChangeText={handleFormData(page, 'HomeNo')}
              />
            </FormControl>
            {errorMessage.HomeNo ? (
              <ErrorMessage visible={true} message={errorMessage.HomeNo} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Handphone No. (Optional)</FormControl.Label>
              <Input
                placeholder="Handphone Number (Optional)"
                maxLength={8}
                value={patient.HandphoneNo}
                onChangeText={handleFormData(page, 'HandphoneNo')}
              />
            </FormControl>
            {errorMessage.HandphoneNo ? (
              <ErrorMessage visible={true} message={errorMessage.HandphoneNo} />
            ) : (
              <></>
            )}

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
            {errorMessage.Gender ? (
              <ErrorMessage visible={true} message={errorMessage.Gender} />
            ) : (
              <></>
            )}

            <FormControl>
              <FormControl.Label>Respite Care </FormControl.Label>
              <Radio.Group
                value={patient.IsRespiteCare}
                onChange={handleFormData(page, 'IsRespiteCare')}
              >
                <HStack space={6}>
                  <Radio value={true} size="sm">
                    Yes
                  </Radio>
                  <Radio value={false} size="sm">
                    No
                  </Radio>
                </HStack>
              </Radio.Group>
            </FormControl>
            {errorMessage.IsRespiteCare ? (
              <ErrorMessage
                visible={true}
                message={errorMessage.IsRespiteCare}
              />
            ) : (
              <></>
            )}

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
            {errorMessage.DOB ? (
              <ErrorMessage visible={true} message={errorMessage.DOB} />
            ) : (
              <></>
            )}

            <DatePickerComponent
              label={'Date of Joining'}
              value={patient.StartDate}
              page={page}
              field="StartDate"
              handleFormData={handleFormData}
              show={show}
              setShow={setShow}
            />
            {errorMessage.StartDate ? (
              <ErrorMessage visible={true} message={errorMessage.StartDate} />
            ) : (
              <></>
            )}

            <DatePickerComponent
              label={'Date of Leaving (Optional)'}
              value={patient.EndDate}
              page={page}
              field="EndDate"
              handleFormData={handleFormData}
              show={show}
              setShow={setShow}
            />
            {errorMessage.EndDate ? (
              <ErrorMessage visible={true} message={errorMessage.EndDate} />
            ) : (
              <></>
            )}
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
export default PatientAddPatientInfoScreen;
