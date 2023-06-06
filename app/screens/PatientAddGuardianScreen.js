// Lib
import React, { useState, useCallback } from 'react';
import { SectionList, Center, View } from 'native-base';

// Components
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
  const [errorStates, setErrorStates] = useState([true]);

  const handleChildError = useCallback(
    (childId, isError) => {
      // console.log('callback', isError, childId);
      setErrorStates((prevErrorStates) => {
        const updatedErrorStates = [...prevErrorStates];
        updatedErrorStates[childId] = isError;
        return updatedErrorStates;
      });
      // console.log(errorStates);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorStates],
  );

  let isNextDisabled = errorStates.includes(true);

  const addNewGuardianComponent = () => {
    setErrorStates((prev) => [...prev, true]);
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
    // console.log(errorStates);
    // console.log('add, button: ', isButtonDisabled);
  };

  const removeGuardianComponent = (index) => {
    const errorList = [...errorStates];
    let newErrorList = errorList.slice(0, -1);
    setErrorStates(newErrorList);

    // console.log('new error list: ', newErrorList);
    const list = [...guardianInfoDisplay];
    list.splice(index, 1);
    setGuardianInfoDisplay(list);
    removeFormData('guardianInfo');

    // console.log('removing', errorStates);
    // console.log('rem, button: ', isNextDisabled);
  };

  return (
    <>
      <Center>
        <AddPatientProgress value={60} />
      </Center>
      <SectionList
        sections={[{ data: guardianInfoDisplay }]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <AddPatientGuardian
            key={item}
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
              isNextDisabled={isNextDisabled}
            />
          </View>
        )}
      />
    </>
  );
}
export default PatientAddGuardianScreen;
