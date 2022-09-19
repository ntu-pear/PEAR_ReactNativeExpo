import React, { useState } from 'react';
import {
  Box,
  Input,
  Icon,
  FormControl,
  Text,
  Button,
  HStack,
  ScrollView,
  Progress,
  Divider,
  Select,
  VStack,
} from 'native-base';
import AddPatientGuardian from 'app/components/AddPatientGuardian';

export function PatientAddSecondScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;
  const [addGuardianList, setGuardianList] = useState([{ title: '' }]);
  const addNewGuardianComponent = () => {
    setGuardianList([...addGuardianList, { title: '' }]);
  };

  const removeGuardianComponent = (index) => {
    const list = [...addGuardianList];
    list.splice(index, 1);
    setGuardianList(list);
  };
  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <Box marginTop={10}>
            <Progress colorScheme="primary" value={50} />
          </Box>
          {addGuardianList
            ? addGuardianList.map((item, index) => (
                <Box>
                  <AddPatientGuardian title={index + 1} />
                </Box>
              ))
            : null}
        </Box>

        {addGuardianList.length === 1 ? (
          <Button
            mt={2}
            width={10}
            variant="outline"
            colorScheme="success"
            borderRadius="full"
            onPress={addNewGuardianComponent}
          >
            +
          </Button>
        ) : (
          <Box mt={2}>
            <HStack mt={4} space={4}>
              <Button
                width={10}
                variant="outline"
                colorScheme="success"
                borderRadius="full"
                onPress={addNewGuardianComponent}
              >
                +
              </Button>
              <Button
                width={10}
                variant="outline"
                colorScheme="secondary"
                borderRadius="full"
                onPress={removeGuardianComponent}
              >
                -
              </Button>
            </HStack>
          </Box>
        )}

        <Box mt={2}>
          <HStack space={4}>
            <Button w="20" onPress={prevQuestionHandler}>
              Previous
            </Button>
            <Button w="20" onPress={nextQuestionHandler}>
              Next
            </Button>
          </HStack>
        </Box>
      </Box>
    </ScrollView>
  );
}
