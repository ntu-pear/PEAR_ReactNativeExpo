import React from 'react';
import {
  Box,
  Input,
  FormControl,
  Text,
  Select,
  Divider,
  Checkbox,
} from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import ErrorMessage from 'app/components/ErrorMessage';

function AddPatientGuardian({
  i,
  title,
  formData,
  handleFormData,
  errorMessage,
}) {
  const page = 'guardianInfo';
  const guardian = formData.guardianInfo[i]; //guardianInfo[0].FirstName
  // console.log('guardian: ', i, formData.guardianInfo);

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
    <Box>
      {title == 1 ? null : <Divider mt={10} />}
      <Text
        textAlign="center"
        marginTop={6}
        bold
        fontSize="2xl"
        color={colors.green}
      >
        Guardian Information {title}
      </Text>
      <FormControl marginTop={4}>
        <FormControl.Label>Guardian First Name</FormControl.Label>
        <Input
          placeholder="Guardian First Name"
          value={guardian.FirstName}
          onChangeText={handleFormData(page, 'FirstName', i)}
        />
      </FormControl>
      {errorMessage[`[${i}].FirstName`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].FirstName`]} />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Guardian Last Name</FormControl.Label>
        <Input
          placeholder="Guardian Last Name"
          value={guardian.LastName}
          onChangeText={handleFormData(page, 'LastName', i)}
        />
      </FormControl>
      {errorMessage[`[${i}].LastName`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].LastName`]} />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Guardian NRIC</FormControl.Label>
        <Input
          placeholder="Guardian NRIC"
          value={guardian.NRIC}
          maxLength={9}
          onChangeText={handleFormData(page, 'NRIC', i)}
        />
      </FormControl>
      {errorMessage[`[${i}].NRIC`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].NRIC`]} />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Guardian is Patient's</FormControl.Label>
        <Select
          placeholder="Select"
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
      {errorMessage[`[${i}].RelationshipID`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].RelationshipID`]} />
      ) : (
        <></>
      )}

      <FormControl>
        <FormControl.Label>Guardian's Handphone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Handphone Number"
          value={guardian.ContactNo}
          maxLength={8}
          keyboardType="numeric"
          onChangeText={handleFormData(page, 'ContactNo', i)}
        />
      </FormControl>
      {errorMessage[`[${i}].ContactNo`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].ContactNo`]} />
      ) : (
        <></>
      )}
      <FormControl>
        <FormControl.Label>Does Guardian wish to Log In?</FormControl.Label>
        <Checkbox
          isChecked={guardian.IsChecked}
          value={guardian.IsChecked}
          onChange={handleFormData(page, 'IsChecked', i)}
          aria-label="Does Guardian wish to Log In?"
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian Email {isOptional()}</FormControl.Label>
        <Input
          placeholder={`Guardian Email ${isOptional()}`}
          value={guardian.Email}
          onChangeText={handleFormData(page, 'Email', i)}
        />
      </FormControl>
      {errorMessage[`[${i}].Email`] ? (
        <ErrorMessage visible message={errorMessage[`[${i}].Email`]} />
      ) : (
        <></>
      )}
    </Box>
  );
}

export default AddPatientGuardian;
