// Base
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import {
  Box,
  Text,
  Center,
  Image,
  Pressable,
  FlatList,
  VStack,
} from 'native-base';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import CommonInputField from 'app/components/CommonInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import DateInputField from 'app/components/DateInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import ActivityIndicator from 'app/components/ActivityIndicator';
// import AsyncStorage from '@react-native-async-storage/async-storage';

function PatientAddPatientInfoScreen({
  nextQuestionHandler,
  handleFormData,
  formData,
  pickImage,
}) {
  const page = 'patientInfo';
  const patient = formData.patientInfo;
  const { data, isError, isLoading } = useGetSelectionOptions('Language');

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
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

  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later

  // set initial value for  SelectionInputField dataArray prop -> follow format of "label" and "value"
  const [listOfLanguages, setListOfLanguages] = useState([
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
  ]);

  // use for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];
  const listRespiteCare = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  // Callback functions for error state reporting for the child components
  // Pass these functions into the onChildData prop of the child components. This will allow for
  // the parent component to track the error states of the child.
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

  // This useEffect enables the page to show correct error checking
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

  /* If retrieval from the hook is successful, replace the content in
     listOfLanguages with the retrieved one. */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setListOfLanguages(data);
    }
  }, [data, isError, isLoading]);

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
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
                {/* <Center> */}
                <View style={styles.formContainer}>
                  <View style={styles.titleAndPictureContainer}>
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
                  </View>

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
                  />

                  <RadioButtonInput
                    isRequired
                    title={'Gender'}
                    value={patient.Gender}
                    onChangeData={handleFormData(page, 'Gender')}
                    onChildData={handleGenderState}
                    dataArray={listOfGenders}
                  />
                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      isRequired
                      selectionMode={'DOB'}
                      title={'Date of Birth'}
                      value={patient.DOB}
                      handleFormData={handleFormData(page, 'DOB')}
                      onChildData={handleDOBState}
                    />
                  </View>

                  <CommonInputField
                    isRequired
                    title={'Address'}
                    value={patient.Address}
                    onChangeText={handleFormData(page, 'Address')}
                    onChildData={handleAddrState}
                  />

                  <CommonInputField
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
                  />

                  <TelephoneInputField
                    title={'Mobile No.(optional)'}
                    value={patient.HandphoneNo}
                    numberType={'mobile'}
                    onChangeText={handleFormData(page, 'HandphoneNo')}
                    onChildData={handleMobileState}
                  />

                  <RadioButtonInput
                    isRequired
                    title={'Respite Care'}
                    value={patient.IsRespiteCare}
                    onChangeData={handleFormData(page, 'IsRespiteCare')}
                    dataArray={listRespiteCare}
                    onChildData={handleRespiteState}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      isRequired
                      title={'Date of Joining'}
                      value={patient.StartDate}
                      handleFormData={handleFormData(page, 'StartDate')}
                      onChildData={handleJoiningState}
                      minimumInputDate={minimumJoiningDate}
                      maximumInputDate={maximumJoiningDate}
                    />
                  </View>

                  <SingleOptionCheckBox
                    title={'Check this box to specify Date of Leaving'}
                    value={patient.IsChecked}
                    onChangeData={handleFormData(page, 'IsChecked')}
                    accessibilityText={
                      'Do you wish to key in the Date of Leaving?'
                    }
                  />

                  {/* Rendered only when the specify date of leaving checkbox is selected. */}
                  {formData.patientInfo.IsChecked ? (
                    <DateInputField
                      title={'Date of Leaving (Optional)'}
                      handleFormData={handleFormData(page, 'EndDate')}
                      value={patient.EndDate}
                      onChildData={handleLeavingState}
                    />
                  ) : null}
                </View>
                {/* </Center> */}
              </VStack>
            </Box>

            <AddPatientBottomButtons
              nextQuestionHandler={nextQuestionHandler}
              formData={formData}
              isNextDisabled={isInputErrors}
            />
          </Box>
        )}
      />
    </>
  );
}
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
  },
  titleAndPictureContainer: {
    alignItems: 'center',
    width: '100%',
  },
  dateSelectionContainer: {
    width: '70%',
  },
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
