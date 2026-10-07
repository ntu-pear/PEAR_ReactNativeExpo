// Libs
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import mime from 'mime';
import * as ImagePicker from 'expo-image-picker';

// API
import patientApi from 'app/api/patient';
import guardianApi from 'app/api/guardian';
import AuthContext from 'app/auth/context';
import { currentUserId } from 'app/utility/medicationAdminister';
import privacyLevelApi from 'app/api/privacyLevel';

// Configurations
import routes from 'app/navigation/routes';

// Utilities
import patientDraft from 'app/utility/patientDraft';
import { createPatientWithPrimary } from 'app/utility/patientCreation';
import { opaqueId } from 'app/utility/patientFieldPolicy';

// Components
import PatientAddPatientInfoScreen from 'app/screens/PatientAddPatientInfoScreen';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
import PatientAddAllergyScreen from 'app/screens/PatientAddAllergyScreen';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientAddScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext) || {};
  const currentAccount = useRef(user);
  currentAccount.current = user;
  const activeScreen = useRef(true);
  useEffect(() => {
    activeScreen.current = true;
    return () => {
      activeScreen.current = false;
    };
  }, []);

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
  const currentForm = useRef(formData);
  currentForm.current = formData;

  // Track whether the form has been touched (to avoid saving defaults as a draft)
  const formTouched = useRef(false);

  // Restore draft on mount (if one exists)
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  useEffect(() => {
    const restore = async () => {
      const draft = await patientDraft.loadDraft();
      if (draft) {
        Alert.alert(
          'Resume Draft',
          'You have an unsaved patient form. Would you like to continue where you left off?',
          [
            {
              text: 'Discard',
              style: 'destructive',
              onPress: async () => {
                await patientDraft.clearDraft();
                setIsDraftLoading(false);
              },
            },
            {
              text: 'Resume',
              onPress: () => {
                setFormData(draft.formData);
                setStep(draft.step);
                if (draft.componentList) {
                  setComponentList(draft.componentList);
                }
                formTouched.current = true;
                setIsDraftLoading(false);
              },
            },
          ],
        );
      } else {
        setIsDraftLoading(false);
      }
    };
    restore();
  }, []);

  // Auto-save draft on form or step changes (debounced 800ms)
  useEffect(() => {
    if (isDraftLoading || !formTouched.current) {
      return;
    }

    const timer = setTimeout(() => {
      patientDraft.saveDraft(formData, step, componentList);
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, step, componentList, isDraftLoading]);

  // Navigation guard — warn user if they navigate away with unsaved data
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Allow navigation if form hasn't been touched or submission is in progress
      if (!formTouched.current || isSubmitting) {
        return;
      }

      // Prevent default back action
      e.preventDefault();

      Alert.alert(
        'Discard Changes?',
        'You have unsaved patient data. If you leave, your draft will be saved and you can resume later.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, isSubmitting]);

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
    }
  };

  // Function to update patient data
  const handlePatientData = (field) => (e) => {
    formTouched.current = true;
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
    formTouched.current = true;
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
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date;
  };

  const submitting = useRef(false);
  const onSubmit = async () => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    try {
      const actor = opaqueId(currentUserId(user));
      const patientInfo = formData.patientInfo;
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
        CreatedById: String(actor),
        ModifiedById: String(actor),
      };
      const outcome = await createPatientWithPrimary({
        api: patientApi,
        patient: patientPayload,
        guardians: formData.guardianInfo,
        user,
        guardianApi,
        isSelectionCurrent: () =>
          activeScreen.current &&
          currentAccount.current === user &&
          currentForm.current === formData,
      });
      if (!outcome.created) {
        Alert.alert(
          outcome.unknown
            ? 'Patient creation not confirmed'
            : 'Patient not added',
          outcome.unknown
            ? 'A patient creation request is unconfirmed. Check the patient list with the staging team before submitting again. This draft has been retained.'
            : 'The patient and primary guardian could not be created. Review the information and try again after the error is resolved.',
        );
        return;
      }
      const followups = [];
      if (outcome.invalidIdentity) {
        followups.push(
          'The returned patient identity could not be verified. Check the patient list before taking further action.',
        );
      }
      if (outcome.secondary === 'failed' || outcome.secondary === 'unknown') {
        followups.push(
          'The secondary guardian was not confirmed. Review the guardian section; do not submit this patient again.',
        );
      }
      if (outcome.patientId && !outcome.invalidIdentity) {
        if (patientInfo.UploadProfilePicture?.uri) {
          try {
            const r = await patientApi.uploadPatientProfilePictureV1(
              outcome.patientId,
              patientInfo.UploadProfilePicture,
            );
            if (!r?.ok) {
              followups.push('The profile picture was not uploaded.');
            }
          } catch (error) {
            followups.push('The profile picture upload was not confirmed.');
          }
        }
        try {
          const r = await privacyLevelApi.createPrivacyLevel({
            patientId: outcome.patientId,
            privacyLevel: patientPayload.privacyLevel,
          });
          if (!r?.ok) {
            followups.push('The privacy record was not confirmed.');
          }
        } catch (error) {
          followups.push('The privacy record was not confirmed.');
        }
      }
      formTouched.current = false;
      await patientDraft.clearDraft();
      navigation.navigate(routes.PATIENTS_SCREEN);
      Alert.alert(
        followups.length
          ? 'Patient created; follow-up required'
          : 'Patient and primary guardian added',
        followups.join('\n'),
      );
    } catch (error) {
      Alert.alert(
        'Patient creation not confirmed',
        error.message || 'Check the patient list before submitting again.',
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  // Show loading while checking for existing draft
  if (isDraftLoading) {
    return <ActivityIndicator visible />;
  }

  switch (step) {
    case 1:
      return (
        <PatientAddPatientInfoScreen
          testID="addPatients_patient"
          nextQuestionHandler={nextQuestionHandler}
          handleFormData={handlePatientData}
          formData={formData}
          pickImage={pickImage}
        />
      );
    case 2:
      if (isSubmitting) {
        return <ActivityIndicator visible />;
      }
      return (
        <PatientAddGuardianScreen
          testID="addPatients_guardian"
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
