// Libs
import React, { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { useNavigate } from 'react-router-dom';

// API
import patientApi from 'app/api/patient';
import mime from 'mime';

// Configurations
import routes from 'app/navigation/routes';

// Components
import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
import PatientAddAllergyScreen from 'app/screens/PatientAddAllergyScreen';
import * as ImagePicker from 'expo-image-picker';

function PatientAddScreen() {
  const navigation = useNavigation();

  // State to keep track of which page of the form is loaded
  const [step, setStep] = useState(1);
  
  // State to keep track of whether specific datepicker is open
  const [show, setShow] = useState({
    DOB: false,
    StartDate: false,
    EndDate: false,
  });

  //  State for components
  const [componentList, setComponentList] = useState({
    guardian: [{}],
    allergy: [{}],
  });

  //  Maximum accepted value for date of birth
  const newDate = new Date();
  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

  const addPatientData = {
    patientInfo: {
      FirstName: '',
      LastName: '',
      PreferredName: '',
      PreferredLanguageListID: 1,
      NRIC: '',
      Address: '',
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
        FirstName: '',
        LastName: '',
        NRIC: '',
        IsChecked: false, // additional item to check if guardian wishes to log in in the future. if yes, email is required
        Email: '',
        RelationshipID: 1,
        IsActive: true,
        ContactNo: '',
        DOB: maximumDOB,
        Address: '',
        TempAddress: '',
        Gender: 'M',
        PreferredName: '',
      },
    ],

    allergyInfo: [
      {
        AllergyListID: 2,
        AllergyReactionListID: null,
        AllergyRemarks: '',
      },
    ],
  };

  const [formData, setFormData] = useState(addPatientData);

  
  const componentHandler = (page = '', list = []) => {
    console.log(1, list)
    if (list) {
      setComponentList((prevState) => ({
        // eg. componentList: { guardian: [{..}, {..}] }
        ...prevState,
        [page]: list,
      }));
    }
  };

  const concatFormData = (key, values) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: prevFormData[key].concat(values),
    }));
  };

  // Remove component from formData
  const removeFormData = (key) => {
    setFormData((prevFormData) => {
      const formDataCopy = { ...prevFormData };
      formDataCopy[key].pop();
      return formDataCopy;
    });
  };

  // Function to load next page of form
  const nextQuestionHandler = async (formData, page = '', list = []) => {
    componentHandler(page, list);
    setStep((prevStep) => prevStep + 1);
  };

  // Function to load previous step of form
  const prevQuestionHandler = (page = '', list = []) => {
    componentHandler(page, list);
    setStep((prevStep) => prevStep - 1);
  };

  // Function to launch image picker and handle image picking.
  // Reference: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  const pickImage = (input) => async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
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
  
  
  //  Set show of a field as false when date is selected on a specific datepicker
  const setShowFalse = (field) => {
    if (Platform.OS === 'android') {
      setShow((prevState) => ({
        ...prevState,
        [field]: false,
      }));
    }
  }
 
  // Function to update patient data
  const handlePatientData = (field) => (e) => {
    setShowFalse(field)

    const newData = formData.patientInfo;

    if (field === 'IsChecked') {
      newData[field] = !formData.patientInfo.IsChecked;
      if (!newData[field]) {
        newData.EndDate = new Date(0); // if IsChecked is false, reset End Date to beginning of epoch time
      }
    } else if (field === 'PreferredLanguageListID') {
      newData[field] = parseInt(e);
    } else {
      newData[field] = e; 
    }

    setFormData((prevState) => ({
      ...prevState,
      patientInfo : newData,
    }));
  };

  // Function to update patient data
  const handleGuardianData = (field) => (e) => {
    setShowFalse(field)

    const newData = formData.patientInfo;

    if (field === 'IsChecked') {
      newData[field] = !formData.patientInfo.IsChecked;
      if (!newData[field]) {
        newData.EndDate = new Date(0); // if IsChecked is false, reset End Date to beginning of epoch time
      }
    } else if (field === 'PreferredLanguageListID') {
      newData[field] = parseInt(e);
    } else {
      newData[field] = e; 
    }

    setFormData((prevState) => ({
      ...prevState,
      patientInfo : newData,
    }));
  };

  // Function to handle form input data by taking onchange value and updating our previous form data state
  const handleFormData = 
    (page = '', input, index = null) =>
    (e, date = null) => {
      // set show as false when date is selected on datepicker
      // console.log('index: ', page, index);
      if (Platform.OS === 'android') {
        setShow((prevState) => ({
          ...prevState,
          [input]: false,
        }));
      }
      if (page === 'patientInfo') {
        const newData = formData[page];
        // additional check to convert HomeNo and HandphoneNo to string
        if (
          input === 'HomeNo' ||
          input === 'HandphoneNo' ||
          // BUGFIX: Address not saved properly when number specifed first -- Justin
          // soln: Address is included: fixes a bug where if number is specified first address will not be captured properly
          // i.e: '123 abc lane' -- saved as --> '123'
          input === 'Address' ||
          input === 'TempAddress'
        ) {
          newData[input] = e.toString(); // convert to string
        } else if (input === 'IsChecked') {
          newData[input] = !formData.patientInfo.IsChecked; // opposite boolean value of IsChecked
          if (!newData[input]) {
            // if IsChecked is false, reset End Date to beginning of epoch time
            newData.EndDate = new Date(0);
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
        if (
          input === 'ContactNo' ||
          input === 'Address' ||
          input === 'TempAddress'
        ) {
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
        // console.log('formData = ', formData);
      }
    };

  // Function to submit form
  const submitForm = async () => {
    // -- Validation is now real-time no need to have on submit validation - Justin
    const result = await patientApi.addPatient(formData);

    // let alertTxt = '';
    let alertTitle = '';
    let alertDetails = '';

    // console.log('response: ', result);

    if (result.ok) {
      const allocations = result.data.data.patientAllocationDTO;
      const caregiver = allocations.caregiverName;
      const doctor = allocations.doctorName;
      const gameTherapist = allocations.gameTherapistName;

      alertTitle = 'Successfully added Patient';
      alertDetails = `Patient has been allocated to\nCaregiver: ${caregiver}\nDoctor: ${doctor}\nGame Therapist: ${gameTherapist}`;
      // alertTxt = alertTitle + alertDetails;
      // Platform.OS === 'web'
      //   ? navigate('/' + routes.PATIENTS)
      //   : navigation.navigate(routes.PATIENTS_SCREEN);
      navigation.navigate(routes.PATIENTS_SCREEN);
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Adding Patient';
      // alertTxt = alertTitle + alertDetails;
    }
    // Platform.OS === 'web'
    //   ? alert(alertTxt)
    //   : Alert.alert(alertTitle, alertDetails);
    // }
    Alert.alert(alertTitle, alertDetails);
  };

  switch (step) {
    case 1:
      return (
        <PatientAddPatientInfoScreen
          nextQuestionHandler={nextQuestionHandler}
          handleFormData={handlePatientData}
          formData={formData}
          componentList={componentList}
          pickImage={pickImage}
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
          concatFormData={concatFormData}
          removeFormData={removeFormData}
          onSubmitFunction={submitForm}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;
