// Libs
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, Divider, VStack } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import NameInputField from 'app/components/NameInputField';
import NRICInputField from 'app/components/NRICInputField';
import SelectionInputField from 'app/components/SelectionInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import SingleOptionCheckBox from 'app/components/SingleOptionCheckBox';
import EmailInputField from 'app/components/EmailInputField';
import LoadingWheel from 'app/components/LoadingWheel';
import CommonInputField from 'app/components/CommonInputField';
import DateInputField from 'app/components/DateInputField';
import RadioButtonInput from 'app/components/RadioButtonsInput';

function AddPatientGuardian({ i, title, formData, handleFormData, onError }) {
  const { data, isError, isLoading } = useGetSelectionOptions('Relationship');
  // console.log('formData.guardianInfo: ', i, formData.guardianInfo);
  const page = 'guardianInfo';
  const guardian = formData.guardianInfo[i]; //guardianInfo[0].FirstName
  // console.log(String(guardian) + ' ' + guardian.IsChecked);
  // console.log(guardian.IsChecked, '\n');

  // constant values for relationships
  const [listOfRelationships, setListOfRelationships] = useState([
    { value: 1, label: 'Husband' },
    { value: 2, label: 'Wife' },
    { value: 3, label: 'Child' },
    { value: 4, label: 'Parent' },
    { value: 5, label: 'Sibling' },
    { value: 6, label: 'Grandchild' },
    { value: 7, label: 'Friend' },
    { value: 8, label: 'Nephew' },
    { value: 9, label: 'Niece' },
    { value: 10, label: 'Aunt' },
    { value: 11, label: 'Uncle' },
    { value: 12, label: 'Grandparent' },
  ]);

  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  const [isInputErrors, setIsInputErrors] = useState(false);

  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isRelationError, setIsRelationError] = useState(false);
  const [isPhoneError, setIsPhoneError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);
  const [isTempAddrError, setIsTempAddrError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  const [isDOBError, setIsDOBError] = useState(false);
  const [isGenderError, setIsGenderError] = useState(false);

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
      // console.log('LastName: ', state);
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
  const handleRelationState = useCallback(
    (state) => {
      setIsRelationError(state);
      // console.log('Relation: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRelationError],
  );
  const handlePhoneState = useCallback(
    (state) => {
      setIsPhoneError(state);
      // console.log('Phone: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPhoneError],
  );
  const handleEmailState = useCallback(
    (state) => {
      setIsEmailError(state);
      // console.log('Email: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEmailError],
  );

  const handleTempAddrState = useCallback(
    (state) => {
      setIsTempAddrError(state);
      // console.log('Email: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTempAddrError],
  );

  const handleAddrState = useCallback(
    (state) => {
      setIsAddrError(state);
      // console.log('Email: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAddrError],
  );

  const handleDOBState = useCallback(
    (state) => {
      setIsDOBError(state);
      // console.log('DOB: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDOBError],
  );

  const handleGenderState = useCallback(
    (state) => {
      setIsGenderError(state);
      // console.log('LastName: ', state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGenderError],
  );

  useEffect(() => {
    setIsInputErrors(
      isFirstNameError ||
        isLastNameError ||
        isNRICError ||
        isPhoneError ||
        isRelationError ||
        isEmailError ||
        isLoginError ||
        isTempAddrError ||
        isAddrError ||
        isDOBError ||
        isGenderError ||
        isPrefNameError,
    );
    onError(i, isInputErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isPhoneError,
    isRelationError,
    isEmailError,
    isInputErrors,
    isLoginError,
    isAddrError,
    isTempAddrError,
    isDOBError,
    isPrefNameError,
    isGenderError,
  ]);
  // To ensure that when the is guardian login required checkbox is checked, guardian email
  // must be filled before continuing. Done by verifying if guardian.Email is empty or not.
  // console.log(i);
  useEffect(() => {
    setIsLoginError(() => {
      if (guardian.IsChecked && guardian.Email === '') {
        return true;
      } else {
        return false;
      }
    });
  }, [guardian.IsChecked, guardian.Email]);

  /* If retrieval from the hook is successful, replace the content in
     listOfLanguages with the retrieved one. */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setListOfRelationships(data);
    }
  }, [data, isError, isLoading]);

  return isLoading ? (
    <LoadingWheel />
  ) : (
    <Box w="100%">
      <VStack>
        {/* <Center> */}
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            {title == 1 ? null : <Divider w="80%" mt={10} />}
            <Text
              marginTop={6}
              bold
              fontSize="2xl"
              color={colors.green}
              style={styles.text}
            >
              Guardian Information {title}
            </Text>
          </View>
          <NameInputField
            isRequired
            title={'Guardian First Name'}
            value={guardian.FirstName}
            onChangeText={handleFormData(page, 'FirstName', i)}
            onChildData={handleFirstNameState}
          />

          <NameInputField
            isRequired
            title={'Guardian Last Name'}
            value={guardian.LastName}
            onChangeText={handleFormData(page, 'LastName', i)}
            onChildData={handleLastNameState}
          />

          <NameInputField
            isRequired
            title={'Guardian Preferred Name'}
            value={guardian.PreferredName}
            onChangeText={handleFormData(page, 'PreferredName', i)}
            onChildData={handlePrefNameState}
          />

          <NRICInputField
            isRequired
            title={'Guardian NRIC'}
            value={guardian.NRIC}
            onChangeText={handleFormData(page, 'NRIC', i)}
            onChildData={handleNRICState}
            maxLength={9}
          />

          <RadioButtonInput
            isRequired
            title={'Guardian Gender'}
            value={guardian.Gender}
            onChangeData={handleFormData(page, 'Gender', i)}
            onChildData={handleGenderState}
            dataArray={listOfGenders}
          />

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              isRequired
              selectionMode={'DOB'}
              title={'Date of Birth'}
              value={guardian.DOB}
              handleFormData={handleFormData(page, 'DOB', i)}
              onChildData={handleDOBState}
            />
          </View>

          <SelectionInputField
            isRequired
            title={'Relationship'}
            placeholderText={'Select Relationship'}
            onDataChange={handleFormData(page, 'RelationshipID', i)}
            value={guardian.RelationshipID}
            dataArray={listOfRelationships}
            onChildData={handleRelationState}
          />

          <TelephoneInputField
            isRequired
            title={"Guardian's Handphone No."}
            value={guardian.ContactNo}
            onChangeText={handleFormData(page, 'ContactNo', i)}
            onChildData={handlePhoneState}
            maxLength={8}
          />

          <CommonInputField
            isRequired
            title={'Address'}
            value={guardian.Address}
            onChangeText={handleFormData(page, 'Address', i)}
            onChildData={handleAddrState}
          />

          <CommonInputField
            title={'Temporary Address (optional)'}
            value={guardian.TempAddress}
            onChangeText={handleFormData(page, 'TempAddress', i)}
            onChildData={handleTempAddrState}
          />

          <SingleOptionCheckBox
            title={'Check this box to specify Guardian wants to log in'}
            value={guardian.IsChecked}
            onChangeData={handleFormData(page, 'IsChecked', i)}
          />

          <EmailInputField
            isRequired={guardian.IsChecked}
            title={'Guardian Email'}
            value={guardian.Email}
            onChangeText={handleFormData(page, 'Email', i)}
            onChildData={handleEmailState}
          />
        </View>
        {/* </Center> */}
      </VStack>
    </Box>
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
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
  dateSelectionContainer: {
    width: '70%',
  },
});
export default AddPatientGuardian;
