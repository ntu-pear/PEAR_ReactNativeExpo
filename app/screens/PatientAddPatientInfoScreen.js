import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  // Input,
  // FormControl,
  Text,
  Center,
  Image,
  // Radio,
  // HStack,
  // Select,
  Pressable,
  FlatList,
  // ScrollView,
  // Checkbox,
  VStack,
} from 'native-base';
import { StyleSheet, Platform } from 'react-native';

import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
// import DatePickerComponent from 'app/components/DatePickerComponent';
// import ErrorMessage from 'app/components/ErrorMessage';
// import CustomFormControl from 'app/components/CustomFormControl';

import colors from 'app/config/colors';
import typography from 'app/config/typography';
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import AddressInputField from 'app/components/AddressInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import DateInputField from 'app/components/DateInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';

function PatientAddPatientInfoScreen(props) {
  const {
    nextQuestionHandler,
    handleFormData,
    formData,
    pickImage,
    // show,
    // setShow,
    // errorMessage,
  } = props;

  // main page error state = true in errorchecking function if any fields
  // have errors.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // input error states
  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isHomeTeleError, setIsHomeTeleError] = useState(false);
  const [isMobileError, setIsMobileError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isJoiningError, setIsJoiningError] = useState(false);
  const [isLeavingError, setIsLeavingError] = useState(false);
  const [isPrefLanguageError, setPrefLanguageError] = useState(false);
  const [isGenderError, setIsGenderError] = useState(false);
  const [isRespiteError, setIsRespiteError] = useState(false);

  const page = 'patientInfo';
  const patient = formData.patientInfo;

  // constant values for languages
  // const listOfLanguages = [
  //   { itemID: 1, value: 'Cantonese' },
  //   { itemID: 2, value: 'English' },
  //   { itemID: 3, value: 'Hainanese' },
  //   { itemID: 4, value: 'Hakka' },
  //   { itemID: 5, value: 'Hindi' },
  //   { itemID: 6, value: 'Hokkien' },
  //   { itemID: 7, value: 'Malay' },
  //   { itemID: 8, value: 'Mandarin' },
  //   { itemID: 9, value: 'Tamil' },
  //   { itemID: 10, value: 'Teochew' },
  //   { itemID: 11, value: 'Japanese' },
  //   { itemID: 12, value: 'Spanish' },
  //   { itemID: 13, value: 'Korean' },
  // ];

  const listOfLanguages = [
    { label: 'Cantonese', value: 1 },
    { label: 'English', value: 2 },
    { label: 'Hainanese', value: 3 },
    { label: 'Hakka', value: 4 },
    { label: 'Hindi', value: 5 },
    { label: 'Hokkien', value: 6 },
    { label: 'Malay', value: 7 },
    { label: 'Mandarin', value: 8 },
    { label: 'Tamil', value: 9 },
    { label: 'Teochew', value: 10 },
    { label: 'Japanese', value: 11 },
    { label: 'Spanish', value: 12 },
    { label: 'Korean', value: 13 },
  ];

  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  const listRespiteCare = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  // Callback functions for the Input field children
  const handleFirstNameState = useCallback(
    (state) => {
      setIsFirstNameError(state);
      // console.log('FirstName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFirstNameError],
  );
  const handleLastNameState = useCallback(
    (state) => {
      setIsLastNameError(state);
      // console.log('LastName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLastNameError],
  );
  const handlePrefNameState = useCallback(
    (state) => {
      setIsPrefNameError(state);
      // console.log('prefName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handleNRICState = useCallback(
    (state) => {
      setIsNRICError(state);
      // console.log('NRIC: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNRICError],
  );
  const handleAddrState = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log('Addr: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAddrError],
  );
  const handleTempAddrState = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log('TempAddr: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTempAddrError],
  );
  const handleHomeTeleState = useCallback(
    (state) => {
      setIsHomeTeleError(state);
      // console.log('HomeTele: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHomeTeleError],
  );
  const handleMobileState = useCallback(
    (state) => {
      setIsMobileError(state);
      // console.log('Mobile: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobileError],
  );
  const handleDOBState = useCallback(
    (state) => {
      setIsDOBError(state);
      // console.log('DOB: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDOBError],
  );
  const handleJoiningState = useCallback(
    (state) => {
      setIsJoiningError(state);
      // console.log('joining: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isJoiningError],
  );
  const handleLeavingState = useCallback(
    (state) => {
      setIsLeavingError(state);
      // console.log('leaving: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLeavingError],
  );
  const handlePrefLanguageState = useCallback(
    (state) => {
      setPrefLanguageError(state);
      // console.log('leaving: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefLanguageError],
  );
  const handleGenderState = useCallback(
    (state) => {
      setIsGenderError(state);
      // console.log('leaving: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGenderError],
  );
  const handleRespiteState = useCallback(
    (state) => {
      setIsRespiteError(state);
      // console.log('leaving: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRespiteError],
  );

  // This use effect enables the page to show correct error checking
  // the main isInputErrors is responsible for the error state of the screen
  // this state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
        isLastNameError ||
        isPrefNameError ||
        isNRICError ||
        isAddrError ||
        isTempAddrError ||
        isHomeTeleError ||
        isMobileError ||
        isDOBError ||
        isJoiningError ||
        isRespiteError ||
        isGenderError ||
        isLeavingError,
    );
  }, [
    isFirstNameError,
    isLastNameError,
    isPrefNameError,
    isNRICError,
    isAddrError,
    isTempAddrError,
    isHomeTeleError,
    isMobileError,
    isDOBError,
    isJoiningError,
    isLeavingError,
    isRespiteError,
    isGenderError,
  ]);

  return (
    <>
      <Center>
        <AddPatientProgress value={30} />
      </Center>
      <FlatList
        data={[0]}
        renderItem={() => (
          <Box alignItems="center">
            <Box w="100%">
              <VStack>
                <Center>
                  <Text
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

                  <NameInputField
                    isRequired
                    title={'First Name'}
                    value={patient.FirstName}
                    onChangeText={handleFormData(page, 'FirstName')}
                    onChildData={handleFirstNameState}
                  />

                  <NameInputField
                    isRequired
                    title={'Last Name'}
                    value={patient.LastName}
                    onChangeText={handleFormData(page, 'LastName')}
                    onChildData={handleLastNameState}
                  />

                  <NameInputField
                    isRequired
                    title={'Preferred Name'}
                    value={patient.PreferredName}
                    onChangeText={handleFormData(page, 'PreferredName')}
                    onChildData={handlePrefNameState}
                  />

                  <SelectionInputField
                    isRequired
                    title={'Preferred Language'}
                    placeholderText={'Select Language'}
                    onDataChange={handleFormData(
                      page,
                      'PreferredLanguageListID',
                    )}
                    value={patient.PreferredLanguageListID}
                    dataArray={listOfLanguages}
                    onChildData={handlePrefLanguageState}
                  />

                  <NRICInputField
                    isRequired
                    title={'NRIC'}
                    value={patient.NRIC}
                    onChangeText={handleFormData(page, 'NRIC')}
                    onChildData={handleNRICState}
                    maxLength={9}
                  />

                  <RadioButtonInput
                    isRequired
                    title={'Gender'}
                    value={patient.Gender}
                    onChangeData={handleFormData(page, 'Gender')}
                    onChildData={handleGenderState}
                    dataArray={listOfGenders}
                  />

                  <DateInputField
                    isRequired
                    selectionMode={'DOB'}
                    title={'Date of Birth'}
                    value={patient.DOB}
                    handleFormData={handleFormData(page, 'DOB')}
                    onChildData={handleDOBState}
                  />

                  <AddressInputField
                    isRequired
                    title={'Address'}
                    value={patient.Address}
                    onChangeText={handleFormData(page, 'Address')}
                    onChildData={handleAddrState}
                  />

                  <AddressInputField
                    title={'Temporary Address (optional)'}
                    value={patient.TempAddress}
                    onChangeText={handleFormData(page, 'TempAddress')}
                    onChildData={handleTempAddrState}
                  />

                  <TelephoneInputField
                    title={'Home Telephone No.(optional)'}
                    value={patient.HomeNo}
                    numberType={'home'}
                    onChangeText={handleFormData(page, 'HomeNo')}
                    onChildData={handleHomeTeleState}
                    keyboardType="numeric"
                    maxLength={8}
                  />

                  <TelephoneInputField
                    title={'Mobile No.(optional)'}
                    value={patient.HandphoneNo}
                    numberType={'mobile'}
                    onChangeText={handleFormData(page, 'HandphoneNo')}
                    onChildData={handleMobileState}
                    keyboardType="numeric"
                    maxLength={8}
                  />

                  <RadioButtonInput
                    isRequired
                    title={'Respite Care'}
                    value={patient.IsRespiteCare}
                    onChangeData={handleFormData(page, 'IsRespiteCare')}
                    dataArray={listRespiteCare}
                    onChildData={handleRespiteState}
                  />

                  <DateInputField
                    isRequired
                    title={'Date of Joining'}
                    value={patient.StartDate}
                    handleFormData={handleFormData(page, 'StartDate')}
                    onChildData={handleJoiningState}
                  />

                  <SingleOptionCheckBox
                    title={'Check this box to specify Date of Leaving'}
                    value={patient.IsChecked}
                    onChangeData={handleFormData(page, 'IsChecked')}
                    accessibilityText={
                      'Do you wish to key in the Date of Leaving?'
                    }
                  />

                  {formData.patientInfo.IsChecked ? (
                    <DateInputField
                      title={'Date of Leaving (Optional)'}
                      handleFormData={handleFormData(page, 'EndDate')}
                      value={patient.EndDate}
                      onChildData={handleLeavingState}
                    />
                  ) : null}

                  {/* <CustomFormControl
                    isRequired
                    isInvalid={'FirstName' in errorMessage}
                    title="First Name"
                    value={patient.FirstName}
                    onChangeText={handleFormData(page, 'FirstName')}
                    placeholder="First Name"
                    ErrorMessage={errorMessage.FirstName}
                  /> */}

                  {/* <CustomFormControl
                    isRequired
                    isInvalid={'LastName' in errorMessage}
                    title="Last Name"
                    value={patient.LastName}
                    onChangeText={handleFormData(page, 'LastName')}
                    placeholder="Last Name"
                    ErrorMessage={errorMessage.LastName}
                  /> */}

                  {/* <CustomFormControl
                    isRequired
                    isInvalid={'PreferredName' in errorMessage}
                    title="Preferred Name"
                    value={patient.PreferredName}
                    onChangeText={handleFormData(page, 'PreferredName')}
                    placeholder="Preferred Name"
                    ErrorMessage={errorMessage.PreferredName}
                  /> */}

                  {/* <FormControl w="80%" mt="5" isRequired>
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
                      placeholder="Select Language"
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
                  </Box> */}

                  {/* <CustomFormControl
                    isRequired
                    isInvalid={'NRIC' in errorMessage}
                    title="NRIC"
                    value={patient.NRIC}
                    onChangeText={handleFormData(page, 'NRIC')}
                    placeholder="NRIC"
                    ErrorMessage={errorMessage.NRIC}
                    maxLength={9}
                  /> */}

                  {/* <FormControl
                    w="80%"
                    mt="5"
                    isRequired
                    isInvalid={'Gender' in errorMessage}
                  >
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

                    <FormControl.ErrorMessage>
                      {errorMessage.Gender}
                    </FormControl.ErrorMessage>
                  </FormControl> */}

                  {/* Reference: https://github.com/react-native-datetimepicker/datetimepicker
                TODO: Align to the left*/}
                  {/* <FormControl w="80%" mt="5" isRequired>
                    <DatePickerComponent
                      label={'Date of Birth'}
                      patient={patient}
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
                  </FormControl> */}

                  {/* <CustomFormControl
                    isRequired
                    isInvalid={'Address' in errorMessage}
                    title="Address"
                    value={patient.Address}
                    onChangeText={handleFormData(page, 'Address')}
                    placeholder="Address"
                    ErrorMessage={errorMessage.Address}
                  /> */}

                  {/* <CustomFormControl
                    isInvalid={'TempAddress' in errorMessage}
                    title="Temporary Address"
                    value={patient.TempAddress}
                    onChangeText={handleFormData(page, 'TempAddress')}
                    placeholder="Temporary Address (Optional)"
                    ErrorMessage={errorMessage.TempAddress}
                  /> */}

                  {/* <CustomFormControl
                    isInvalid={'HomeNo' in errorMessage}
                    title="Home Telephone No."
                    value={patient.HomeNo}
                    onChangeText={handleFormData(page, 'HomeNo')}
                    placeholder="Home Telephone No. (Optional)"
                    ErrorMessage={errorMessage.HomeNo}
                    keyboardType="numeric"
                    maxLength={8}
                  /> */}

                  {/* <CustomFormControl
                    isInvalid={'HandphoneNo' in errorMessage}
                    title="Handphone No."
                    value={patient.HandphoneNo}
                    onChangeText={handleFormData(page, 'HandphoneNo')}
                    placeholder="Handphone No. (Optional)"
                    ErrorMessage={errorMessage.HandphoneNo}
                    keyboardType="numeric"
                    maxLength={8}
                  /> */}

                  {/* <FormControl w="80%" mt="5" isRequired>
                    <DatePickerComponent
                      label={'Date of Joining'}
                      patient={patient}
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
                  </FormControl> */}

                  {/* <FormControl
                    w="80%"
                    mt="5"
                    isRequired
                    isInvalid={'IsRespiteCare' in errorMessage}
                  >
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

                    <FormControl.ErrorMessage>
                      {errorMessage.IsRespiteCare}
                    </FormControl.ErrorMessage>
                  </FormControl> */}

                  {/* <FormControl w="80%" mt="5">
                    <HStack justifyContent="space-between" alignItems="center">
                      <FormControl.Label _text={styles.text}>
                        Check this box to specify Date of Leaving
                      </FormControl.Label>
                      <Checkbox
                        isChecked={patient.IsChecked}
                        value={patient.IsChecked}
                        onChange={handleFormData(page, 'IsChecked')}
                        aria-label=" Do you wish to key in the Date of Leaving?"
                        _checked={{ bgColor: colors.green }}
                      />
                    </HStack>
                  </FormControl> */}

                  {/* <FormControl
                    w="80%"
                    mt="5"
                    isInvalid={'EndDate' in errorMessage}
                  >
                    <DatePickerComponent
                      label={'Date of Leaving (Optional)'}
                      patient={patient}
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
                      message={
                        Platform.OS === 'ios'
                          ? 'Please select another Date of Leaving.'
                          : 'Please select a Date of Leaving.'
                      }
                    />
                  </Box> */}
                </Center>
              </VStack>
            </Box>
            {isInputErrors ? (
              <Text style={[styles.text, styles.errorText]}>
                Ensure all filled fields are correct before proceeding.
              </Text>
            ) : (
              <AddPatientBottomButtons
                nextQuestionHandler={nextQuestionHandler}
                formData={formData}
              />
            )}
          </Box>
        )}
      />
    </>
  );
}
const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    paddingBottom: 20,
    paddingTop: 20,
  },
});
export default PatientAddPatientInfoScreen;
