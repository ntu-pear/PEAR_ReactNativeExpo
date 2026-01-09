// Libs
import React, { useState, useCallback } from 'react';
import { SectionList, Center, View } from 'native-base';

// Components
import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

function PatientAddGuardianScreen({nextQuestionHandler,
  testID='',
  prevQuestionHandler,
  formData,
  handleFormData,
  componentList,
  concatFormData,
  removeFormData,
  onSubmit
}) {
  const [guardianInfoDisplay, setGuardianInfoDisplay] = useState(
    componentList.guardian,
  );
  // Start with error state for primary guardian (required)
  const [errorStates, setErrorStates] = useState(
    componentList.guardian.map(() => true), // Each guardian starts with error until form is valid
  );

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
  // Only check the first guardian (primary) for errors - it's required
  // Secondary guardian (index 1) is optional - can be empty or fully filled
  let isNextDisabled = errorStates.length === 0 || (errorStates[0] === true);

  const addNewGuardianComponent = () => {
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
      RelationshipName: 'Husband',
      IsActive: true,
      DOB: new Date(), // Default to today's date
      Address: '',
      PostalCode: '',
      TempAddress: '',
      TempPostalCode: '',
      Gender: 'M',
      PreferredName: '',
    });
  };

  const removeGuardianComponent = (index) => {
    // Can only remove the secondary guardian (index 1), not the primary guardian (index 0)
    if (guardianInfoDisplay.length <= 1 || index === 0) {
      return;
    }
    
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
        <AddPatientProgress value={100} />
      </Center>
      <SectionList
        testID={testID}
        sections={[{ data: guardianInfoDisplay }]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <AddPatientGuardian
            testID={testID}
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
              testID={`${testID}_bottomBtns`}
              list={guardianInfoDisplay}
              prevQuestionHandler={() =>
                prevQuestionHandler('guardian', guardianInfoDisplay)
              }
              addComponent={addNewGuardianComponent}
              removeComponent={removeGuardianComponent}
              max={2}
              submit={true}
              isSubmitDisabled={isNextDisabled}
              onSubmit={onSubmit}
            />
          </View>
        )}
      />
    </>
  );
}
export default PatientAddGuardianScreen;
