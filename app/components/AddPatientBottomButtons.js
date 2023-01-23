import React from 'react';
import { Box, Button, Flex, Spacer, Icon, HStack } from 'native-base';
import colors from 'app/config/colors';
import { MaterialIcons } from '@expo/vector-icons';
import patientApi from 'app/api/patient';

function AddPatientBottomButtons({
  list = null,
  nextQuestionHandler = null,
  prevQuestionHandler = null,
  addComponent = null,
  removeComponent = null,
  submit = false,
  formData = null,
  max = null,
}) {
  const onPressSubmit = async () => {
    const result = await patientApi.addPatient(formData);
    console.log(result);
  };

  return (
    <Box mt={8} mb={8}>
      <Flex w="75%" direction="row">
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
            onPress={nextQuestionHandler}
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
