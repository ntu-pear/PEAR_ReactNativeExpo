import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddGuardianScreen(props) {
  const { nextQuestionHandler, prevQuestionHandler } = props;
  const [guardianList, setGuardianList] = useState([{ title: '' }]);
  const addNewGuardianComponent = () => {
    setGuardianList([...guardianList, { title: '' }]);
  };

  const removeGuardianComponent = (index) => {
    const list = [...guardianList];
    list.splice(index, 1);
    setGuardianList(list);
  };
  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={50} />
          {guardianList
            ? guardianList.map((item, index) => (
                <Box>
                  <AddPatientGuardian
                    key={index}
                    val={item}
                    title={index + 1}
                  />
                </Box>
              ))
            : null}
        </Box>
        <AddPatientBottomButtons
          list={guardianList}
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          addComponent={addNewGuardianComponent}
          removeComponent={removeGuardianComponent}
        />
      </Box>
    </ScrollView>
  );
}
