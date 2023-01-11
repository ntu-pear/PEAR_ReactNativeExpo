import React, { useState } from 'react';
import { PatientAddPatientInfoScreen } from 'app/screens/PatientAddPatientInfoScreen';
import { PatientAddGuardianScreen } from 'app/screens/PatientAddGuardianScreen';
import { PatientAddAllergyScreen } from 'app/screens/PatientAddAllergyScreen';
import { PatientAddMedicalHistoryScreen } from 'app/screens/PatientAddMedicalHistoryScreen';
import * as ImagePicker from 'expo-image-picker';

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
      FirstName: 'First',
      LastName: 'Last',
      PreferredName: 'PName',
      PreferredLanguageListID: 1,
      NRIC: 'S0948274A',
      Address: 'MyHome',
      HomeNo: '61236123',
      HandphoneNo: '61236123',
      Gender: 'M',
      DOB: newDate,
      StartDate: newDate,
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
        FirstName: 'gFirst',
        LastName: 'gLast',
        NRIC: 'S9658567Z',
        Email: 'gg@gmail.com',
        RelationshipID: 1,
        IsActive: true,
        ContactNo: '95655856',
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

  // Reference: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  const pickImage = (page, input) => async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      var img = formData[page];
      img[input] = result.uri;

      setFormData((prevState) => ({
        ...prevState,
        [page]: img,
      }));
    }
  };
  // handling form input data by taking onchange value and updating our previous form data state
  const handleFormData =
    (page = '', input, index = null) =>
    (e, date = null) => {
      if (page === 'patientInfo') {
        const newData = formData[page];
        date ? (newData[input] = date) : (newData[input] = e); // eg. guardianInfo[0].FirstName = e

        setFormData((prevState) => ({
          ...prevState,
          [page]: newData,
        }));
      } else {
        const newData = formData[page].slice();
        date ? (newData[index][input] = date) : (newData[index][input] = e); // eg. guardianInfo[0].FirstName = e

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
          pickImage={pickImage}
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
