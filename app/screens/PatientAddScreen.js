import React, { useState } from 'react';
import { Platform } from 'react-native';

import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
import PatientAddAllergyScreen from 'app/screens/PatientAddAllergyScreen';
import * as ImagePicker from 'expo-image-picker';

import * as Yup from 'yup';
import mime from 'mime';

function PatientAddScreen(props) {
  // state for steps
  const [step, setStep] = useState(1);

  // state for datepicker
  const [show, setShow] = useState({
    DOB: false,
    StartDate: false,
    EndDate: false,
  });

  // state for components
  const [componentList, setComponentList] = useState({
    guardian: [{}],
    allergy: [{}],
  });

  const newDate = new Date();
  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

  const [errorMessage, setErrorMessage] = useState('');

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
      EndDate: Yup.date() // TODO: fix validation for EndDate
        .required()
        .when('IsChecked', {
          is: true,
          then: Yup.date().test(
            'is-not-epoch',
            'Please select a valid End Date',
            (value) => value.getTime() !== 0,
          ),
        }),
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
      FirstName: 'Patient',
      LastName: 'adf',
      PreferredName: 'Patient',
      PreferredLanguageListID: 1,
      NRIC: 'S0948274A',
      Address: 'MyHome',
      TempAddress: '',
      HomeNo: '',
      HandphoneNo: '',
      Gender: 'M',
      DOB: maximumDOB,
      StartDate: newDate,
      IsChecked: false, // additional item to check if user wants to enter EndDate value
      EndDate: new Date(0), // default value of EndDate is beginning of Epoch time
      PrivacyLevel: '2',
      UpdateBit: true,
      AutoGame: true,
      IsActive: true,
      IsRespiteCare: false,
      TerminationReason: '',
      InactiveReason: '',
      ProfilePicture: '',
      UploadProfilePicture: {
        uri: '',
        name: '',
        type: '',
      },
    },

    guardianInfo: [
      {
        FirstName: 'gFirst',
        LastName: 'gLast',
        NRIC: 'S9658567Z',
        IsChecked: false, // additional item to check if guardian wishes to log in in the future. if yes, email is required
        Email: 'gg@gmail.com',
        RelationshipID: 1,
        IsActive: true,
        ContactNo: '95655856',
      },
    ],

    allergyInfo: [
      {
        AllergyListID: null,
        AllergyReactionListID: null,
        AllergyRemarks: '',
      },
    ],
  };

  const [formData, setFormData] = useState(patientData);

  // order the formData wrt to form steps
  const orderedFormData = {
    patientInfo: formData.patientInfo,
    guardianInfo: formData.guardianInfo,
    allergyInfo: formData.allergyInfo,
  };

  // handle state of components
  const componentHandler = (page = '', list = []) => {
    if (list) {
      setComponentList((prevState) => ({
        // eg. componentList: { guardian: [{..}, {..}] }
        ...prevState,
        [page]: list,
      }));
    }
  };

  // concat component to formData
  const concatFormData = (key, values) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: prevFormData[key].concat(values),
    }));
  };

  // remove component from formData
  const removeFormData = (key) => {
    setFormData((prevFormData) => {
      const formDataCopy = { ...prevFormData };
      formDataCopy[key].pop();
      return formDataCopy;
    });
  };

  // validate each step of the form
  const validateStep = async (formData) => {
    const stepSchema = schema.fields[Object.keys(orderedFormData)[step - 1]];
    const toValidate = formData[Object.keys(orderedFormData)[step - 1]];

    try {
      setErrorMessage('');
      // Validate the form data against the schema
      await stepSchema.validate(toValidate, { abortEarly: false });

      return { success: true };
    } catch (error) {
      if (error.inner) {
        const errors = {};
        error.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setErrorMessage(errors);
        console.log(errors);
        return { success: false, errors };
      } else {
        return { success: false, errors: [error.message] };
      }
    }
  };

  // for each step of form, validate the data against schema
  // function for going to next step by increasing step state by 1
  // and to set component list
  const nextQuestionHandler = async (formData, page = '', list = []) => {
    const promiseResult = await validateStep(formData);
    console.log(promiseResult);
    // If the validation is successful, continue to the next question
    if (promiseResult.success) {
      componentHandler(page, list);
      setStep((prevStep) => prevStep + 1);
    }
  };

  // function for going to previous step by decreasing step state by 1
  // and to set component list
  const prevQuestionHandler = (page = '', list = []) => {
    componentHandler(page, list);
    setStep((prevStep) => prevStep - 1);
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
      const newImageUri = 'file:///' + result.uri.split('file:/').join('');

      var img = formData[page];
      img[input] = {
        uri: newImageUri,
        name: newImageUri.split('/').pop(),
        type: mime.getType(newImageUri),
      };

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
      // set show as false when date is selected on datepicker
      if (Platform.OS === 'android') {
        setShow((prevState) => ({
          ...prevState,
          [input]: false,
        }));
      }
      if (page === 'patientInfo') {
        const newData = formData[page];
        // additional check to convert HomeNo and HandphoneNo to string
        if (input === 'HomeNo' || input === 'HandphoneNo') {
          newData[input] = e.toString(); // convert to string
        } else if (input === 'IsChecked') {
          newData[input] = !formData.patientInfo.IsChecked; // opposite boolean value of IsChecked
          if (!newData[input]) {
            // if IsChecked is false, reset End Date to beginning of epoch time
            newData['EndDate'] = new Date(0);
          }
        } else {
          newData[input] = date
            ? date
            : e.$d //e['$d']-check if input from MUI date-picker
            ? e.$d
            : parseInt(e) // check if integer (for dropdown)
            ? parseInt(e) // change to integer
            : e; // eg. guardianInfo[0].FirstName = e
        }

        setFormData((prevState) => ({
          ...prevState,
          [page]: newData,
        }));
      } else {
        // guardianInfo or allergyInfo
        const newData = formData[page].slice();

        // additional check to convert ContactNo  to string
        if (input === 'ContactNo') {
          newData[index][input] = date
            ? date
            : parseInt(e) // check if integer (for dropdown)
            ? parseInt(e).toString() // change to string
            : e.toString(); // convert to string
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
          nextQuestionHandler={nextQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          componentList={componentList}
          pickImage={pickImage}
          show={show}
          setShow={setShow}
          errorMessage={errorMessage}
        />
      );
    case 2:
      return (
        <PatientAddGuardianScreen
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          componentList={componentList}
          errorMessage={errorMessage}
          concatFormData={concatFormData}
          removeFormData={removeFormData}
        />
      );
    case 3:
      return (
        <PatientAddAllergyScreen
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleFormData}
          formData={formData}
          componentList={componentList}
          validateStep={validateStep}
          errorMessage={errorMessage}
          concatFormData={concatFormData}
          removeFormData={removeFormData}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;
