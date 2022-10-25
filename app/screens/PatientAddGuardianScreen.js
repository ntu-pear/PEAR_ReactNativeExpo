import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

import AddPatientGuardian from 'app/components/AddPatientGuardian';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddGuardianScreen(props) {
  const {
    nextQuestionHandler,
    prevQuestionHandler,
    formData,
    setFormData,
    handleFormData,
    componentList,
  } = props;

  const concatFormData = () => {
    var guardianList = formData.guardianList.concat({
      guardianName: '',
      guardianNric: '',
      guardianPatient: '',
      guardianHandphone: '',
      guardianHomeTel: '',
      guardianEmail: '',
    });
    setFormData((prevState) => ({
      ...prevState,
      guardianList,
    }));
  };

  const removeFormData = () => {
    var guardianList = [...formData.guardianList];
    guardianList.pop();
    setFormData((prevState) => ({
      ...prevState,
      guardianList,
    }));
  };

  const [guardianListDisplay, setGuardianListDisplay] = useState(
    componentList.guardian,
  );
  const addNewGuardianComponent = () => {
    setGuardianListDisplay([...guardianListDisplay, {}]);
    concatFormData();
  };

  const removeGuardianComponent = (index) => {
    const list = [...guardianListDisplay];
    list.splice(index, 1);
    setGuardianListDisplay(list);
    removeFormData();
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={40} />
          {guardianListDisplay
            ? guardianListDisplay.map((item, index) => (
                <Box>
                  <AddPatientGuardian
                    val={item}
                    i={index}
                    title={index + 1}
                    formData={formData}
                    handleFormData={handleFormData}
                  />
                </Box>
              ))
            : null}
        </Box>
        <AddPatientBottomButtons
          list={guardianListDisplay}
          nextQuestionHandler={() =>
            nextQuestionHandler('guardian', guardianListDisplay)
          }
          prevQuestionHandler={() =>
            prevQuestionHandler('guardian', guardianListDisplay)
          }
          addComponent={addNewGuardianComponent}
          removeComponent={removeGuardianComponent}
        />
      </Box>
    </ScrollView>
  );
}
