// Base
import React, { useState, useEffect } from 'react';
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
  const [isHomeTeleError, setIsHomeNoError] = useState(false);
  const [isMobileError, setIsMobileNoError] = useState(false);
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

  // set initial value for SelectionInputField dataArray prop -> follow format of "label" and "value"
  const listOfLanguagesArray = [
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
  ]
  const [listOfLanguages, setListOfLanguages] = useState(parseSelectOptions(listOfLanguagesArray));

  // use for the RadioButtonInput dataArray prop -> follow format of "label" and "value"
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];
  const listRespiteCare = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  /*
  Callback functions for error state reporting for the child components
  */   
  const handleFirstNameError = (e) => {
    setIsFirstNameError(e);
  }

  const handleLastNameError = (e) => {
    setIsLastNameError(e);
  }
  
  const handlePrefNameError = (e) => {
    setIsPrefNameError(e);
  }
  
  const handleNRICError = (e) => {
    setIsNRICError(e);
  }
    
  const handleAddrError = (e) => {
    setIsAddrError(e);
  }
  
  const handleTempAddrError = (e) => {
    setIsTempAddrError(e);
  }
  
  const handleHomeNoError = (e) => {
    setIsHomeNoError(e);
  }
  
  const handleMobileNoError = (e) => {
    setIsMobileNoError(e);
  }
  
  const handleDOBError = (e) => {
    setIsDOBError(e);
  }
  
  const handleJoiningError = (e) => {
    setIsJoiningError(e);
  }
  
  const handleLeavingError = (e) => {
    setIsLeavingError(e);
  }
  
  const handlePrefLanguageError = (e) => {
    setPrefLanguageError(e);
  }
  
  const handleGenderError = (e) => {
    setIsGenderError(e);
  }

  const handleRespiteError = (e) => {
    setIsRespiteError(e);
  }

  /**
   * This useEffect enables the page to show correct error checking
   * The main isInputErrors is responsible for the error state of the screen
   * This state will be true whenever any child input components are in error state.
   */  
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

  /*
  Try to get langugage list from backend. If retrieval from the hook is successful, replace the content in
  listOfLanguages with the retrieved one. 
  */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      console.log('selection data!');
      console.log(data);
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

                  <InputField
                    isRequired
                    title={'First Name'}
                    value={patient.FirstName}
                    onChangeText={handleFormData(page, 'FirstName')}
                    onChildData={handleFirstNameError}
                    dataType="name"
                  />

                  <InputField
                    isRequired
                    title={'Last Name'}
                    value={patient.LastName}
                    onChangeText={handleFormData(page, 'LastName')}
                    onChildData={handleLastNameError}
                    dataType="name"
                  />

                  <InputField
                    isRequired
                    title={'Preferred Name'}
                    value={patient.PreferredName}
                    onChangeText={handleFormData(page, 'PreferredName')}
                    onChildData={handlePrefNameError}                    
                    dataType="name"
                  />

                  <SensitiveInputField
                    isRequired
                    title={'NRIC'}
                    autoCapitalize='characters'
                    value={(patient.NRIC).toString().toUpperCase()}
                    onChangeText={handleFormData(page, 'NRIC')}
                    onChildData={handleNRICError}
                    type="nric"
                  />
                
                 <RadioButtonInput
                    isRequired
                    title={'Gender'}
                    value={patient.Gender}
                    onChangeData={handleFormData(page, 'Gender')}
                    onChildData={handleGenderError}
                    dataArray={listOfGenders}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      isRequired
                      selectionMode={'DOB'}
                      title={'Date of Birth'}
                      value={patient.DOB}
                      handleFormData={handleFormData(page, 'DOB')}
                      onChildData={handleDOBError}
                    />
                  </View>
                  
                  <SelectionInputField
                    isRequired
                    title={'Preferred Language'}
                    placeholder={'Select Language'}
                    onDataChange={handleFormData( 
                      page,
                      'PreferredLanguageListID',
                    )}
                    value={patient.PreferredLanguageListID}
                    dataArray={listOfLanguages}
                    onChildData={handlePrefLanguageError}
                  />

                  <InputField
                    isRequired
                    title={'Address'}
                    value={patient.Address}
                    onChangeText={handleFormData(page, 'Address')}
                    onChildData={handleAddrError}
                  />

                  <InputField
                    title={'Temporary Address'}
                    value={patient.TempAddress}
                    onChangeText={handleFormData(page, 'TempAddress')}
                    onChildData={handleTempAddrError}
                  />

                  <InputField
                    title={'Home Telephone No.'}
                    value={patient.HomeNo}
                    onChangeText={handleFormData(page, 'HomeNo')}
                    onChildData={handleHomeNoError}
                    dataType={'home phone'}
                    keyboardType='numeric'
                  />

                  <InputField
                    title={'Mobile No.'}
                    value={patient.HandphoneNo}
                    onChangeText={handleFormData(page, 'HandphoneNo')}
                    onChildData={handleMobileNoError}
                    dataType={'mobile phone'}
                    keyboardType='numeric'                    
                  />

                  <RadioButtonInput
                    isRequired
                    title={'Respite Care'}
                    value={patient.IsRespiteCare}
                    onChangeData={handleFormData(page, 'IsRespiteCare')}
                    dataArray={listRespiteCare}
                    onChildData={handleRespiteError}
                  />

                  <View style={styles.dateSelectionContainer}>
                    <DateInputField
                      isRequired
                      title={'Date of Joining'}
                      value={patient.StartDate}
                      handleFormData={handleFormData(page, 'StartDate')}
                      onChildData={handleJoiningError}
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
                      onChildData={handleLeavingError}
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
