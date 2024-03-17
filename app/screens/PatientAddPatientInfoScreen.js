// Base
import React, { useState, useEffect, useContext } from 'react';
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
import { parseSelectOptions } from 'app/utility/miscFunctions';

// Components
import AddPatientProgress from 'app/components/AddPatientProgress';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import DateInputField from 'app/components/DateInputField';
import SelectionInputField from 'app/components/input-fields/SelectionInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import ActivityIndicator from 'app/components/ActivityIndicator';
import InputField from 'app/components/input-fields/InputField';
import SensitiveInputField from 'app/components/input-fields/SensitiveInputField';

// APIs
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';

function PatientAddPatientInfoScreen({
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
      'Cantonese',
      'English',
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
  const [isHomeTeleError, setIsHomeNoError] = useState(false);
  const [isMobileError, setIsMobileNoError] = useState(false);
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isPrefLanguageError, setPrefLanguageError] = useState(false);
  const [isRespiteError, setIsRespiteError] = useState(false);
  const [isJoiningError, setIsJoiningError] = useState(false);
  const [isLeavingError, setIsLeavingError] = useState(false);

  // Maximum and minimum valid joining dates
  const minimumJoiningDate = new Date();
  minimumJoiningDate.setDate(minimumJoiningDate.getDate() - 30); // 30 days ago
  const maximumJoiningDate = new Date();
  maximumJoiningDate.setDate(maximumJoiningDate.getDate() + 30); // 30 days later

  // Used for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];
  const listRespiteCare = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  // Functions for error state reporting for the child components
  const handleFirstNameError = (e) => {
    setIsFirstNameError(e);
    // console.log("first name", e)
  };

  const handleLastNameError = (e) => {
    setIsLastNameError(e);
    // console.log("last name", e)
  }
    
  const handleNRICError = (e) => {
    setIsNRICError(e);
    // console.log("nric", e)
  }
  
  const handleDOBError = (e) => {
    setIsDOBError(e);
    // console.log("dob", e)
  }

  const handleGenderError = (e) => {
    setIsGenderError(e);
    // console.log("gender", e)
  }  

  
  const handleAddrError = (e) => {
    setIsAddrError(e);
    // console.log("addr", e)
  }

  const handlePostalCodeError = (e) => {
    setIsPostalCodeError(e);
    // console.log("addr", e)
  }
  
  const handleTempAddrError = (e) => {
    setIsTempAddrError(e);
    // console.log("temp addr", e)
  }

  const handleTempPostalCodeError = (e) => {
    setIsTempPostalCodeError(e);
    // console.log("addr", e)
  }
  
  const handleHomeNoError = (e) => {
    setIsHomeNoError(e);
    // console.log("home", e)
  };

  const handleMobileNoError = (e) => {
    setIsMobileNoError(e);
    // console.log("mobile", e)
  }
  
  const handlePrefNameError = (e) => {
    setIsPrefNameError(e);
    // console.log("pref name", e)
  }
  
  const handlePrefLanguageError = (e) => {
    setPrefLanguageError(e);
    // console.log("language", e)
  }

  const handleRespiteError = (e) => {
    setIsRespiteError(e);
    // console.log("respite", e)
  };

  const handleJoiningError = (e) => {
    setIsJoiningError(e);
    // console.log("joining", e)
  };

  const handleLeavingError = (e) => {
    setIsLeavingError(e);
    // console.log("leaving", e)
  };

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
      isHomeTeleError ||
      isMobileError ||
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
    isHomeTeleError,
    isMobileError,
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
  }, []);

  console.log(isTempPostalCodeError)

  const [isPrefNamesLoading, setIsPrefNamesLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [prefNames, setPrefNames] = useState([]);

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

  return isLoading || isPrefNamesLoading ? (
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
                    isRequired
                    title={'First Name'}
                    value={patient.FirstName}
                    onChangeText={handleFormData('FirstName')}
                    onEndEditing={handleFirstNameError}
                    dataType="name"
                  />

                  <InputField
                    isRequired
                    title={'Last Name'}
                    value={patient.LastName}
                    onChangeText={handleFormData('LastName')}
                    onEndEditing={handleLastNameError}
                    dataType="name"
                  />

                  <SensitiveInputField
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
                    isRequired
                    title={'Gender'}
                    value={patient.Gender}
                    onChangeData={handleFormData('Gender')}
                    onEndEditing={handleGenderError}
                    dataArray={listOfGenders}
                  />

                  <InputField
                    isRequired
                    title={'Address'}
                    value={patient.Address}
                    onChangeText={handleFormData('Address')}
                    onEndEditing={handleAddrError}
                  />
                  
                  <InputField
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
                    title={'Temporary Address'}
                    value={patient.TempAddress}
                    onChangeText={handleFormData('TempAddress')}
                    onEndEditing={handleTempAddrError}
                  />

                  <InputField
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
                    title={'Home Telephone No.'}
                    value={patient.HomeNo}
                    onChangeText={handleFormData('HomeNo')}
                    onEndEditing={handleHomeNoError}
                    dataType={'home phone'}
                    keyboardType='numeric'
                    maxLength={8}
                  />

                  <InputField
                    title={'Mobile No.'}
                    value={patient.HandphoneNo}
                    onChangeText={handleFormData('HandphoneNo')}
                    onEndEditing={handleMobileNoError}
                    dataType={'mobile phone'}
                    keyboardType='numeric'                      
                    maxLength={8}
                  />                  

                  <InputField
                    isRequired
                    title={'Preferred Name'}
                    value={patient.PreferredName}
                    onChangeText={handleFormData('PreferredName')}
                    onEndEditing={handlePrefNameError}                    
                    dataType="name"
                    otherProps={{prefNameList: prefNames}}
                  />
                  
                  <SelectionInputField
                    isRequired
                    title={'Preferred Language'}
                    placeholder={'Select Language'}
                    onDataChange={handleFormData('PreferredLanguageListID')}
                    value={patient.PreferredLanguageListID}
                    dataArray={listOfLanguages}
                    onEndEditing={handlePrefLanguageError}
                  />                 

                  <RadioButtonInput
                    isRequired
                    title={'Respite Care'}
                    value={patient.IsRespiteCare}
                    onChangeData={handleFormData('IsRespiteCare')}
                    dataArray={listRespiteCare}
                    onEndEditing={handleRespiteError}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      isRequired
                      title={'Date of Joining'}
                      value={patient.StartDate}
                      hideDayOfWeek={true}
                      handleFormData={handleFormData('StartDate')}
                      onEndEditing={handleJoiningError}
                      minimumInputDate={minimumJoiningDate}
                      maximumInputDate={maximumJoiningDate}
                    />
                  </View>

                  <SingleOptionCheckBox
                    title={'Check this box to specify Date of Leaving'}
                    value={patient.IsChecked}
                    onChangeData={handleFormData('IsChecked')}
                    accessibilityText={
                      'Do you wish to key in the Date of Leaving?'
                    }
                  />

                  {/* Rendered only when the specify date of leaving checkbox is selected. */}
                  {formData.patientInfo.IsChecked ? (
                    <DateInputField
                      title={'Date of Leaving'}
                      handleFormData={handleFormData('EndDate')}
                      hideDayOfWeek={true}
                      value={patient.EndDate}
                      onEndEditing={handleLeavingError}
                    />
                  ) : null}
                </View>
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
