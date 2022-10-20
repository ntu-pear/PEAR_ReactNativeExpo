import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientMedicalHistory from 'app/components/AddPatientMedicalHistory';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddMedicalHistoryScreen(props) {
  const {
    nextQuestionHandler,
    prevQuestionHandler,
    formData,
    setFormData,
    handleFormData,
  } = props;
  const [medicalHistoryListDisplay, setMedicalHistoryListDisplay] = useState([
    {},
  ]);

  const concatFormData = () => {
    var medicalList = formData.medicalList.concat({
      medicalDetails: '',
      medicalInfo: '',
      medicalNotes: '',
      medicalDate: new Date(),
    });
    setFormData((prevState) => ({
      ...prevState,
      medicalList,
    }));
  };

  const removeFormData = () => {
    var medicalList = [...formData.medicalList];
    medicalList.pop();
    setFormData((prevState) => ({
      ...prevState,
      medicalList,
    }));
  };

  const addNewMedicalHistoryComponent = () => {
    setMedicalHistoryListDisplay([...medicalHistoryListDisplay, {}]);
    concatFormData();
  };

  const removeMedicalHistoryComponent = (index) => {
    const list = [...medicalHistoryListDisplay];
    list.splice(index, 1);
    setMedicalHistoryListDisplay(list);
    removeFormData();
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={100} />
          {medicalHistoryListDisplay
            ? medicalHistoryListDisplay.map((item, index) => (
                <Box>
                  <AddPatientMedicalHistory
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
          list={medicalHistoryListDisplay}
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
