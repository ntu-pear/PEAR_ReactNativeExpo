import React from 'react';
import { Box, Button, Flex, Spacer, Icon, HStack } from 'native-base';
import { Alert, Platform, StyleSheet } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import patientApi from 'app/api/patient';
import { useNavigation } from '@react-navigation/native';
import routes from 'app/navigation/routes';
import { useNavigate } from 'react-router-dom';

import AppButton from 'app/components/AppButton';

import colors from 'app/config/colors';

function AddPatientBottomButtons({
  list = null,
  nextQuestionHandler = null,
  prevQuestionHandler = null,
  addComponent = null,
  removeComponent = null,
  submit = false,
  formData = null,
  max = null,
  validateStep = null,
  isNextDisabled,
}) {
  const navigation = useNavigation();

  // useNavigate() hook cannot work on mobile
  // eslint-disable-next-line
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const onPressSubmit = async () => {
    const promiseResult = await validateStep(formData);
    console.log(promiseResult, formData);

    if (promiseResult.success) {
      console.log('success');
      const result = await patientApi.addPatient(formData);

      let alertTxt = '';
      let alertTitle = '';
      let alertDetails = '';

      console.log('response: ', result);

      if (result.ok) {
        const allocations = result.data.data.patientAllocationDTO;
        const caregiver = allocations.caregiverName;
        const doctor = allocations.doctorName;
        const gameTherapist = allocations.gameTherapistName;

        alertTitle = 'Successfully added Patient';
        alertDetails = `Patient has been allocated to\nCaregiver: ${caregiver}\nDoctor: ${doctor}\nGame Therapist: ${gameTherapist}`;
        alertTxt = alertTitle + alertDetails;
        Platform.OS === 'web'
          ? navigate('/' + routes.PATIENTS)
          : navigation.navigate(routes.PATIENTS_SCREEN);
      } else {
        const errors = result.data?.message;

        result.data
          ? (alertDetails = `\n${errors}\n\nPlease try again.`)
          : (alertDetails = 'Please try again.');

        alertTitle = 'Error in Adding Patient';
        alertTxt = alertTitle + alertDetails;
      }
      Platform.OS === 'web'
        ? alert(alertTxt)
        : Alert.alert(alertTitle, alertDetails);
    }
  };

  return (
    <Box mt={8} mb={8}>
      <Flex w={Platform.OS === 'web' ? 40 : '80%'} direction="row">
        <Button
          width={12}
          height={12}
          bg={colors.green}
          leftIcon={
            <Icon as={<MaterialIcons name="chevron-left" />} color="white" />
          }
          isDisabled={prevQuestionHandler == null ? true : false}
          onPress={
            prevQuestionHandler == null ? true : () => prevQuestionHandler()
          }
          borderRadius="full"
        />

        <Spacer />
        {list ? (
          list.length === 1 ? (
            <Button
              width={12}
              height={12}
              variant="outline"
              colorScheme="success"
              borderRadius="full"
              onPress={addComponent}
            >
              +
            </Button>
          ) : list.length === max ? (
            <Box>
              <HStack space={4}>
                <Button
                  width={12}
                  height={12}
                  variant="outline"
                  colorScheme="secondary"
                  borderRadius="full"
                  onPress={removeComponent}
                >
                  -
                </Button>
              </HStack>
            </Box>
          ) : (
            <Box>
              <HStack space={4}>
                <Button
                  width={12}
                  height={12}
                  variant="outline"
                  colorScheme="success"
                  borderRadius="full"
                  onPress={addComponent}
                >
                  +
                </Button>
                <Button
                  width={12}
                  height={12}
                  variant="outline"
                  colorScheme="secondary"
                  borderRadius="full"
                  onPress={removeComponent}
                >
                  -
                </Button>
              </HStack>
            </Box>
          )
        ) : null}
        <Spacer />
        <Button
          width={12}
          height={12}
          bg={colors.green}
          leftIcon={
            <Icon as={<MaterialIcons name="chevron-right" />} color="white" />
          }
          // Disable the buttons when there is no next page or when page has errors -- Justin
          isDisabled={
            nextQuestionHandler == null || isNextDisabled ? true : false
          }
          onPress={
            nextQuestionHandler == null
              ? true
              : () => nextQuestionHandler(formData)
          }
          borderRadius="full"
          list={list}
        />
      </Flex>
      {submit ? (
        <Box mt={8}>
          <AppButton title="Submit" color="green" onPress={onPressSubmit} />
        </Box>
      ) : null}
    </Box>
  );
}

export default AddPatientBottomButtons;
