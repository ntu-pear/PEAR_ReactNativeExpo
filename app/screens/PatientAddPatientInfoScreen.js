// Base
import React, { useState, useEffect, useContext, useCallback } from 'react';
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

// Utilities
import { noDataMessage, parseSelectOptions } from 'app/utility/miscFunctions';

// Components
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import DateInputField from 'app/components/input-components/DateInputField';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';
import SingleOptionCheckBox from 'app/components/input-components/SingleOptionCheckBox';
import ActivityIndicator from 'app/components/ActivityIndicator';
import InputField from 'app/components/input-components/InputField';
import SensitiveInputField from 'app/components/input-components/SensitiveInputField';

// APIs
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';

function PatientAddPatientInfoScreen({
  testID='',
  nextQuestionHandler,
  handleFormData,
  formData,
  pickImage,
}) {
  const page = 'patientInfo';
  const patient = formData[page];

  // Variables relatied to retrieving preferred language select options from API
  const { data, isError, isLoading } = useGetSelectionOptions('Language');

  // Set initial value for preferred language select field
  const [listOfLanguages, setListOfLanguages] = useState(
    parseSelectOptions([
      'English',
      'Cantonese',
      'Hainanese',
      'Hakka',
      'Hindi',
      'Hokkien',
      'Malay',
      'Mandarin',
      'Tamil',
      'Teochew',
      'Japanese',
      'Spanish',
      'Korean',
    ]),
  );
  
  // Used for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const [listOfGenders, setListOfGenders] = useState([
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ]);
  const [listOfRespiteCare, setListOfRespiteCare] = useState([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isGenderError, setIsGenderError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isPostalCodeError, setIsPostalCodeError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isTempPostalCodeError, setIsTempPostalCodeError] = useState(false);
  const [isHomeNoError, setIsHomeNoError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isPrefLanguageError, setIsPrefLanguageError] = useState(false);
  const [isRespiteError, setIsRespiteError] = useState(false);
  const [isJoiningError, setIsJoiningError] = useState(false);
  const [isLeavingError, setIsLeavingError] = useState(false);

  // States for getting list of preferred names
  const [isPrefNamesLoading, setIsPrefNamesLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [prefNames, setPrefNames] = useState([]);

  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
      isLastNameError ||
      isNRICError ||
      isDOBError ||
      isGenderError ||
      isAddrError ||
      isPostalCodeError ||
      isTempAddrError ||
      isTempPostalCodeError ||
      isHomeNoError ||
      isMobileNoError ||
      isPrefNameError ||
      isRespiteError ||
      isJoiningError ||
      isLeavingError,
    );
  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isDOBError,
    isGenderError,
    isAddrError,
    isPostalCodeError,
    isTempAddrError,
    isTempPostalCodeError,
    isHomeNoError,
    isMobileNoError,
    isPrefNameError,
    isRespiteError,
    isJoiningError,
    isLeavingError,
  ]);

  // Try to get langugage list from backend. If retrieval from the hook is successful, replace the content in
  // listOfLanguages with the retrieved one.
  useEffect(() => {
    if (!isLoading && !isError && data) {
      // console.log('selection data!');
      setListOfLanguages(data);
    }
  }, [data, isError, isLoading]);

  // Get patient preferred names from API
  useEffect(() => {
    getPrefNames();
    patient.EndDate = new Date(null); //to set inital value of enddate to null, unless updated via selection
  }, []);

  // Get list of preferred names from backend to detect duplicate preferred names
  const getPrefNames = async () => {
    setIsPrefNamesLoading(true);
    const response = await patientApi.getPatientList(false, 'active');
    if (!response.ok) {
      setUser(null);
      return;
    }
    setPrefNames(response.data.data.map((x) => x.preferredName));
    setIsPrefNamesLoading(false);
  };

  // Functions for error state reporting for the child components
  const handleFirstNameError = useCallback(
    (state) => {
      setIsFirstNameError(state);
      // console.log('FirstName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFirstNameError],
  );

  const handleLastNameError = useCallback(
    (state) => {
      setIsLastNameError(state);
      // console.log("last name", state)
    },
    [isLastNameError],
  );
    
  const handleNRICError = useCallback(
    (state) => {
      setIsNRICError(state);
      // console.log("nric", state)
    },
    [isNRICError],
  );
  
  const handleDOBError = useCallback(
    (state) => {
      setIsDOBError(state);
      // console.log("dob", state)
    },
    [isDOBError],
  );

  const handleGenderError = useCallback(
    (state) => {
      setIsGenderError(state);
      // console.log("gender", state)
    },
    [isGenderError],
  );
  
  const handleAddrError = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log("addr", state)
    },
    [isAddrError],
  );

  const handlePostalCodeError = useCallback(
    (state) => {
      setIsPostalCodeError(state);
      // console.log("addr", state)
    },
    [isPostalCodeError],
  );
  
  const handleTempAddrError = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log("temp addr", state)
    },
    [isTempAddrError],
  );

  const handleTempPostalCodeError = useCallback(
    (state) => {
      setIsTempPostalCodeError(state);
      // console.log("addr", state)
    },
    [isTempPostalCodeError],
  );
  
  const handleHomeNoError = useCallback(
    (state) => {
      setIsHomeNoError(state);
      // console.log("home", state)
    },
    [isHomeNoError],
  );

  const handleMobileNoError = useCallback(
    (state) => {
      setIsMobileNoError(state);
      // console.log("mobile", state)
    },
    [isMobileNoError],
  );
  
  const handlePrefNameError = useCallback(
    (state) => {
      setIsPrefNameError(state);
      // console.log("pref name", state)
    },
    [isPrefNameError],
  );
  
  const handlePrefLanguageError = useCallback(
    (state) => {
      setIsPrefLanguageError(state);
      // console.log("language", state)
    },
    [isPrefLanguageError],
  );

  const handleRespiteError = useCallback(
    (state) => {
      setIsRespiteError(state);
      // console.log("respite", state)
    },
    [isRespiteError],
  );

  const handleJoiningError = useCallback(
    (state) => {
      setIsJoiningError(state);
      // console.log("joining", state)
    },
    [isJoiningError],
  );

  const handleLeavingError = useCallback(
    (state) => {
      setIsLeavingError(state);
      // console.log("leaving", state)
    },
    [isLeavingError],
  );

  return isError ? (    
    noDataMessage(null, false, isError, null)
  ) : isLoading || isPrefNamesLoading ? (
    <ActivityIndicator visible />
  ) : (
    <>
      <Center>
        <AddPatientProgress value={30} />
      </Center>
      <FlatList
        testID={testID}
        data={[0]}
        renderItem={() => (
          <Box alignItems="center">
            <Box w="100%">
              <VStack>
                {/* <Center> */}
                <View style={styles.formContainer}>
                  <View style={styles.titleAndPictureContainer}>
                    <Text
                      testID={`${testID}_title`}
                      marginTop={6}
                      fontSize="2xl"
                      color={colors.green}
                      style={styles.text}
                    >
                      Patient Information
                    </Text>

                    <Box mt="3.5" mb="3.5" overflow="hidden" rounded="lg">
                      <Center>
                        <Pressable onPress={pickImage('UploadProfilePicture')}>
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

                  <InputField
                    testID={`${testID}_FirstName`}
                    isRequired
                    title={'First Name'}
                    value={patient.FirstName}
                    onChangeText={handleFormData('FirstName')}
                    onEndEditing={handleFirstNameError}
                    dataType="name"
                  />

                  <InputField
                    testID={`${testID}_LastName`}
                    isRequired
                    title={'Last Name'}
                    value={patient.LastName}
                    onChangeText={handleFormData('LastName')}
                    onEndEditing={handleLastNameError}
                    dataType="name"
                  />

                  <InputField
                    testID={`${testID}_PreferredName`}
                    isRequired
                    title={'Preferred Name'}
                    value={patient.PreferredName}
                    onChangeText={handleFormData('PreferredName')}
                    onEndEditing={handlePrefNameError}                    
                    dataType="name"
                    otherProps={{prefNameList: prefNames}}
                  />
                  
                  <SelectionInputField
                    testID={`${testID}_PreferredLanguageListID`}
                    isRequired
                    title={'Preferred Language'}
                    placeholder={'Select Language'}
                    onDataChange={handleFormData('PreferredLanguageListID')}
                    value={patient.PreferredLanguageListID}
                    dataArray={listOfLanguages}
                    onEndEditing={handlePrefLanguageError}
                  /> 

                  <SensitiveInputField
                    testID={`${testID}_NRIC`}
                    isRequired
                    title={'NRIC'}
                    autoCapitalize="characters"
                    value={patient.NRIC}
                    onChangeText={handleFormData('NRIC')}
                    onEndEditing={handleNRICError}
                    dataType="nric"
                    maxLength={9}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      testID={`${testID}_DOB`}
                      isRequired
                      selectionMode={'DOB'}
                      title={'Date of Birth'}
                      value={patient.DOB}
                      hideDayOfWeek={true}
                      handleFormData={handleFormData('DOB')}
                      onEndEditing={handleDOBError}
                    />
                  </View>             

                  <RadioButtonInput
                    testID={`${testID}_Gender`}
                    isRequired
                    title={'Gender'}
                    value={patient.Gender}
                    onChangeData={handleFormData('Gender')}
                    onEndEditing={handleGenderError}
                    dataArray={listOfGenders}
                  />

                  <InputField
                    testID={`${testID}_Address`}
                    isRequired
                    title={'Address'}
                    value={patient.Address}
                    dataType="address"
                    onChangeText={handleFormData('Address')}
                    onEndEditing={handleAddrError}
                  />
                  
                  <InputField
                    testID={`${testID}_PostalCode`}
                    isRequired
                    title={'Postal Code'}
                    value={patient.PostalCode}
                    onChangeText={handleFormData('PostalCode')}
                    onEndEditing={handlePostalCodeError}
                    dataType='postal code'
                    keyboardType='numeric'
                    maxLength={6}
                  />

                  <InputField
                    testID={`${testID}_TempAddress`}
                    title={'Temporary Address'}
                    value={patient.TempAddress}
                    dataType="address"
                    onChangeText={handleFormData('TempAddress')}
                    onEndEditing={handleTempAddrError}
                  />

                  <InputField
                    testID={`${testID}_TempPostalCode`}
                    isRequired={patient.TempAddress.length > 0}
                    title={'Temporary Postal Code'}
                    value={patient.TempPostalCode}
                    onChangeText={handleFormData('TempPostalCode')}
                    onEndEditing={handleTempPostalCodeError}
                    dataType='postal code'
                    keyboardType='numeric'
                    maxLength={6}
                  />
                  <InputField
                    testID={`${testID}_HomeNo`}
                    title={'Home Telephone No.'}
                    value={patient.HomeNo}
                    onChangeText={handleFormData('HomeNo')}
                    onEndEditing={handleHomeNoError}
                    dataType={'home phone'}
                    keyboardType='numeric'
                    maxLength={8}
                  />

                  <InputField
                    testID={`${testID}_HandphoneNo`}
                    title={'Mobile No.'}
                    value={patient.HandphoneNo}
                    onChangeText={handleFormData('HandphoneNo')}
                    onEndEditing={handleMobileNoError}
                    dataType={'mobile phone'}
                    keyboardType='numeric'                      
                    maxLength={8}
                  />                

                  <RadioButtonInput
                    testID={`${testID}_IsRespiteCare`}
                    isRequired
                    title={'Respite Care'}
                    value={patient.IsRespiteCare}
                    onChangeData={handleFormData('IsRespiteCare')}
                    dataArray={listOfRespiteCare}
                    onEndEditing={handleRespiteError}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      testID={`${testID}_StartDate`}
                      isRequired
                      title={'Start Date'}
                      value={patient.StartDate}
                      hideDayOfWeek={true}
                      handleFormData={handleFormData('StartDate')}
                      onEndEditing={handleJoiningError}
                      minimumInputDate={minimumJoiningDate}
                      maximumInputDate={maximumJoiningDate}
                    />
                  </View>

                  <SingleOptionCheckBox
                    testID={`${testID}_isChecked`}
                    title={'Check this box to specify End Date'}
                    value={patient.IsChecked}
                    onChangeData={handleFormData('IsChecked')}
                    accessibilityText={
                      'Do you wish to key in the Date of Leaving?'
                    }
                  />

                  {/* Rendered only when the specify date of leaving checkbox is selected. */}
                  {patient.IsChecked ? (
                    <View style={styles.dateSelectionContainer}>
                      <DateInputField
                        testID={`${testID}_EndDate`}
                        title={'End Date'}
                        value={patient.EndDate}
                        handleFormData={handleFormData('EndDate')}
                        hideDayOfWeek={true}
                        onEndEditing={handleLeavingError}
                        allowNull
                        minimumInputDate={minimumJoiningDate}
                        maximumInputDate={maximumJoiningDate}
                        centerDate
                      />
                    </View>
                  ) : null}
                </View>
              </VStack>
            </Box>

            <AddPatientBottomButtons
              testID={`${testID}_bottomBtns`}
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
    width: '100%',
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
