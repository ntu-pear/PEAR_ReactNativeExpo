import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddAllergyScreen(props) {
  const {
    nextQuestionHandler,
    prevQuestionHandler,
    formData,
    setFormData,
    handleFormData,
    componentList,
  } = props;
  const [allergyListDisplay, setAllergyListDisplay] = useState(
    componentList.allergy,
  );

  const concatFormData = () => {
    var allergyList = formData.allergyList.concat({
      allergyName: '',
      allergyReaction: '',
      allergyNotes: '',
    });
    setFormData((prevState) => ({
      ...prevState,
      allergyList,
    }));
  };

  const removeFormData = () => {
    var allergyList = [...formData.allergyList];
    allergyList.pop();
    setFormData((prevState) => ({
      ...prevState,
      allergyList,
    }));
  };

  const addNewAllergyComponent = () => {
    setAllergyListDisplay([...allergyListDisplay, {}]);
    concatFormData();
  };

  const removeAllergyComponent = (index) => {
    const list = [...allergyListDisplay];
    list.splice(index, 1);
    setAllergyListDisplay(list);
    removeFormData();
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={60} />
          {allergyListDisplay
            ? allergyListDisplay.map((item, index) => (
                <Box>
                  <AddPatientAllergy
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
          list={allergyListDisplay}
          nextQuestionHandler={() =>
            nextQuestionHandler('allergy', allergyListDisplay)
          }
          prevQuestionHandler={() =>
            prevQuestionHandler('allergy', allergyListDisplay)
          }
          addComponent={addNewAllergyComponent}
          removeComponent={removeAllergyComponent}
        />
      </Box>
    </ScrollView>
  );
}
