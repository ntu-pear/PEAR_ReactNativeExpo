// Libs
import React from 'react';
import { Platform } from 'react-native';
import { Box, Button, Flex, Spacer, Icon, HStack } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Components
import AppButton from 'app/components/AppButton';

function AddPatientBottomButtons({
  testID='',
  list = null,
  nextQuestionHandler = null,
  prevQuestionHandler = null,
  addComponent = null,
  removeComponent = null,
  submit = false,
  formData = null,
  max = null,
  isAddDisabled = false,
  isSubmitDisabled = false,
  isNextDisabled,
  onSubmit,
}) {
  
  return (
    <Box mt={8} mb={8} testID={testID}>
      <Flex testID={testID} w={Platform.OS === 'web' ? 40 : '80%'} direction="row">
        <Button
          testID={`${testID}_prev`}
          width={12}
          height={12}
          bg={colors.green}
          leftIcon={
            <Icon as={<MaterialIcons name="chevron-left" />} color="white" />
          }
          isDisabled={prevQuestionHandler == null ? true : false}
          accessibilityTraits={prevQuestionHandler == null ? ['button', 'disabled'] : ['button']}
          onPress={
            prevQuestionHandler == null ? true : () => prevQuestionHandler()
          }
          borderRadius="full"
        />

        <Spacer />
        {list ? (
          list.length === 1 ? (
            <Button
              testID={`${testID}_add`}
              width={12}
              height={12}
              variant="outline"
              colorScheme="success"
              borderRadius="full"
              onPress={addComponent}
              isDisabled={isAddDisabled}
              accessibilityTraits={isAddDisabled ? ['button', 'disabled'] : ['button']}
            >
              +
            </Button>
          ) : list.length === max ? (
            <Box>
              <HStack space={4}>
                <Button
                  testID={`${testID}_remove`}
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
                  testID={`${testID}_add`}
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
                  testID={`${testID}_remove`}
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
          testID={`${testID}_next`}
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
          accessibilityTraits={nextQuestionHandler == null || isNextDisabled ? ['button', 'disabled'] : ['button']}
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
          <AppButton 
            testID={`${testID}_submit`}
            title="Submit" 
            color="green" 
            onPress={onSubmit} 
            isDisabled={isSubmitDisabled}
            accessibilityTraits={isSubmitDisabled ? ['button', 'disabled'] : ['button']}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export default AddPatientBottomButtons;
