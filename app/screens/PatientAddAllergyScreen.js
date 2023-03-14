import React, { useState } from 'react';
import { Box, ScrollView, VStack, Center } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddAllergyScreen(props) {
  const {
    prevQuestionHandler,
    formData,
    handleFormData,
    componentList,
    validateStep,
    errorMessage,
    concatFormData,
    removeFormData,
  } = props;

  const [allergyInfoDisplay, setAllergyInfoDisplay] = useState(
    componentList.allergy,
  );

  const addNewAllergyComponent = () => {
    setAllergyInfoDisplay([...allergyInfoDisplay, {}]);
    concatFormData('allergyInfo', {
      AllergyListID: null,
      AllergyReactionListID: null,
      AllergyRemarks: '',
    });
  };

  const removeAllergyComponent = (index) => {
    const list = [...allergyInfoDisplay];
    list.splice(index, 1);
    setAllergyInfoDisplay(list);
    removeFormData('allergyInfo');
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="100%">
          <VStack>
            <Center>
              <AddPatientProgress value={100} />
              {allergyInfoDisplay
                ? allergyInfoDisplay.map((item, index) => (
                    <Box w="100%" key={index}>
                      <AddPatientAllergy
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
          list={allergyInfoDisplay}
          prevQuestionHandler={() =>
            prevQuestionHandler('allergy', allergyInfoDisplay)
          }
          addComponent={addNewAllergyComponent}
          removeComponent={removeAllergyComponent}
          submit={true}
          formData={formData}
          validateStep={validateStep}
        />
      </Box>
    </ScrollView>
  );
}
export default PatientAddAllergyScreen;
