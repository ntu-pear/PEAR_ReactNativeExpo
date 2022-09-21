import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddAllergyScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;
  const [allergyList, setAllergyList] = useState([{ title: '' }]);
  const addNewAllergyComponent = () => {
    setAllergyList([...allergyList, { title: '' }]);
  };

  const removeAllergyComponent = (index) => {
    const list = [...allergyList];
    list.splice(index, 1);
    setAllergyList(list);
  };
  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={60} />
          {allergyList
            ? allergyList.map((item, index) => (
                <Box>
                  <AddPatientAllergy key={index} val={item} title={index + 1} />
                </Box>
              ))
            : null}
        </Box>

        <AddPatientBottomButtons
          list={allergyList}
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          addComponent={addNewAllergyComponent}
          removeComponent={removeAllergyComponent}
        />
      </Box>
    </ScrollView>
  );
}
