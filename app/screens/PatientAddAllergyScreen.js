import React, { useState } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  Center,
  SectionList,
  View,
} from 'native-base';
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
    <>
      <Center>
        <AddPatientProgress value={100} />
      </Center>
      <SectionList
        sections={[{ data: allergyInfoDisplay }]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <AddPatientAllergy
            i={index}
            title={index + 1}
            formData={formData}
            handleFormData={handleFormData}
            errorMessage={errorMessage}
          />
        )}
        ListFooterComponent={() => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
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
          </View>
        )}
      />
    </>
  );
}
export default PatientAddAllergyScreen;
