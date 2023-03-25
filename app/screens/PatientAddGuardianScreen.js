import React, { useState } from 'react';
import { Box, SectionList, VStack, Center, View } from 'native-base';
// import { SectionList } from 'react-native';

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
            errorMessage={errorMessage}
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
            />
          </View>
        )}
      />
    </>
  );
}
export default PatientAddGuardianScreen;
