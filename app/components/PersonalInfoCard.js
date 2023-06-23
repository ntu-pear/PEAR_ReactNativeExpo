// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { Box, VStack } from 'native-base';

// Configurations
import typography from 'app/config/typography';

//Components
import NameInputField from 'appcomponentsNameInputField';
import NRICInputField from 'appcomponentsNRICInputField';
import RadioButtonInput from 'appcomponentsRadioButtonsInput';
import DateInputField from 'appcomponentsDateInputField';
import CommonInputField from 'appcomponentsCommonInputField';

function PersonalInfoCard({
  handleFirstNameData,
  handleLastNameData,
  handleNRICData,
  handleGenderData,
  handleDOBData,
  handleAddressData,
  formData,
  onError,
  isDisabled,
}) {
  const listOfGenders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  // error state for component
  const [isInputErrors, setIsInputErrors] = useState(false);

  // error states for child components
  const [isFirstNameError, setIsFirstNameError] = useState(false);
  const [isLastNameError, setIsLastNameError] = useState(false);
  const [isNRICError, setIsNRICError] = useState(false);
  const [isAddrError, setIsAddrError] = useState(false);
  //   const [isDOBError, setIsDOBError] = useState(false);
  //   const [isGenderError, setIsGenderError] = useState(false);

  // Error state handling for child components
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

  // Error state handling for this component
  useEffect(() => {
    setIsInputErrors(
      isFirstNameError || isLastNameError || isNRICError || isAddrError,
    );
    // console.log(isInputErrors);
    onError(isInputErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFirstNameError,
    isLastNameError,
    isNRICError,
    isAddrError,
    isInputErrors,
  ]);

  return (
    <Box w="100%">
      <VStack>
        <View style={styles.formContainer}>
          <NameInputField
            isRequired={isDisabled}
            title={'First Name'}
            value={formData.FirstName}
            onChangeText={handleFirstNameData}
            onChildData={handleFirstNameState}
            isDisabled={isDisabled}
          />

          <NameInputField
            isRequired={isDisabled}
            title={'Last Name'}
            value={formData.LastName}
            onChangeText={handleLastNameData}
            onChildData={handleLastNameState}
            isDisabled={isDisabled}
          />

          <NRICInputField
            isRequired={isDisabled}
            title={'NRIC'}
            value={formData.NRIC}
            onChangeText={handleNRICData}
            onChildData={handleNRICState}
            isDisabled={isDisabled}
          />
          {isDisabled ? (
            <CommonInputField
              title={'Gender'}
              value={formData.Gender}
              isDisabled={isDisabled}
              //   onChangeText={handleAddressData}
              //   onChildData={handleAddrState}
            />
          ) : (
            <RadioButtonInput
              isRequired={isDisabled}
              title={'Gender'}
              value={formData.Gender}
              onChangeData={handleGenderData}
              dataArray={listOfGenders}
            />
          )}

          <View style={styles.dateSelectionContainer}>
            <DateInputField
              isRequired={isDisabled}
              selectionMode={'DOB'}
              title={'Date of Birth'}
              value={formData.DOB}
              handleFormData={handleDOBData}
              isDisabled={isDisabled}
            />
          </View>

          <CommonInputField
            isRequired={isDisabled}
            title={'Address'}
            value={formData.Address}
            onChangeText={handleAddressData}
            onChildData={handleAddrState}
          />
        </View>
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

export default PersonalInfoCard;
