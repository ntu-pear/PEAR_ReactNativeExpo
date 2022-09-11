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
  Radio,
  Select,
} from 'native-base';

export function PatientAddThirdScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <Box marginTop={10}>
            <Progress colorScheme="primary" value={75} />
          </Box>
          <Text textAlign="center" marginTop={6} bold fontSize="2xl">
            Lorem Ipsum
          </Text>

          <FormControl marginTop={4}>
            <FormControl.Label>Guardian Name</FormControl.Label>
            <Input placeholder="Guardian Name" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Guardian NRIC</FormControl.Label>
            <Input placeholder="Guardian NRIC" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Relation to Patient</FormControl.Label>
            <Select placeholder="Select">
              <Select.Item label="Parent" value="parent" />
              <Select.Item label="Child" value="child" />
            </Select>
          </FormControl>

          <FormControl>
            <FormControl.Label>Guardian Contact </FormControl.Label>
            <Input placeholder="Guardian Contact" />
          </FormControl>

          <FormControl>
            <FormControl.Label>Guardian Email </FormControl.Label>
            <Input placeholder="Guardian Email" />
          </FormControl>
        </Box>

        <Box margin="10">
          <HStack space={4}>
            <Button w="20" onPress={prevQuestionHandler}>
              Previous
            </Button>
          </HStack>
        </Box>
      </Box>
    </ScrollView>
  );
}
