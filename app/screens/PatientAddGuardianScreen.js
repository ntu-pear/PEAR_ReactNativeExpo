import React, { useState } from 'react';
import { Box, ScrollView, VStack, Center } from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddGuardianScreen(props) {
  const {
    nextQuestionHandler,
    prevQuestionHandler,
    formData,
    handleFormData,
    componentList,
    errorMessage,
    concatFormData,
    removeFormData,
  } = props;

  const [guardianInfoDisplay, setGuardianInfoDisplay] = useState(
    componentList.guardian,
  );

  const addNewGuardianComponent = () => {
    setGuardianInfoDisplay([...guardianInfoDisplay, {}]);
    concatFormData('guardianInfo', {
      FirstName: '',
      LastName: '',
      ContactNo: '',
      NRIC: '',
      IsChecked: false,
      Email: '',
      RelationshipID: 1,
      IsActive: true,
    });
  };

  const removeGuardianComponent = (index) => {
    const list = [...guardianInfoDisplay];
    list.splice(index, 1);
    setGuardianInfoDisplay(list);
    removeFormData('guardianInfo');
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="100%">
          <VStack>
            <Center>
              <AddPatientProgress value={60} />
              {guardianInfoDisplay
                ? guardianInfoDisplay.map((item, index) => (
                    <Box w="100%" key={index}>
                      <AddPatientGuardian
                        key={item}
                        i={index}
                        title={index + 1}
                        formData={formData}
                        handleFormData={handleFormData}
                        errorMessage={errorMessage}
                      />
                    </Box>
                  ))
                : null}
            </Center>
          </VStack>
        </Box>
        <AddPatientBottomButtons
          list={guardianInfoDisplay}
          nextQuestionHandler={() =>
            nextQuestionHandler(formData, 'guardian', guardianInfoDisplay)
          }
          prevQuestionHandler={() =>
            prevQuestionHandler('guardian', guardianInfoDisplay)
          }
          addComponent={addNewGuardianComponent}
          removeComponent={removeGuardianComponent}
          max={2}
        />
      </Box>
    </ScrollView>
  );
}
export default PatientAddGuardianScreen;
