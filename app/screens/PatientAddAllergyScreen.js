import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddAllergyScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;
  const [addAllergyList, setAllergyList] = useState([{ title: '' }]);
  const addNewAllergyComponent = () => {
    setAllergyList([...addAllergyList, { title: '' }]);
  };

  const removeAllergyComponent = (index) => {
    const list = [...addAllergyList];
    list.splice(index, 1);
    setAllergyList(list);
  };
  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={100} />
          {addAllergyList
            ? addAllergyList.map((item, index) => (
                <Box>
                  <AddPatientAllergy key={item} title={index + 1} />
                </Box>
              ))
            : null}
        </Box>

        <AddPatientBottomButtons
          list={addAllergyList}
          // nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          addComponent={addNewAllergyComponent}
          removeComponent={removeAllergyComponent}
          submit={true}
        />
      </Box>
    </ScrollView>
  );
}
