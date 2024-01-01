// Libs
import React, { useState, useCallback, useEffect } from 'react';
import { Center, SectionList, View } from 'native-base';

// Components
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddAllergyScreen({
  prevQuestionHandler,
  formData,
  handleFormData,
  componentList,
  concatFormData,
  removeFormData,
  onSubmit
}) {
  const [allergyInfoDisplay, setAllergyInfoDisplay] = useState(
    componentList.allergy,
  );
  const [errorStates, setErrorStates] = useState([true]);

  // Callback function passed to child components to let them update their corresponding
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
  let isSubmitDisabled = !errorStates.includes(true);

  const addNewAllergyComponent = () => {
    setErrorStates((prev) => [...prev, true]);
    setAllergyInfoDisplay([...allergyInfoDisplay, {}]);
    concatFormData('allergyInfo', {
      AllergyListID: 2,
      AllergyReactionListID: 1,
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
            key={item}
            i={index}
            title={index + 1}
            formData={formData}
            handleFormData={handleFormData}
            onError={handleChildError}
          />
          // <View style={{backgroundColor: "black", height: 20}}/>
        )}
        ListFooterComponent={() => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <AddPatientBottomButtons
              list={allergyInfoDisplay}
              prevQuestionHandler={() =>
                prevQuestionHandler('allergy', allergyInfoDisplay)
              }
              isAddDisabled={!(formData['allergyInfo'][0]['AllergyListID'] > 2)} // disable add if no allergy selected
              addComponent={addNewAllergyComponent}
              removeComponent={removeAllergyComponent}
              submit={true}
              isSubmitDisabled={!isSubmitDisabled}              
              formData={formData}
              onSubmit={onSubmit}
            />
          </View>
        )}
      />
    </>
  );
}
export default PatientAddAllergyScreen;
