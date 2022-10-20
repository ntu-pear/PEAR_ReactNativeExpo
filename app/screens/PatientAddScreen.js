import React, { useState } from 'react';
import { Box, Input, Icon, FormControl, Text } from 'native-base';

import { PatientAddPatientInfoScreen } from 'app/screens/PatientAddPatientInfoScreen';
import { PatientAddGuardianScreen } from 'app/screens/PatientAddGuardianScreen';
import { PatientAddAllergyScreen } from 'app/screens/PatientAddAllergyScreen';
import { PatientAddMedicalHistoryScreen } from 'app/screens/PatientAddMedicalHistoryScreen';

export function PatientAddScreen(props) {
  // state for steps
  const [step, setStep] = useState(1);

  const newDate = new Date();

  // state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    preferredLanguage: '',
    nric: '',
    address: '',
    homeTel: '',
    handphone: '',
    gender: '1',
    dob: newDate,
    doj: newDate,
    dol: newDate,

    guardianList: [
      {
        guardianName: '', // guardianList[0].guardianName
        guardianNric: '',
        guardianPatient: '',
        guardianHandphone: '',
        guardianHomeTel: '',
        guardianEmail: '',
      },
    ],

    allergyList: [
      {
        allergyName: '', // allergyList[0].allergyName
        allergyReaction: '',
        allergyNotes: '',
      },
    ],

    medicalList: [
      {
        medicalDetails: '',
        medicalInfo: '',
        medicalNotes: '',
        medicalDate: newDate,
      },
    ],
  });

  // function for going to next step by increasing step state by 1
  const nextQuestionHandler = () => {
    setStep(step + 1);
  };

  // function for going to previous step by decreasing step state by 1
  const prevQuestionHandler = () => {
    setStep(step - 1);
  };

  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (page = '', input, index = null) =>
    (e, date = null) => {
      if (page === 'patientList') {
        date
          ? setFormData((prevState) => ({
              ...prevState,
              [input]: date,
            }))
          : setFormData((prevState) => ({
              ...prevState,
              [input]: e,
            }));
      } else {
        const newData = formData[page].slice();
        date ? (newData[index][input] = date) : (newData[index][input] = e); // eg. guardianList[0].guardianName = e

        setFormData((prevState) => ({
          ...prevState,
          [page]: newData,
        }));
      }
    };

  switch (step) {
    case 1:
      return (
        <PatientAddPatientInfoScreen
          key={1}
          nextQuestionHandler={nextQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
        />
      );
    case 2:
      return (
        <PatientAddGuardianScreen
          key={2}
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          setFormData={setFormData}
        />
      );
    case 3:
      return (
        <PatientAddAllergyScreen
          key={3}
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          setFormData={setFormData}
        />
      );
    case 4:
      return (
        <PatientAddMedicalHistoryScreen
          key={4}
          nnextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          setFormData={setFormData}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;