/*eslint eslint-comments/no-unlimited-disable: error */
// Libs
import {
  AspectRatio,
  Box,
  Center,
  Divider,
  Image,
  ScrollView,
  Stack,
  Text,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome';

// API
import patientApi from 'app/api/patient';
import doctorNoteApi from 'app/api/doctorNote';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import InformationCard from 'app/components/InformationCard';

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [isSocialHistoryLoading, setIsSocialHistoryLoading] = useState(true);
  const [isGuardianLoading, setIsGuardianLoading] = useState(true);
  const [isDoctorsNoteLoading, setIsDoctorsNoteLoading] = useState(true);

  const [guardianData, setGuardianData] = useState([]);
  const [guardianInfoData, setGuardianInfoData] = useState([]);
  const [secondGuardianInfoData, setSecondGuardianInfoData] = useState([]);
  const [isSecondGuardian, setIsSecondGuardian] = useState(false);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [socialHistoryInfo, setSocialHistoryInfo] = useState([]);
  const [patientProfile, setPatientProfile] = useState({});
  const [patientData, setPatientData] = useState([]);
  const [doctorsNoteData, setDoctorNoteData] = useState([]);
  const [doctorsNoteInfo, setDoctorNoteInfo] = useState([]);
  const [unMaskedPatientNRIC, setUnMaskedPatientNRIC] = useState('');
  const [unMaskedGuardianNRIC, setUnMaskedGuardianNRIC] = useState('');
  const [unMasked2ndGuardianNRIC, setUnMasked2ndGuardianNRIC] = useState('');

  const [ activeSections, setActiveSections ] = useState([]);
  const [ sections, setSections ] = useState([]);

  // Used to retrieve the patient since after an editing of the patients particulars it will need to be refreshed - Russell
  const retrievePatient = async (id) => {
    const response = await patientApi.getPatient(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setPatientProfile(response.data.data);
    setUnMaskedPatientNRIC(response.data.data.nric);
  };

  const retrieveSocialHistory = async (id) => {
    const response = await socialHistoryApi.getSocialHistory(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    if (response.data.data === null) {
      setSocialHistoryData([]);
    } else {
      setSocialHistoryData(response.data.data);
    }
  };

  const retrieveGuardian = async (id) => {
    const response = await guardianApi.getPatientGuardian(id, false);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setGuardianData(response.data.data);
  };

  const retrieveDoctorsNote = async (id) => {
    const response = await doctorNoteApi.getDoctorNote(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setDoctorNoteData(response.data.data);
    console.log('doctor notes', response.data.data);
  };

  // Data used for display, sent to InformationCard
  // const patientData = [
  //   { label: 'First Name', value: patientProfile.firstName },
  //   { label: 'Last Name', value: patientProfile.lastName },
  //   { label: 'NRIC', value: unMaskedPatientNRIC.replace(/\d{4}(\d{3})/, 'xxxx$1') },
  //   {
  //     label: 'Gender',
  //     value: patientProfile.gender === 'F' ? 'Female' : 'Male',
  //   },
  //   {
  //     label: 'DOB',
  //     value: patientProfile.dob || '-',
  //   },
  //   {
  //     label: 'Home Number',
  //     value: patientProfile.homeNo || '-',
  //   },
  //   {
  //     label: 'Mobile Number',
  //     value: patientProfile.handphoneNo || '-',
  //   },
  //   {
  //     label: 'Address',
  //     value: patientProfile.address || '-',
  //   },
  //   {
  //     label: 'Temp. Address',
  //     value: patientProfile.tempAddress || '-',
  //   },
  //   {
  //     label: 'Start Date',
  //     value: patientProfile.startDate || '-',
  //   },
  //   {
  //     label: 'End Date',
  //     value: patientProfile.endDate || '-',
  //   },
  //   {
  //     label: 'Respite Care',
  //     value: patientProfile.isRespiteCare ? 'Yes' : 'No',
  //   },
  // ];

  const preferenceData = [
    {
      label: 'Preferred name',
      value: patientProfile.preferredName || '-',
    },
    {
      label: 'Preferred language',
      value: patientProfile.preferredLanguage || '-',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (patientProfile !== undefined && Object.keys(patientProfile).length>0) {
        setPatientData([
          { label: 'First Name', value: patientProfile.firstName },
          { label: 'Last Name', value: patientProfile.lastName },
          { label: 'NRIC', value: unMaskedPatientNRIC.replace(/\d{4}(\d{3})/, 'xxxx$1') },
          {
            label: 'Gender',
            value: patientProfile.gender === 'F' ? 'Female' : 'Male',
          },
          {
            label: 'DOB',
            value: patientProfile.dob || '-',
          },
          {
            label: 'Home Number',
            value: patientProfile.homeNo || '-',
          },
          {
            label: 'Mobile Number',
            value: patientProfile.handphoneNo || '-',
          },
          {
            label: 'Address',
            value: patientProfile.address || '-',
          },
          {
            label: 'Temp. Address',
            value: patientProfile.tempAddress || '-',
          },
          {
            label: 'Start Date',
            value: patientProfile.startDate || '-',
          },
          {
            label: 'End Date',
            value: patientProfile.endDate || '-',
          },
          {
            label: 'Respite Care',
            value: patientProfile.isRespiteCare ? 'Yes' : 'No',
          }
        ]);
      }
    }
  }, [patientProfile]);

  useEffect(() => {
    if (doctorsNoteData !== null && Object.keys(doctorsNoteData).length>0) {
      var lastItem = doctorsNoteData.pop();
      setDoctorNoteInfo([
        {
          label: "Date",
          value: lastItem.date || '-',
        },
        {
          label: "Doctor's Name",
          value: lastItem.doctorName || '-',
        },
        {
          label: "Doctor's ID",
          value: lastItem.doctorId || '-',
        },
        {
          label: "Doctor's Remarks",
          value: lastItem.doctorRemarks || '-',
        },
      ]);
    }
  }, [doctorsNoteData]);

  useEffect(() => {
    if (Object.keys(guardianData).length>0) {
      // get data of first guardian
      setUnMaskedGuardianNRIC(guardianData.guardian.nric);
      setGuardianInfoData([
        {
          label: 'First Name',
          value: guardianData.guardian.firstName || '-',
        },
        {
          label: 'Last Name',
          value: guardianData.guardian.lastName || '-',
        },
        {
          label: 'Preferred Name',
          value: guardianData.guardian.preferredName || '-',
        },
        {
          label: 'NRIC',
          value: guardianData.guardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || '-',
        },
        {
          label: 'Gender',
          value: guardianData.guardian.gender || '-',
        },
        {
          label: 'Email',
          value: guardianData.guardian.email || '-',
        },
        {
          label: "Relationship",
          value: guardianData.guardian.relationship || '-',
        },
        {
          label: 'Contact Number',
          value: guardianData.guardian.contactNo || '-',
        },
        {
          label: 'DOB',
          value: guardianData.guardian.dob || '-',
        },
        {
          label: 'Address',
          value: guardianData.guardian.address || '-',
        },
        {
          label: 'Temp. Address',
          value: guardianData.guardian.tempAddress || '-',
        },
      ]);
    }
    // get data of 2nd guardian if any.
    if (
      guardianData &&
      guardianData.additionalGuardian &&
      guardianData.additionalGuardian.nric !== null &&
      guardianData.additionalGuardian.nric !==
        guardianData.guardian.nric
    ) {
      setIsSecondGuardian(true);
      setUnMasked2ndGuardianNRIC(guardianData.additionalGuardian.nric);
      setSecondGuardianInfoData([
        {
          label: 'First Name',
          value: guardianData.additionalGuardian.firstName || '-',
        },
        {
          label: 'Last Name',
          value: guardianData.additionalGuardian.lastName || '-',
        },
        {
          label: 'Preferred Name',
          value: guardianData.additionalGuardian.preferredName || '-',
        },
        {
          label: 'NRIC',
          value: guardianData.additionalGuardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || '-',
        },
        {
          label: 'Gender',
          value: guardianData.additionalGuardian.gender || '-',
        },
        {
          label: 'Email',
          value: guardianData.additionalGuardian.email || '-',
        },
        {
          label: "Relationship",
          value: guardianData.additionalGuardian.relationship || '-',
        },
        {
          label: 'Contact Number',
          value: guardianData.additionalGuardian.contactNo || '-',
        },
        {
          label: 'DOB',
          value: guardianData.additionalGuardian.dob || '-',
        },
        {
          label: 'Address',
          value: guardianData.additionalGuardian.address || '-',
        },
        {
          label: 'Temp. Address',
          value: guardianData.additionalGuardian.tempAddress || '-',
        },
      ]);
    }
  }, [guardianData]);

  useEffect(() => {
    if (socialHistoryData !== null && Object.keys(socialHistoryData).length>0) {
      setSocialHistoryInfo([
        {
          label: 'Live with',
          value: socialHistoryData.liveWithDescription || '-',
        },
        {
          label: 'Education',
          value: socialHistoryData.educationDescription || '-',
        },
        {
          label: 'Occupation',
          value: socialHistoryData.occupationDescription || '-',
        },
        {
          label: 'Religion',
          value: socialHistoryData.religionDescription || '-',
        },
        {
          label: 'Pet',
          value: socialHistoryData.petDescription || '-',
        },
        {
          label: 'Diet',
          value: socialHistoryData.dietDescription || '-',
        },
        {
          label: 'Exercise',
          value: socialHistoryData.exercise,
        },
        {
          label: 'Sexually active',
          value: socialHistoryData.sexuallyActive,
        },
        {
          label: 'Drug use',
          value: socialHistoryData.drugUse,
        },
        {
          label: 'Caffeine use',
          value: socialHistoryData.caffeineUse,
        },
        {
          label: 'Alcohol use',
          value: socialHistoryData.alcoholUse,
        },
        {
          label: 'Tobacco use',
          value: socialHistoryData.tobaccoUse,
        },
        {
          label: 'Secondhand smoker',
          value: socialHistoryData.secondhandSmoker,
        },
      ]);
    }
  }, [socialHistoryData]);

  // used to call api when page loads
  useEffect(() => {
    retrievePatient(patientID);
    retrieveSocialHistory(patientID);
    retrieveGuardian(patientID);
    retrieveDoctorsNote(patientID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // used to confirm that data has returned from apis before loading the page - Russell
  useEffect(() => {
    if(patientProfile !== undefined && Object.keys(patientProfile).length>0){
      setIsPatientLoading(false);
    }
    if(socialHistoryData !== undefined){
      setIsSocialHistoryLoading(false);
    }
    if(guardianData !== undefined && guardianData.length !== 0){
      setIsGuardianLoading(false);
    }
    if(doctorsNoteData !== undefined){
      setIsDoctorsNoteLoading(false);
    }
    if(isPatientLoading === false && isSocialHistoryLoading === false && isGuardianLoading === false && isDoctorsNoteLoading === false ){
      setIsLoading(false);
    }
  }, [patientProfile, isPatientLoading, socialHistoryData, isSocialHistoryLoading, 
    guardianData, isGuardianLoading, doctorsNoteData, isDoctorsNoteLoading]);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      setPatientProfile({});
      setSocialHistoryData([]);
      setSocialHistoryInfo([]);
      setGuardianData([]);
      setGuardianInfoData([]);
      setSecondGuardianInfoData([]);
      setDoctorNoteData([]);
      setDoctorNoteInfo([]);
      setIsLoading(true);
      setIsPatientLoading(true);
      setIsSocialHistoryLoading(true);
      setIsGuardianLoading(true);
      setIsDoctorsNoteLoading(true);
      retrievePatient(patientID, true)
      retrieveSocialHistory(patientID);
      retrieveGuardian(patientID);
      retrieveDoctorsNote(patientID);
    });
    return navListener;
  }, [navigation]);

  // Handling of InformationCard editing button onPress
  const handlePatientInfoOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_INFO, { 
      patientProfile: patientProfile,
      navigation: navigation,
    })
  };
  
  const handlePatientPrefOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_PREFERENCES, {
      patientProfile: patientProfile,
      navigation: navigation,
    })
  };
  
  const handlePatientGuardianOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_GUARDIAN, { 
      guardianProfile: guardianData.guardian,
      navigation: navigation,
    })
  };
  
  const handlePatientSecondGuardianOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_GUARDIAN, { 
      guardianProfile: guardianData.additionalGuardian,
      navigation: navigation,
    })
  };
  
  const handlePatientSocialHistOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_SOCIALHIST, { 
      socialHistory: socialHistoryData,
      patientID: patientID,
      navigation: navigation,
    })
  };

  const handleOnPress = (title) => {
    switch(title) {
      case 'Patient Information':
        return handlePatientInfoOnPress;
        break;
      case 'Patient Preferences':
        return handlePatientPrefOnPress;
        break;
      case 'Guardian(s) Information':
        return handlePatientGuardianOnPress;
        break;
      case 'Guardian 2':
        return handlePatientSecondGuardianOnPress;
        break;
      case 'Social History':
        return handlePatientSocialHistOnPress;
        break;
      default:
        return null;
    }
  };

  const unmaskedNRIC = (title) => {
    switch(title) {
      case 'Patient Information':
        return unMaskedPatientNRIC;
        break;
      case 'Guardian(s) Information':
        return unMaskedGuardianNRIC;
        break;
      case 'Guardian 2':
        return unMasked2ndGuardianNRIC;
        break;
      default:
        return null;
    }
  };

  useEffect(() => {
    setSections([
      {
        title: 'Patient Information',
        content: patientData
      },
      {
        title: 'Patient Preferences',
        content: preferenceData
      },
      {
        title: "Doctor's Notes",
        content: doctorsNoteInfo
      },
      {
        title: 'Guardian(s) Information',
        content: guardianInfoData
      },
      {
        title: 'Social History',
        content: socialHistoryInfo
      }
    ]);
    console.log('guardian? ', guardianInfoData);
  }, [patientData]);

  function renderHeader(section, _, isActive) {
    return (
      <View style={styles.accordHeader}>
        <Text style={styles.accordTitle}>{section.title}</Text>
        <Icon name={ isActive ? 'chevron-up' : 'chevron-down' } size={30} color={colors.black} />
      </View>
    );
  };

  function renderContent(section, _, isActive) {
    return (
      <View style={styles.accordBody}>
        <InformationCard 
          // title={section.title}
          subtitle={(section.title == 'Guardian(s) Information' && isSecondGuardian) ? 'Guardian 1' : null}
          displayData={section.content}
          handleOnPress={handleOnPress(section.title)}
          unMaskedNRIC={unmaskedNRIC(section.title)}
        />
        {(section.title === "Guardian(s) Information" && isSecondGuardian) ? (
          <InformationCard 
            // title={section.title}
            subtitle={'Guardian 2'}
            displayData={secondGuardianInfoData}
            handleOnPress={handlePatientSecondGuardianOnPress}
            unMaskedNRIC={unmaskedNRIC('Guardian 2')}
          />
        ) : null }
      </View>
    );
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      <ScrollView width="100%">

        <Accordion 
          align="bottom" 
          sections={sections}
          activeSections={activeSections}
          renderHeader={renderHeader}
          renderContent={renderContent}
          onChange={ (sections) => setActiveSections(sections) }
          sectionContainerStyle={styles.accordContainer}
        />

      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({
  // pictureText: {
  //   color: colors.white_var1,
  //   fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
  //   fontSize: 24,
  //   paddingTop: 15,
  // },
  accordContainer: {
    paddingBottom: 4
  },
  accordHeader: {
    padding: 12,
    backgroundColor: '#eee',
    color: '#eee',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.green_lighter,
  },
  accordTitle: {
    fontSize: 30,
    paddingTop: 15,
    fontWeight: 'bold',
  },
  accordBody: {
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android
  }
});

export default PatientInformationScreen;
