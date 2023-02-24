import React from 'react';
import { Box, Button, Flex, Spacer, Icon, HStack } from 'native-base';
import colors from 'app/config/colors';
import { MaterialIcons } from '@expo/vector-icons';
import patientApi from 'app/api/patient';
import { useNavigation } from '@react-navigation/native';
import routes from 'app/navigation/routes';
import { Alert, Platform } from 'react-native';
import { useNavigate } from 'react-router-dom';

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
        const errors = result.data.message;
        alertTitle = 'Error in Adding Patient';
        alertDetails = `\n${errors}.\n\nPlease try again.`;
        alertTxt = alertTitle + alertDetails;
      }
      Platform.OS === 'web'
        ? alert(alertTxt)
        : Alert.alert(alertTitle, alertDetails);
    }
  };

  return (
    <Box mt={8} mb={8}>
      <Flex w={Platform.OS === 'web' ? 40 : '75%'} direction="row">
        {prevQuestionHandler == null ? (
          <Button
            bg={colors.green}
            leftIcon={
              <Icon as={<MaterialIcons name="chevron-left" />} color="white" />
            }
            isDisabled
          />
        ) : (
          <Button
            bg={colors.green}
            onPress={prevQuestionHandler}
            leftIcon={
              <Icon as={<MaterialIcons name="chevron-left" />} color="white" />
            }
          />
        )}
        <Spacer />

        {list ? (
          list.length === 1 ? (
            <Button
              width={10}
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
                  width={10}
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
                  width={10}
                  variant="outline"
                  colorScheme="success"
                  borderRadius="full"
                  onPress={addComponent}
                >
                  +
                </Button>
                <Button
                  width={10}
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
        {nextQuestionHandler ? (
          <Button
            bg={colors.green}
            onPress={() => nextQuestionHandler(formData)}
            leftIcon={
              <Icon as={<MaterialIcons name="chevron-right" />} color="white" />
            }
            list={list}
          />
        ) : (
          <Button
            bg={colors.green}
            onPress={nextQuestionHandler}
            leftIcon={
              <Icon as={<MaterialIcons name="chevron-right" />} color="white" />
            }
            isDisabled
          />
        )}
      </Flex>
      {submit ? (
        <Box alignItems="center">
          <Button
            colorScheme="success"
            onPress={onPressSubmit}
            mt={8}
            w={20}
            h={10}
          >
            Submit
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

export default AddPatientBottomButtons;
