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
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);

  const [guardianData, setGuardianData] = useState([]);
  const [secondGuardianData, setSecondGuardianData] = useState([]);
  const [isSecondGuardian, setIsSecondGuardian] = useState(false);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
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
    setSocialHistoryData(response.data.data);
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
    if (getPatientGuardian.data.data) {
      // get data of first guardian
      setUnMaskedGuardianNRIC(getPatientGuardian.data.data.guardian.nric);
      setGuardianData([
        {
          label: 'First Name',
          value: getPatientGuardian.data.data.guardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.data.guardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.data.guardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || 'Not Available',
        },
        {
          label: "Patient's",
          value: getPatientGuardian.data.data.guardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.data.guardian.contactNo || 'Not Available',
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.data.guardian.email || 'Not Available',
        },
      ]);
    }
    // get data of 2nd guardian if any.
    if (
      getPatientGuardian.data.data &&
      getPatientGuardian.data.data.additionalGuardian &&
      getPatientGuardian.data.data.additionalGuardian.nric !== null &&
      getPatientGuardian.data.data.additionalGuardian.nric !==
        getPatientGuardian.data.data.guardian.nric
    ) {
      setIsSecondGuardian(true);
      setUnMasked2ndGuardianNRIC(getPatientGuardian.data.data.additionalGuardian.nric);
      setSecondGuardianData([
        {
          label: 'First Name',
          value: getPatientGuardian.data.data.additionalGuardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.data.additionalGuardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.data.additionalGuardian.nric.replace(/\d{4}(\d{3})/, 'xxxx$1') || 'Not Available',
        },
        {
          label: "Patient's",
          value: getPatientGuardian.data.data.additionalGuardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.data.additionalGuardian.contactNo || 'Not Available',
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.data.additionalGuardian.email || 'Not Available',
        },
      ]);
    }
  }, [
    getPatientGuardian.data.data
  ]);

  const socialHistoryDataArray = [
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
  ];

  // used to call api when page loads
  useEffect(() => {
    retrievePatient(patientID);
    retrieveSocialHistory(patientID);
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // used to confirm that data has returned from apis before loading the page - Russell
  useEffect(() => {
    if(patientProfile !== undefined && Object.keys(patientProfile).length>0 ){
      setIsPatientLoading(false);
    }
    if(socialHistoryData !== undefined && Object.keys(socialHistoryData).length>0 ){
      setIsSocialHistoryLoading(false);
    }
    if(isPatientLoading === false && isSocialHistoryLoading === false){
      setIsLoading(false);
    }
  }, [patientProfile, isPatientLoading, socialHistoryData, isSocialHistoryLoading]);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      retrievePatient(patientID, true)
      retrieveSocialHistory(patientID);
      getPatientGuardian.request(patientID);
    });
    return navListener;
  }, [navigation]);

  
  // Purpose: Handle API error if fetch fails
  const handleError = () => {
    if (getDoctorNote.error) {
      getDoctorNote.request(patientID);
    }
    if (getPatientGuardian.error) {
      getPatientGuardian.request(patientID);
    }
    //if (getSocialHistory.error) {
    //  getSocialHistory.request(patientID);
    //}
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
      guardianProfile: getPatientGuardian.data.data.guardian,
      navigation: navigation,
    })
  };
  
  const handlePatientSecondGuardianOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_GUARDIAN, { 
      guardianProfile: getPatientGuardian.data.data.additionalGuardian,
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

  return getDoctorNote.loading || getPatientGuardian.loading || isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      {/* Note the immediate bunch of code will only be rendered
      when one of the APIs has an error. Purpose: Error handling of API */}
      {(getDoctorNote.error ||
        getPatientGuardian.error) && (
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
              displayData={guardianData}
              handleOnPress={handlePatientGuardianOnPress}
              unMaskedNRIC={unMaskedGuardianNRIC}
            />
            {isSecondGuardian ? (
              <InformationCard
                subtitle={'Guardian 2'}
                displayData={secondGuardianData}
                handleOnPress={handlePatientSecondGuardianOnPress}
                unMaskedNRIC={unMasked2ndGuardianNRIC}
              />
            ) : null}
            <Divider />
            
            <InformationCard
              title={'Social History'}
              displayData={socialHistoryDataArray}
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
