// Libs
import React, { useState, useCallback } from 'react';
import { SectionList, Center, View } from 'native-base';

// Components
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddGuardianScreen({nextQuestionHandler,
  prevQuestionHandler,
  formData,
  handleFormData,
  componentList,
  concatFormData,
  removeFormData
}) {
  const [guardianInfoDisplay, setGuardianInfoDisplay] = useState(
    componentList.guardian,
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

  // Variable that determines whether user can go to next page based on whether there are
  // errors present in the child Components or not.
  let isNextDisabled = errorStates.includes(true);

  const addNewGuardianComponent = () => {
    const maximumDOB = new Date();
    maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);
    // Add new error state for new child component
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
      DOB: maximumDOB,
      Address: '',
      PostalCode: '',
      TempAddress: '',
      TempPostalCode: '',
      Gender: 'M',
      PreferredName: '',
    });
  };

  const removeGuardianComponent = (index) => {
    // Remove error state for removed child component.
    const errorList = [...errorStates];
    let newErrorList = errorList.slice(0, -1);
    setErrorStates(newErrorList);

    const list = [...guardianInfoDisplay];
    list.splice(index, 1);
    setGuardianInfoDisplay(list);
    removeFormData('guardianInfo');
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
