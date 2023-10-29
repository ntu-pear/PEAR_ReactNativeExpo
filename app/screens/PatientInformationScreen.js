/*eslint eslint-comments/no-unlimited-disable: error */
// Libs
import {
  Alert,
  AspectRatio,
  Box,
  Center,
  CloseIcon,
  Divider,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Stack,
  Text,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Hooks
import useApi from 'app/hooks/useApi';

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
import AppButton from 'app/components/AppButton';
import InformationCard from 'app/components/InformationCard';

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [isSocialHistoryLoading, setIsSocialHistoryLoading] = useState(true);
  const [isGuardianLoading, setIsGuardianLoading] = useState(true);
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);

  const [guardianData, setGuardianData] = useState([]);
  const [guardianInfoData, setGuardianInfoData] = useState([]);
  const [secondGuardianInfoData, setSecondGuardianInfoData] = useState([]);
  const [isSecondGuardian, setIsSecondGuardian] = useState(false);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [socialHistoryInfo, setSocialHistoryInfo] = useState([]);
  const [patientProfile, setPatientProfile] = useState({});
  const [unMaskedPatientNRIC, setUnMaskedPatientNRIC] = useState('');
  const [unMaskedGuardianNRIC, setUnMaskedGuardianNRIC] = useState('');
  const [unMasked2ndGuardianNRIC, setUnMasked2ndGuardianNRIC] = useState('');

  // Used to retrieve the patient since after an editing of the patients particulars it will need to be refreshed - Russell
  const retrievePatient = async (id) => {
    const response = await patientApi.getPatient(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setPatientProfile(response.data.data);
    setUnMaskedPatientNRIC(response.data.data.nric)
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
    const response = await guardianApi.getPatientGuardian(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setGuardianData(response.data.data);
  };

  // Data used for display, sent to InformationCard
  const patientData = [
    { label: 'First Name', value: patientProfile.firstName },
    { label: 'Last Name', value: patientProfile.lastName },
    { label: 'NRIC', value: unMaskedPatientNRIC.replace(/\d{4}(\d{3})/, 'xxxx$1') },
    {
      label: 'Gender',
      value: patientProfile.gender === 'F' ? 'Female' : 'Male',
    },
    {
      label: 'DOB',
      value: patientProfile.dob || 'Not available',
    },
    {
      label: 'Home Number',
      value: patientProfile.homeNo || 'Not available',
    },
    {
      label: 'Mobile Number',
      value: patientProfile.handphoneNo || 'Not available',
    },
    {
      label: 'Address',
      value: patientProfile.address || 'Not available',
    },
    {
      label: 'Temp. Address',
      value: patientProfile.tempAddress || 'Not available',
    },
    {
      label: 'Start Date',
      value: patientProfile.startDate || 'Not available',
    },
    {
      label: 'End Date',
      value: patientProfile.endDate || 'Not available',
    },
    {
      label: 'Respite Care',
      value: patientProfile.isRespiteCare ? 'Yes' : 'No',
    },
  ];

  const preferenceData = [
    {
      label: 'Preferred name',
      value: patientProfile.preferredName || 'Not available',
    },
    {
      label: 'Preferred language',
      value: patientProfile.preferredLanguage || 'Not available',
    },
  ];

  const doctorData = [
    {
      label: "Doctor's Notes",
      value:
        getDoctorNote.data.data &&
        getDoctorNote.data.data[0] &&
        getDoctorNote.data.data[0].doctorRemarks
          ? getDoctorNote.data.data[0].doctorRemarks
          : 'Not available',
    },
  ];

  useEffect(() => {
    if (Object.keys(guardianData).length>0) {
      // get data of first guardian
      setUnMaskedGuardianNRIC(guardianData.guardian.nric);
      setGuardianInfoData([
        {
          label: 'First Name',
          value: guardianData.guardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: guardianData.guardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: guardianData.guardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || 'Not Available',
        },
        {
          label: 'Email',
          value: guardianData.guardian.email || 'Not Available',
        },
        {
          label: "Patient's",
          value: guardianData.guardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: guardianData.guardian.contactNo || 'Not Available',
        },
        {
          label: 'DOB',
          value: guardianData.guardian.dob || 'Not Available',
        },
        {
          label: 'Address',
          value: guardianData.guardian.address || 'Not Available',
        },
        {
          label: 'Temp. Address',
          value: guardianData.guardian.tempAddress || 'Not Available',
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
          value: guardianData.additionalGuardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: guardianData.additionalGuardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: guardianData.additionalGuardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || 'Not Available',
        },
        {
          label: 'Email',
          value: guardianData.additionalGuardian.email || 'Not Available',
        },
        {
          label: "Patient's",
          value: guardianData.additionalGuardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: guardianData.additionalGuardian.contactNo || 'Not Available',
        },
        {
          label: 'DOB',
          value: guardianData.additionalGuardian.dob || 'Not Available',
        },
        {
          label: 'Address',
          value: guardianData.additionalGuardian.address || 'Not Available',
        },
        {
          label: 'Temp. Address',
          value: guardianData.additionalGuardian.tempAddress || 'Not Available',
        },
      ]);
    }
  }, [guardianData]);

  useEffect(() => {
    if (socialHistoryData !== null && Object.keys(socialHistoryData).length>0) {
      setSocialHistoryInfo([
        {
          label: 'Live with',
          value: socialHistoryData.liveWithDescription || 'Not Available',
        },
        {
          label: 'Education',
          value: socialHistoryData.educationDescription || 'Not Available',
        },
        {
          label: 'Occupation',
          value: socialHistoryData.occupationDescription || 'Not Available',
        },
        {
          label: 'Religion',
          value: socialHistoryData.religionDescription || 'Not Available',
        },
        {
          label: 'Pet',
          value: socialHistoryData.petDescription || 'Not Available',
        },
        {
          label: 'Diet',
          value: socialHistoryData.dietDescription || 'Not Available',
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
    getDoctorNote.request(patientID);
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
    if(guardianData !== undefined){
      setIsGuardianLoading(false);
    }
    if(isPatientLoading === false && isSocialHistoryLoading === false && isGuardianLoading === false){
      setIsLoading(false);
    }
  }, [patientProfile, isPatientLoading, socialHistoryData, isSocialHistoryLoading, guardianData, isGuardianLoading]);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      setGuardianData([]);
      setGuardianInfoData([]);
      setSecondGuardianInfoData([]);
      setSocialHistoryData([]);
      setSocialHistoryInfo([]);
      setPatientProfile({});
      setIsLoading(true);
      setIsPatientLoading(true);
      setIsSocialHistoryLoading(true);
      setIsGuardianLoading(true);
      retrievePatient(patientID, true)
      retrieveSocialHistory(patientID);
      retrieveGuardian(patientID);
    });
    return navListener;
  }, [navigation]);

  
  // Purpose: Handle API error if fetch fails
  const handleError = () => {
    if (getDoctorNote.error) {
      getDoctorNote.request(patientID);
    }
  };

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

  return getDoctorNote.loading || isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      {/* Note the immediate bunch of code will only be rendered
      when one of the APIs has an error. Purpose: Error handling of API */}
      {(getDoctorNote.error) && (
        <Box h="100%">
          <Alert w="100%" status="error">
            <VStack space={2} flexShrink={1} w="100%">
              <HStack
                flexShrink={1}
                space={2}
                justifyContent="space-between"
              >
                <HStack space={2} flexShrink={1}>
                  <Alert.Icon mt="1" />
                  <Text fontSize="md" color="coolGray.800">
                    Unable to retrieve api data. Try again? Or Relogin
                  </Text>
                </HStack>
                <IconButton
                  variant="unstyled"
                  _focus={{
                    borderWidth: 0,
                  }}
                  icon={<CloseIcon size="3" />}
                  _icon={{
                    color: 'coolGray.600',
                  }}
                />
              </HStack>
            </VStack>
          </Alert>
          <Box position="fixed" my="50%" w="60%" mx="auto">
            <AppButton
              title="Try Again"
              color="red"
              onPress={handleError}
            />
          </Box>
        </Box>
      )}
      <ScrollView>
        <Box>
          <AspectRatio w="100%" ratio={16 / 9}>
            <Image
              source={{ uri: `${displayPicUrl}` }}
              alt="patientInformationImage"
            />
          </AspectRatio>
          <Center
            position="absolute"
            bg={colors.primary_overlay_color}
            width="100%"
            height="100%"
          />
          <Center position="absolute" px="5%" py="10%">
            <Text style={styles.pictureText}>
              You're caring for
            </Text>
            <Text style={styles.pictureText}>
              {`${firstName} ${lastName}`}
            </Text>
          </Center>
        </Box>
        <VStack maxW="100%" mt="2.5" mb="8">
          <Stack ml="5" mr="5" space={5}>
            <Divider mt="2" />

            <InformationCard
              title={'Patient Information'}
              displayData={patientData}
              handleOnPress={handlePatientInfoOnPress}
              unMaskedNRIC={unMaskedPatientNRIC}
            />
            <Divider />

            <InformationCard
              title={'Patient Preferences'}
              displayData={preferenceData}
              handleOnPress={handlePatientPrefOnPress}
            />
            <Divider />

            <InformationCard
              title={"Doctor's Notes"}
              displayData={doctorData}
            />
            <Divider />

            <InformationCard
              title={'Guardian(s) Information'}
              subtitle={'Guardian 1'}
              displayData={guardianInfoData}
              handleOnPress={handlePatientGuardianOnPress}
              unMaskedNRIC={unMaskedGuardianNRIC}
            />
            {isSecondGuardian ? (
              <InformationCard
                subtitle={'Guardian 2'}
                displayData={secondGuardianInfoData}
                handleOnPress={handlePatientSecondGuardianOnPress}
                unMaskedNRIC={unMasked2ndGuardianNRIC}
              />
            ) : null}
            <Divider />
            
            <InformationCard
              title={'Social History'}
              displayData={socialHistoryInfo}
              handleOnPress={handlePatientSocialHistOnPress}
            />
          </Stack>
        </VStack>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({
  pictureText: {
    color: colors.white_var1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 24,
    paddingTop: 15,
  },
});

export default PatientInformationScreen;
