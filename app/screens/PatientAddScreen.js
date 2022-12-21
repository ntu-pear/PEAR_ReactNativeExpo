import React, { useState } from 'react';
import { Box, Input, Icon, FormControl, Text } from 'native-base';

import { PatientAddPatientInfoScreen } from 'app/screens/PatientAddPatientInfoScreen';
import { PatientAddGuardianScreen } from 'app/screens/PatientAddGuardianScreen';
import { PatientAddAllergyScreen } from 'app/screens/PatientAddAllergyScreen';
import { PatientAddMedicalHistoryScreen } from 'app/screens/PatientAddMedicalHistoryScreen';

export function PatientAddScreen(props) {
  // state for steps
  const [step, setStep] = useState(1);

  // state for components
  const [componentList, setComponentList] = useState({
    guardian: [{}],
    allergy: [{}],
    medical: [{}],
  });

  const newDate = new Date();

  // state for form data
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    PreferredName: '',
    PreferredLanguageListID: 1,
    NRIC: 'T1234567J',
    Address: '',
    HomeNo: '',
    HandphoneNo: '',
    Gender: 'M',
    DOB: newDate,
    StartDate: newDate,
    DOL: newDate,
    PrivacyLevel: 1,
    UpdateBit: true,
    AutoGame: true,
    IsActive: true,
    IsRespiteCare: false,
    TempAddress: '',
    TerminationReason: '',
    InactiveReason: '',
    ProfilePicture: '',
    UploadProfilePicture: '',

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

  const componentHandler = (page = '', list = []) => {
    if (list) {
      setComponentList((prevState) => ({
        // eg. componentList: { guardian: [{..}, {..}]}
        ...prevState,
        [page]: list,
      }));
    }
  };

  // function for going to next step by increasing step state by 1
  // and to set component list
  const nextQuestionHandler = (page = '', list = []) => {
    componentHandler(page, list);
    setStep(step + 1);
  };

  // function for going to previous step by decreasing step state by 1
  // and to set component list
  const prevQuestionHandler = (page = '', list = []) => {
    componentHandler(page, list);
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
          componentList={componentList}
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
          componentList={componentList}
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
          componentList={componentList}
        />
      );
    case 4:
      return (
        <PatientAddMedicalHistoryScreen
          key={4}
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          setFormData={setFormData}
          componentList={componentList}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;
