import React from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Select,
  Divider,
  VStack,
  Center,
  Checkbox,
  HStack,
} from 'native-base';
import { StyleSheet, Platform } from 'react-native';

import ErrorMessage from 'app/components/ErrorMessage';
import CustomFormControl from 'app/components/CustomFormControl';

import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientGuardian({
  i,
  title,
  formData,
  handleFormData,
  errorMessage,
}) {
  const page = 'guardianInfo';
  const guardian = formData.guardianInfo[i]; //guardianInfo[0].FirstName

  const isOptional = () => {
    return guardian.IsChecked ? '' : '(Optional)';
  };

  // constant values for relationships
  const listOfRelationships = [
    { list_RelationshipID: 1, value: 'Husband' },
    { list_RelationshipID: 2, value: 'Wife' },
    { list_RelationshipID: 3, value: 'Child' },
    { list_RelationshipID: 4, value: 'Parent' },
    { list_RelationshipID: 5, value: 'Sibling' },
    { list_RelationshipID: 6, value: 'Grandchild' },
    { list_RelationshipID: 7, value: 'Friend' },
    { list_RelationshipID: 8, value: 'Nephew' },
    { list_RelationshipID: 9, value: 'Niece' },
    { list_RelationshipID: 10, value: 'Aunt' },
    { list_RelationshipID: 11, value: 'Uncle' },
    { list_RelationshipID: 12, value: 'Grandparent' },
  ];

  return (
    <Box w="100%">
      <VStack>
        <Center>
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

          <CustomFormControl
            isRequired
            isInvalid={[`[${i}].FirstName`] in errorMessage}
            title="Guardian First Name"
            value={guardian.FirstName}
            onChangeText={handleFormData(page, 'FirstName', i)}
            placeholder="Guardian First Name"
            ErrorMessage={errorMessage[`[${i}].FirstName`]}
          />

          <CustomFormControl
            isRequired
            isInvalid={[`[${i}].LastName`] in errorMessage}
            title="Guardian Last Name"
            value={guardian.LastName}
            onChangeText={handleFormData(page, 'LastName', i)}
            placeholder="Guardian Last Name"
            ErrorMessage={errorMessage[`[${i}].LastName`]}
          />

          <CustomFormControl
            isRequired
            isInvalid={[`[${i}].NRIC`] in errorMessage}
            title="Guardian NRIC"
            value={guardian.NRIC}
            onChangeText={handleFormData(page, 'NRIC', i)}
            placeholder="Guardian NRIC"
            ErrorMessage={errorMessage[`[${i}].NRIC`]}
            maxLength={9}
          />

          <FormControl w="80%" mt="5" isRequired>
            <FormControl.Label _text={styles.text}>
              Guardian is Patient's
            </FormControl.Label>
            <Select
              accessibilityLabel="Select Relationship"
              borderRadius="25"
              fontFamily={
                Platform.OS === 'ios' ? typography.ios : typography.android
              }
              height="50"
              minWidth="full"
              minHeight="3%"
              placeholderTextColor={colors.medium}
              size="18"
              placeholder="Select Relationship"
              selectedValue={guardian.RelationshipID}
              onValueChange={handleFormData(page, 'RelationshipID', i)}
            >
              {listOfRelationships.map((item) => (
                <Select.Item
                  key={item}
                  label={item.value}
                  value={item.list_RelationshipID}
                />
              ))}
            </Select>
          </FormControl>
          <Box>
            <ErrorMessage
              visible={[`[${i}].RelationshipID`] in errorMessage}
              message={errorMessage[`[${i}].RelationshipID`]}
            />
          </Box>

          <CustomFormControl
            isRequired
            isInvalid={[`[${i}].ContactNo`] in errorMessage}
            title="Guardian's Handphone No."
            value={guardian.ContactNo}
            onChangeText={handleFormData(page, 'ContactNo', i)}
            placeholder="Guardian's Handphone Number"
            ErrorMessage={errorMessage[`[${i}].ContactNo`]}
            maxLength={8}
            keyboardType="numeric"
          />

          <FormControl w="80%" mt="5">
            <HStack justifyContent="space-between" alignItems="center">
              <Box w="80%">
                <FormControl.Label _text={styles.text}>
                  Check this box to specify Guardian wants to Log In
                </FormControl.Label>
              </Box>

              <Checkbox
                isChecked={guardian.IsChecked}
                value={guardian.IsChecked}
                onChange={handleFormData(page, 'IsChecked', i)}
                aria-label=" Do you wish to key in the Date of Leaving?"
                _checked={{ bgColor: colors.green }}
              />
            </HStack>
          </FormControl>

          <CustomFormControl
            isRequired={isOptional() == '(Optional)' ? false : true}
            isInvalid={[`[${i}].Email`] in errorMessage}
            title={'Guardian Email'}
            value={guardian.Email}
            onChangeText={handleFormData(page, 'Email', i)}
            placeholder={`Guardian Email ${isOptional()}`}
            ErrorMessage={errorMessage[`[${i}].Email`]}
          />
        </Center>
      </VStack>
    </Box>
  );
}
const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontFamily: `${
      Platform.OS === 'ios' ? typography.ios : typography.android
    }`,
  },
});
export default AddPatientGuardian;
