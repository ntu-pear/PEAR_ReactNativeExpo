import React, { useState, useEffect } from 'react';
import { Box, Input, FormControl, Text, Select, Divider } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import listApi from 'app/api/lists';

function AddPatientGuardian({ i, title, formData, handleFormData }) {
  const [listOfRelationships, setListOfRelationships] = useState([]);

  const page = 'guardianInfo';
  const guardian = formData.guardianInfo[i]; //guardianInfo[0].FirstName

  // Get List of Relationships from List API
  const getRelationshipList = async () => {
    const response = await listApi.getRelationshipList();
    if (!response.ok) {
      console.log(
        'An error occured when getting list of relationships',
        response,
      );
      return;
    }
    setListOfRelationships(response.data);
  };

  useEffect(() => {
    console.log('Calling API');
    getRelationshipList();
  }, []);

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

      <FormControl>
        <FormControl.Label>Guardian Last Name</FormControl.Label>
        <Input
          placeholder="Guardian Last Name"
          value={guardian.LastName}
          onChangeText={handleFormData(page, 'LastName', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian NRIC</FormControl.Label>
        <Input
          placeholder="Guardian NRIC"
          value={guardian.NRIC}
          onChangeText={handleFormData(page, 'NRIC', i)}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian is Patient's</FormControl.Label>
        <Select
          placeholder="Select"
          selectedValue={guardian.RelationshipID}
          onValueChange={handleFormData(page, 'RelationshipID', i)}
        >
          {listOfRelationships.map((item) => (
            <Select.Item label={item.value} value={item.list_RelationshipID} />
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Guardian's Handphone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Handphone Number"
          value={guardian.ContactNo}
          onChangeText={handleFormData(page, 'ContactNo', i)}
        />
      </FormControl>

      {/* <FormControl>
        <FormControl.Label>Guardian's Home Telephone No.</FormControl.Label>
        <Input
          placeholder="Guardian's Home Telephone Number (Optional)"
          value={guardian.guardianHomeTel}
          onChangeText={handleFormData(page, 'guardianHomeTel', i)}
        />
      </FormControl> */}

      <FormControl>
        <FormControl.Label>Guardian Email </FormControl.Label>
        <Input
          placeholder="Guardian Email"
          value={guardian.Email}
          onChangeText={handleFormData(page, 'Email', i)}
        />
      </FormControl>
    </Box>
  );
}

export default AddPatientGuardian;
