// Libs
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import mime from 'mime';
import * as ImagePicker from 'expo-image-picker';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';

// Components
import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
import PatientAddAllergyScreen from 'app/screens/PatientAddAllergyScreen';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientAddScreen() {
  const navigation = useNavigation();

  // State to keep track of which page of the form is loaded
  const [step, setStep] = useState(1);

  // State to keep track of whether user pressed subnmit button
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      PostalCode: '',
      TempAddress: '',
      TempPostalCode: '',
      HomeNo: '',
      HandphoneNo: '',
      Gender: 'M',
      DOB: maximumDOB,
      StartDate: newDate,
      IsChecked: false, // additional item to check if user wants to enter EndDate value
      EndDate: new Date(), // default value of EndDate is beginning of Epoch time
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
        PostalCode: '',
        TempAddress: '',
        TempPostalCode: '',
        Gender: 'M',
        PreferredName: '',
      },
    ],

    allergyInfo: [
      {
        AllergyListID: 2,
        AllergyReactionListID: 1,
        AllergyRemarks: '',
      },
    ],
  };

  const [formData, setFormData] = useState(addPatientData);

  // Function to handle form sections which can have multiple items (like allergies/guardians - can have multiple)
  const componentHandler = (page = '', list = []) => {
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

      var newData = formData['patientInfo'];
      newData[input] = {
        uri: newImageUri,
        name: newImageUri.split('/').pop(),
        type: mime.getType(newImageUri),
      };

      setFormData((prevState) => ({
        ...prevState,
        ['patientInfo']: newData,
      }));

      console.log(newData);
    }
  };

  // Function to update patient data
  const handlePatientData = (field) => (e) => {
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
      patientInfo: newData,
    }));
  };

  // Function to update guardian data
  const handleGuardianData = (field, i) => (e) => {
    const newData = formData.guardianInfo;

    if (field === 'RelationshipID') {
      newData[i][field] = parseInt(e);
    } else {
      newData[i][field] = e;
    }

    setFormData((prevState) => ({
      ...prevState,
      guardianInfo: newData,
    }));
  };

  // Function to update patient data
  const handleAllergyData = (field, i) => (e) => {
    const newData = formData.allergyInfo;

    if (field === 'AllergyListID' || field === 'AllergyReactionListID') {
      newData[i][field] = parseInt(e);
    } else {
      newData[i][field] = e;
    }

    setFormData((prevState) => ({
      ...prevState,
      allergyInfo: newData,
    }));
  };

  // Function to submit form
  const onSubmit = async () => {
    setIsSubmitting(true);
    console.log(formData);
    const result = await patientApi.addPatient(formData);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      const allocations = result.data.data.patientAllocationDTO;
      const caregiver = allocations.caregiverName;
      const doctor = allocations.doctorName;
      const gameTherapist = allocations.gameTherapistName;

      alertTitle = 'Successfully added Patient';
      alertDetails = `Patient has been allocated to\nCaregiver: ${caregiver}\nDoctor: ${doctor}\nGame Therapist: ${gameTherapist}`;

      navigation.navigate(routes.PATIENTS_SCREEN);
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Adding Patient';
    }
    Alert.alert(alertTitle, alertDetails);
    setIsSubmitting(false);
  };

  switch (step) {
    case 1:
      return (
        <PatientAddPatientInfoScreen
          testID='addPatients_patient'
          nextQuestionHandler={nextQuestionHandler}
          handleFormData={handlePatientData}
          formData={formData}
          pickImage={pickImage}
        />
      );
    case 2:
      return (
        <PatientAddGuardianScreen
          testID='addPatients_guardian'
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleGuardianData}
          formData={formData}
          componentList={componentList}
          concatFormData={concatFormData}
          removeFormData={removeFormData}
        />
      );
    case 3:
      if(isSubmitting) {
        return (<ActivityIndicator visible/>)  
      } 
      return (
        <PatientAddAllergyScreen
          testID='addPatients_allergy'
          nextQuestionHandler={nextQuestionHandler}
          prevQuestionHandler={prevQuestionHandler}
          handleFormData={handleAllergyData}
          formData={formData}
          componentList={componentList}
          concatFormData={concatFormData}
          removeFormData={removeFormData}
          onSubmit={onSubmit}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;
