import React, { useState, useCallback } from 'react';
import { Center, SectionList, View } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddAllergyScreen(props) {
  const {
    prevQuestionHandler,
    formData,
    handleFormData,
    componentList,
    concatFormData,
    removeFormData,
    onSubmitFunction,
    // -- Validation is now real-time no need to have on submit validation - Justin
    // validateStep,
  } = props;

  const [allergyInfoDisplay, setAllergyInfoDisplay] = useState(
    componentList.allergy,
  );

  const [errorStates, setErrorStates] = useState([false]);

  // Callback function passed to child components. Lets them update their corresponding
  // error states in ErrorStates state.
  const handleChildError = useCallback(
    (childId, isError) => {
      setErrorStates((prevErrorStates) => {
        const updatedErrorStates = [...prevErrorStates];
        updatedErrorStates[childId] = isError;
        return updatedErrorStates;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorStates],
  );

  // if errorStates has true(s) within (errors present) => is submit enabled = false
  // if errorStates does not have true(s) (no errors present) false => is submit enabled = true
  let isSubmitEnabled = !errorStates.includes(true);

  const addNewAllergyComponent = () => {
    setErrorStates((prev) => [...prev, true]);
    setAllergyInfoDisplay([...allergyInfoDisplay, {}]);
    concatFormData('allergyInfo', {
      AllergyListID: 2,
      AllergyReactionListID: null,
      AllergyRemarks: '',
    });
  };

  const removeAllergyComponent = (index) => {
    const errorList = [...errorStates];
    let newErrorList = errorList.slice(0, -1);
    setErrorStates(newErrorList);

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
            onError={handleChildError}
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
              submit={isSubmitEnabled}
              formData={formData}
              submitFunction={onSubmitFunction}
              // // -- Validation is now real-time no need to have on submit validation - Justin
            />
          </View>
        )}
      />
    </>
  );
}
export default PatientAddAllergyScreen;
