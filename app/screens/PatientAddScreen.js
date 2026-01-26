// Libs
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import mime from 'mime';
import * as ImagePicker from 'expo-image-picker';

// API
import patientApi from 'app/api/patient';
import privacyLevelApi from 'app/api/privacyLevel';

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
    guardian: [{}], // At least 1 primary guardian required
  });

  //  Maximum accepted value for date of birth
  const newDate = new Date();
  const defaultDOB = new Date(); // Default to today's date, user can scroll to find correct DOB

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
      DOB: defaultDOB,
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
        ContactNo: '',
        NRIC: '',
        IsChecked: false,
        Email: '',
        RelationshipID: 1,
        RelationshipName: 'Husband',
        IsActive: true,
        DOB: new Date(), // Default to today's date
        Address: '',
        PostalCode: '',
        TempAddress: '',
        TempPostalCode: '',
        Gender: 'M',
        PreferredName: '',
      },
    ], // At least 1 primary guardian required
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

  // Helper to map RelationshipID to relationship name
  const getRelationshipNameById = (id) => {
    const relationships = {
      1: 'Husband',
      2: 'Wife',
      3: 'Child',
      4: 'Sibling',
      5: 'Parent',
      6: 'Grandchild',
      7: 'Friend',
      8: 'Nephew',
      9: 'Niece',
      10: 'Aunt',
      11: 'Uncle',
      12: 'Grandparent',
    };
    return relationships[id] || 'Other';
  };

  // Function to update guardian data
  const handleGuardianData = (field, i) => (e) => {
    const newData = formData.guardianInfo;

    if (field === 'RelationshipID') {
      const relationshipId = parseInt(e);
      newData[i][field] = relationshipId;
      newData[i]['RelationshipName'] = getRelationshipNameById(relationshipId);
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
      const parsedValue = parseInt(e);
      newData[i][field] = isNaN(parsedValue) ? 1 : parsedValue; // Default to 1 if NaN
    } else {
      newData[i][field] = e;
    }

    setFormData((prevState) => ({
      ...prevState,
      allergyInfo: newData,
    }));
  };

  // Helper to format date as ISO string
  const formatDate = (date) => {
    if (date instanceof Date) return date.toISOString();
    return date;
  };

  // Function to submit form
  const onSubmit = async () => {
    setIsSubmitting(true);
    console.log(formData);

    const patientInfo = formData.patientInfo;
    const guardianInfo = formData.guardianInfo;

    // Build patient payload matching new API schema
    const patientPayload = {
      name: `${patientInfo.FirstName} ${patientInfo.LastName}`.trim(),
      nric: String(patientInfo.NRIC || '').toUpperCase(),
      address: patientInfo.Address || '',
      tempAddress: patientInfo.TempAddress || '',
      homeNo: patientInfo.HomeNo || '',
      handphoneNo: patientInfo.HandphoneNo || '',
      gender: patientInfo.Gender || 'M',
      dateOfBirth: formatDate(patientInfo.DOB),
      isApproved: '1',
      preferredName: patientInfo.PreferredName || '',
      preferredLanguageId: patientInfo.PreferredLanguageListID || 1,
      updateBit: patientInfo.UpdateBit ? '1' : '0',
      autoGame: patientInfo.AutoGame ? '1' : '0',
      startDate: formatDate(patientInfo.StartDate),
      endDate: patientInfo.IsChecked ? formatDate(patientInfo.EndDate) : null,
      isActive: patientInfo.IsActive ? '1' : '0',
      isRespiteCare: patientInfo.IsRespiteCare ? '1' : '0',
      privacyLevel: parseInt(patientInfo.PrivacyLevel) || 2,
      terminationReason: patientInfo.TerminationReason || '',
      inActiveReason: patientInfo.InactiveReason || '',
      inActiveDate: null,
      profilePicture: '', // Will be updated separately if image was selected
      isDeleted: 0,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      CreatedById: '1',
      ModifiedById: '1',
    };

    // Create patient first
    const result = await patientApi.addPatient(patientPayload);
    
    console.log('[ADD PATIENT] API Response:', result);

    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      // Extract the new patient ID from the response
      const newPatientId = result.data?.data?.id || result.data?.id || result.data?.patientId;
      const isDeleted = result.data?.data?.isDeleted;
      console.log('[ADD PATIENT] Patient created with ID:', newPatientId);
      console.log('[ADD PATIENT] Patient isDeleted status:', isDeleted);
      console.log('[ADD PATIENT] Full patient data:', result.data?.data);
      
      // Check if patient is marked as deleted
      if (isDeleted === 1 || isDeleted === '1') {
        alertTitle = 'Error in Adding Patient';
        alertDetails = 'A patient with this NRIC already exists and is marked as deleted. Please use a different NRIC or contact support to restore the existing patient.';
        Alert.alert(alertTitle, alertDetails);
        setIsSubmitting(false);
        return;
      }

      // Upload profile picture if one was selected
      if (newPatientId && patientInfo.UploadProfilePicture && patientInfo.UploadProfilePicture.uri) {
        console.log('[ADD PATIENT] Uploading profile picture...');
        const imageUploadResult = await patientApi.uploadPatientProfilePictureV1(
          newPatientId,
          patientInfo.UploadProfilePicture
        );
        
        if (imageUploadResult.ok) {
          console.log('[ADD PATIENT] Profile picture uploaded successfully');
        } else {
          console.log('[ADD PATIENT] Failed to upload profile picture:', imageUploadResult.status, imageUploadResult.data);
          // Don't fail the whole operation if image upload fails
        }
      }

      // Create default privacy level (Medium = 2) for the new patient
      if (newPatientId) {
        console.log('[ADD PATIENT] Creating default privacy level (Medium)...');
        const privacyLevelPayload = {
          patientId: newPatientId,
          privacyLevel: 2, // Default to Medium
        };
        
        const privacyLevelResult = await privacyLevelApi.createPrivacyLevel(privacyLevelPayload);
        
        if (privacyLevelResult.ok) {
          console.log('[ADD PATIENT] Privacy level created successfully');
        } else {
          console.log('[ADD PATIENT] Failed to create privacy level:', privacyLevelResult.status, privacyLevelResult.data);
          // Don't fail the whole operation if privacy level creation fails
        }
      }

      // Create guardians (up to 2)
      // Primary guardian (index 0) is required
      // Secondary guardian (index 1) is optional - will be skipped if FirstName is empty
      if (newPatientId && guardianInfo && guardianInfo.length > 0) {
        for (let i = 0; i < Math.min(guardianInfo.length, 2); i++) {
          const guardian = guardianInfo[i];
          
          // Skip if guardian has no first name (empty/incomplete guardian)
          if (!guardian.FirstName || guardian.FirstName.trim() === '') continue;

          const guardianPayload = {
            active: 'Y',
            firstName: guardian.FirstName || '',
            lastName: guardian.LastName || '',
            preferredName: guardian.PreferredName || '',
            gender: guardian.Gender || 'M',
            contactNo: guardian.ContactNo || '',
            nric: String(guardian.NRIC || '').toUpperCase(),
            dateOfBirth: formatDate(guardian.DOB),
            address: guardian.Address || '',
            tempAddress: guardian.TempAddress || '',
            status: 'active',
            isDeleted: '0',
            guardianApplicationUserId: '',
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            CreatedById: '1',
            ModifiedById: '1',
            patientId: newPatientId,
            relationshipName: guardian.RelationshipName || getRelationshipNameById(guardian.RelationshipID),
          };
          
          // Only include email if guardian wants to log in (IsChecked is true)
          if (guardian.IsChecked && guardian.Email && guardian.Email.trim() !== '') {
            guardianPayload.email = guardian.Email;
          }

          const guardianResult = await patientApi.addGuardian(guardianPayload);
          
          if (!guardianResult.ok) {
            console.log(`[ADD PATIENT] Failed to create guardian ${i + 1}:`, guardianResult.status, guardianResult.data);
            console.log('[ADD PATIENT] Full error response:', JSON.stringify(guardianResult, null, 2));
            if (guardianResult.data?.detail) {
              console.log('[ADD PATIENT] Missing field details:', guardianResult.data.detail);
            }
          } else {
            console.log(`[ADD PATIENT] Guardian ${i + 1} created successfully`);
          }
        }
      }

      const allocations = result.data?.data?.patientAllocationDTO;
      if (allocations) {
        const caregiver = allocations.caregiverName;
        const doctor = allocations.doctorName;
        const gameTherapist = allocations.gameTherapistName;
        alertDetails = `Patient has been allocated to\nCaregiver: ${caregiver}\nDoctor: ${doctor}\nGame Therapist: ${gameTherapist}`;
      } else {
        alertDetails = 'Patient has been successfully added.';
      }

      alertTitle = 'Successfully added Patient';
      navigation.navigate(routes.PATIENTS_SCREEN);
    } else {
      // Extract error message from various possible locations in the response
      const errors = result.data?.message || result.data?.error || result.data?.errors || result.problem || 'Unknown error';

      alertDetails = result.data
        ? `\n${errors}\n\nPlease try again.`
        : 'Please try again.';

      alertTitle = 'Error in Adding Patient';
      console.log('[ADD PATIENT] Error response:', result);
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
      if(isSubmitting) {
        return (<ActivityIndicator visible/>)  
      }
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
          onSubmit={onSubmit}
        />
      );
    default:
      return <div className="App" />;
  }
}

export default PatientAddScreen;
