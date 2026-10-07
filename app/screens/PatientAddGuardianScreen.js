// Libs
import React, { useContext, useState, useCallback, useRef } from 'react';
import { SectionList, Center, View } from 'native-base';

// Components
import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';
import { hasGuardianInput } from 'app/utility/patientCreation';
import AuthContext from 'app/auth/context';
import { canSelectPrimaryGuardian } from 'app/utility/guardianEditing';
import ExistingPrimaryGuardian from 'app/components/ExistingPrimaryGuardian';
import AppButton from 'app/components/AppButton';

function PatientAddGuardianScreen({
  nextQuestionHandler,
  testID = '',
  prevQuestionHandler,
  formData,
  handleFormData,
  componentList,
  concatFormData,
  removeFormData,
  onSubmit,
}) {
  const { user } = useContext(AuthContext) || {};
  const existingPrimary = formData?.guardianInfo?.[0]?.Mode === 'existing';
  const [guardianInfoDisplay, setGuardianInfoDisplay] = useState(
    componentList.guardian,
  );
  const guardianCount = useRef(guardianInfoDisplay.length);
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
        if (prevErrorStates[childId] === isError) {
          return prevErrorStates;
        }
        updatedErrorStates[childId] = isError;
        return updatedErrorStates;
      });
    },

    [],
  );

  // Variable that determines whether user can go to next page based on whether there are
  // errors present in the child Components or not.
  // Only check the first guardian (primary) for errors - it's required
  // Secondary guardian (index 1) is optional - can be empty or fully filled
  let isNextDisabled =
    (existingPrimary &&
      (!canSelectPrimaryGuardian(user) ||
        formData.guardianInfo.slice(1).some(hasGuardianInput))) ||
    errorStates.length === 0 ||
    errorStates[0] === true ||
    formData.guardianInfo
      .slice(1)
      .some((g, i) => hasGuardianInput(g) && errorStates[i + 1] !== false);

  const addNewGuardianComponent = () => {
    if (
      guardianCount.current >= 2 ||
      formData?.guardianInfo?.[0]?.Mode === 'existing'
    ) {
      return;
    }
    guardianCount.current += 1;
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

    guardianCount.current -= 1;
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
        keyboardShouldPersistTaps="handled"
        testID={testID}
        sections={[{ data: guardianInfoDisplay }]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
            {index === 0 && canSelectPrimaryGuardian(user) ? (
              <View>
                <AppButton
                  title="New primary guardian"
                  color="green"
                  testID="primary-mode-new"
                  onPress={() => {
                    handleFormData('Mode', 0)('new');
                    handleFormData('ExistingGuardianId', 0)(null);
                    handleChildError(0, true);
                  }}
                />
                <AppButton
                  title="Existing primary guardian"
                  color="green"
                  testID="primary-mode-existing"
                  onPress={() => {
                    handleFormData('Mode', 0)('existing');
                    handleFormData('RelationshipID', 0)(0);
                    handleFormData('RelationshipName', 0)('');
                    handleFormData('ExistingGuardianId', 0)(null);
                    handleFormData('SelectedNric', 0)('');
                    handleChildError(0, true);
                  }}
                />
              </View>
            ) : null}
            {index === 0 && existingPrimary ? (
              canSelectPrimaryGuardian(user) ? (
                <ExistingPrimaryGuardian
                  guardian={formData.guardianInfo[0]}
                  onField={(field) => handleFormData(field, 0)}
                  onError={(error) => handleChildError(0, error)}
                />
              ) : null
            ) : (
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
          </View>
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
              removeComponent={() => removeGuardianComponent(1)}
              max={existingPrimary ? 1 : 2}
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
