import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientMedicalHistory from 'app/components/AddPatientMedicalHistory';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddMedicalHistoryScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;
  const [medicalHistoryList, setMedicalHistoryList] = useState([{ title: '' }]);
  const addNewMedicalHistoryComponent = () => {
    setMedicalHistoryList([...medicalHistoryList, { title: '' }]);
  };

  const removeMedicalHistoryComponent = (index) => {
    const list = [...medicalHistoryList];
    list.splice(index, 1);
    setMedicalHistoryList(list);
  };
  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={100} />
          {medicalHistoryList
            ? medicalHistoryList.map((item, index) => (
                <Box>
                  <AddPatientMedicalHistory
                    key={index}
                    val={item}
                    title={index + 1}
                  />
                </Box>
              ))
            : null}
        </Box>

        <AddPatientBottomButtons
          list={medicalHistoryList}
          // nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          addComponent={addNewMedicalHistoryComponent}
          removeComponent={removeMedicalHistoryComponent}
          submit={true}
        />
      </Box>
    </ScrollView>
  );
}
