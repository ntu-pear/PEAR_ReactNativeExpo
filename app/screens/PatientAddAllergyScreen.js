import React, { useState } from 'react';
import { Box, ScrollView, Progress } from 'native-base';
import AddPatientAllergy from 'app/components/AddPatientAllergy';
import AddPatientBottomButtons from 'app/components/AddPatientBottomButtons';
import AddPatientProgress from 'app/components/AddPatientProgress';

export function PatientAddAllergyScreen(props) {
  const {
    prevQuestionHandler,
    formData,
    setFormData,
    handleFormData,
    componentList,
  } = props;
  const [allergyInfoDisplay, setAllergyInfoDisplay] = useState(
    componentList.allergy,
  );

  const concatFormData = () => {
    var allergyInfo = formData.allergyInfo.concat({
      allergyName: 1,
      allergyReaction: '',
      allergyNotes: '',
    });
    setFormData((prevState) => ({
      ...prevState,
      allergyInfo,
    }));
  };

  const removeFormData = () => {
    var allergyInfo = [...formData.allergyInfo];
    allergyInfo.pop();
    setFormData((prevState) => ({
      ...prevState,
      allergyInfo,
    }));
  };

  const addNewAllergyComponent = () => {
    setAllergyInfoDisplay([...allergyInfoDisplay, {}]);
    concatFormData();
  };

  const removeAllergyComponent = (index) => {
    const list = [...allergyInfoDisplay];
    list.splice(index, 1);
    setAllergyInfoDisplay(list);
    removeFormData();
  };

  return (
    <ScrollView>
      <Box alignItems="center">
        <Box w="75%">
          <AddPatientProgress value={100} />
          {allergyInfoDisplay
            ? allergyInfoDisplay.map((item, index) => (
                <Box>
                  <AddPatientAllergy
                    key={item}
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
          list={allergyInfoDisplay}
          prevQuestionHandler={() =>
            prevQuestionHandler('allergy', allergyInfoDisplay)
          }
          addComponent={addNewAllergyComponent}
          removeComponent={removeAllergyComponent}
          submit={true}
          formData={formData}
        />
      </Box>
    </ScrollView>
  );
}
