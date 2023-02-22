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
  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

  const [errorMessage, setErrorMessage] = useState({});

  // data validation using Yup
  // Reference: https://github.com/jquense/yup
  const schema = Yup.object().shape({
    patientInfo: Yup.object().shape({
      FirstName: Yup.string()
        .matches(/^[^\d]+$/, 'First Name must not contain any numbers.')
        .required('First Name is a required field.'),
      LastName: Yup.string()
        .matches(/^[^\d]+$/, 'Last Name must not contain any numbers.')
        .required('Last Name is a required field.'),
      PreferredName: Yup.string()
        .matches(/^[^\d]+$/, 'Preferred Name must not contain any numbers.')
        .required('Preferred Name is a required field.'),
      PreferredLanguageListID: Yup.number().required(
        'Preferred Language is a required field.',
      ),
      NRIC: Yup.string()
        .matches(/^[A-Za-z]\d{7}[A-Za-z]$/, { message: 'Invalid NRIC.' })
        .length(9, 'NRIC must be exactly 9 characters.')
        .required('NRIC is a required field.'),
      Address: Yup.string().required('Address is a required field.'),
      TempAddress: Yup.string().notRequired(),
      HomeNo: Yup.string()
        .matches(/^$|^6[0-9]{7}$/, {
          message:
            'Home Telephone No. must start with the digit 6, and must have 8 digits.',
        })
        .notRequired(),
      HandphoneNo: Yup.string()
        .matches(/^$|^[89][0-9]{7}$/, {
          message:
            'Handphone No. must start with the digit 8 or 9, and must have 8 digits.',
        })
        .notRequired(),
      Gender: Yup.string().required(),
      DOB: Yup.date().required(),
      StartDate: Yup.date().required(),
      IsChecked: Yup.boolean().required(), // additional item for End Date datepicker to be optional
      // EndDate: Yup.date() // TODO: fix validation for EndDate
      //   .required()
      //   .when('IsChecked', {
      //     is: true,
      //     then: Yup.date().test(
      //       'is-not-epoch',
      //       'Please select a valid End Date',
      //       (value) => value.getTime() !== 0,
      //     ),
      //   }),
      EndDate: Yup.date().notRequired(),
      PrivacyLevel: Yup.string().required(),
      UpdateBit: Yup.boolean().required(),
      AutoGame: Yup.boolean().required(),
      IsActive: Yup.boolean().required(),
      IsRespiteCare: Yup.boolean().required(),
      TerminationReason: Yup.string().notRequired(),
      InactiveReason: Yup.string().notRequired(),
      ProfilePicture: Yup.string().notRequired(),
      UploadProfilePicture: Yup.object()
        .shape({
          uri: Yup.string().notRequired(),
          name: Yup.string().notRequired(),
          type: Yup.string().notRequired(),
        })
        .notRequired(),
    }),
    guardianInfo: Yup.array()
      .of(
        Yup.object().shape({
          FirstName: Yup.string()
            .matches(
              /^[^\d]+$/,
              "Guardian's First Name must not contain any numbers.",
            )
            .required("Guardian's First Name is a required field."),
          LastName: Yup.string()
            .matches(
              /^[^\d]+$/,
              "Guardian's Last Name must not contain any numbers.",
            )
            .required("Guardian's Last Name is a required field."),
          NRIC: Yup.string()
            .matches(/^[A-Za-z]\d{7}[A-Za-z]$/, {
              message: 'Invalid NRIC format.',
            })
            .length(9, 'NRIC must be exactly 9 characters.')
            .required("Guardian's NRIC is a required field."),
          IsChecked: Yup.boolean(), // additional item to check if guardian wishes to log in in the future. if yes, email is required
          Email: Yup.string()
            .email('Invalid email address.')
            .required(
              "Guardian's Email is a required field if Guardian wants to log in.",
            )
            .when('IsChecked', {
              is: true,
              otherwise: (schema) =>
                schema.email('Invalid email address.').notRequired(),
            }),

          RelationshipID: Yup.number().required(
            'Relationship ID is a required field.',
          ),
          IsActive: Yup.boolean().required(),
          ContactNo: Yup.string()
            .matches(/^[89]\d{7}$/, {
              message:
                "Guardian's Handphone No. must start with the digit 8 or 9.",
            })
            .length(8, "Guardian's Handphone No. must be exactly 8 digits.")
            .required("Guardian's Handphone No. is a required field."),
        }),
      )
      .min(1)
      .max(2)
      .required(),
    allergyInfo: Yup.array()
      .of(
        Yup.object().shape({
          AllergyListID: Yup.string().required(
            'Allergy Name is a required field.',
          ),
          AllergyReactionListID: Yup.string().when(
            'AllergyListID',
            (value, schema) => {
              return value == 2
                ? schema.notRequired()
                : schema.required(
                    "Allergy Reaction is a required field if Allergy Name is not 'None'.",
                  ); // validation not required if AllergyListID is 'None'
            },
          ),
          AllergyRemarks: Yup.string().when(
            'AllergyListID',
            (value, schema) => {
              return value == 2
                ? schema.notRequired()
                : schema.required(
                    "Allergy Remarks is a required field if Allergy Name is not 'None'.",
                  ); // validation not required if AllergyListID is 'None'
            },
          ),
        }),
      )
      .min(1)
      .required(),
  });

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

  const handleFormData =
    (page = '', input, index = null) =>
    (e, date = null) => {
      if (page === 'patientInfo') {
        const newData = formData[page];
        newData[input] = date
          ? date
          : e['$d'] //e['$d']-check if input from MUI date-picker
          ? e['$d']
          : parseInt(e) // check if integer (for dropdown)
          ? parseInt(e) // change to integer
          : e; // eg. guardianInfo[0].FirstName = e

        setFormData((prevState) => ({
          ...prevState,
          [page]: newData,
        }));
      } else {
        const newData = formData[page].slice();

        // additional check to convert ContactNo  to string
        if (input === 'ContactNo') {
          newData[index][input] = e.toString(); // convert to string
        } else {
          newData[index][input] = date
            ? date
            : parseInt(e) // check if integer (for dropdown)
            ? parseInt(e) // change to integer
            : e; // eg. guardianInfo[0].FirstName = e
        }

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
