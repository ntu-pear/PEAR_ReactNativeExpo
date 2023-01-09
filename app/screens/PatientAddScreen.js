import React, { useState } from 'react';
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

  const patientData = {
    patientInfo: {
      FirstName: '',
      LastName: 'TestLastName',
      PreferredName: 'Test',
      PreferredLanguageListID: 1,
      NRIC: 'S9991231Z',
      Address: 'MyHome',
      HomeNo: '61236123',
      HandphoneNo: '61236123',
      Gender: 'M',
      DOB: newDate,
      StartDate: newDate,
      // convert date object to str
      EndDate: newDate,
      PrivacyLevel: '2',
      UpdateBit: true,
      AutoGame: true,
      IsActive: true,
      IsRespiteCare: false,
      TempAddress: 'MyHome',
      TerminationReason: '',
      InactiveReason: '',
      ProfilePicture: '',
      UploadProfilePicture: '',
    },

    guardianInfo: [
      {
        // guardianName: '', // guardianInfo[0].guardianName
        // guardianNric: '',
        // guardianPatient: '',
        // guardianHandphone: '',
        // guardianHomeTel: '',
        // guardianEmail: '',
        // firstName: 'guar',
        // lastName: 'dian',
        // contactNo: '92939203',
        // nric: 'T3992930L',
        // email: 'hello@gmail.com',
        // relationshipID: 0,
        // isActive: true,
        FirstName: 'guardi',
        LastName: 'an',
        NRIC: 'S9658526Z',
        Email: 'test@gmail.com',
        RelationshipID: 0,
        IsActive: true,
        ContactNo: '95655856',
        IsAdditionalGuardian: false,
      },
    ],

    allergyInfo: [
      {
        allergyName: '', // allergyList[0].allergyName
        allergyReaction: '',
        allergyNotes: '',
      },
    ],

    medicalInfo: [
      {
        medicalDetails: '',
        medicalInfo: '',
        medicalNotes: '',
        medicalDate: newDate,
      },
    ],
  };

  const [formData, setFormData] = useState(patientData);

  // state for form data
  // const [formData, setFormData] = useState({
  //   FirstName: '',
  //   LastName: '',
  //   PreferredName: '',
  //   PreferredLanguageListID: 1,
  //   NRIC: 'T1234567J',
  //   Address: '',
  //   HomeNo: '',
  //   HandphoneNo: '',
  //   Gender: 'M',
  //   DOB: newDate,
  //   StartDate: newDate,
  //   DOL: newDate,
  //   PrivacyLevel: 1,
  //   UpdateBit: true,
  //   AutoGame: true,
  //   IsActive: true,
  //   IsRespiteCare: false,
  //   TempAddress: '',
  //   TerminationReason: '',
  //   InactiveReason: '',
  //   ProfilePicture: '',
  //   UploadProfilePicture: '',

  //   guardianInfo: [
  //     {
  //       guardianName: '', // guardianInfo[0].guardianName
  //       guardianNric: '',
  //       guardianPatient: '',
  //       guardianHandphone: '',
  //       guardianHomeTel: '',
  //       guardianEmail: '',
  //     },
  //   ],

  //   allergyList: [
  //     {
  //       allergyName: '', // allergyList[0].allergyName
  //       allergyReaction: '',
  //       allergyNotes: '',
  //     },
  //   ],

  //   medicalList: [
  //     {
  //       medicalDetails: '',
  //       medicalInfo: '',
  //       medicalNotes: '',
  //       medicalDate: newDate,
  //     },
  //   ],
  // });

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
  // const handleFormData =
  //   (page = '', input, index = null) =>
  //   (e, date = null) => {
  //     if (page === 'patientInfo') {
  //       date
  //         ? setFormData((prevState) => ({
  //             ...prevState,
  //             [input]: date,
  //           }))
  //         : setFormData((prevState) => ({
  //             ...prevState,
  //             [input]: e,
  //           }));
  //     } else {
  //       const newData = formData[page].slice();
  //       date ? (newData[index][input] = date) : (newData[index][input] = e); // eg. guardianInfo[0].guardianName = e

  //       setFormData((prevState) => ({
  //         ...prevState,
  //         [page]: newData,
  //       }));
  //     }
  //   };

  const handleFormData =
    (page = '', input, index = null) =>
    (e, date = null) => {
      if (page === 'patientInfo') {
        const newData = formData[page];

        date ? (newData[input] = date) : (newData[input] = e); // eg. guardianInfo[0].firstName = e
        setFormData((prevState) => ({
          ...prevState,
          [page]: newData,
        }));
      } else {
        const newData = formData[page].slice();
        date ? (newData[index][input] = date) : (newData[index][input] = e); // eg. guardianInfo[0].firstName = e

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
