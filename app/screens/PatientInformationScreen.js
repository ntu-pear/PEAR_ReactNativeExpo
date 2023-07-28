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
  const [isLoading, setIsLoading] = useState(true); //eslint-disable-line no-unused-vars
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);

  const [guardianData, setGuardianData] = useState([]);
  const [secondGuardianData, setSecondGuardianData] = useState([]);
  const [isSecondGuardian, setIsSecondGuardian] = useState(false);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [patientProfile, setpatientProfile] = useState({});

  // Used to retrieve the patient since after an editing of the patients particulars it will need to be refreshed - Russell
  const getPatient = async (id, masked = true) => {
    setIsLoading(true);
    const response = await patientApi.getPatient(id, masked);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setpatientProfile(response.data.data);
  };

  // Data used for display, sent to InformationCard
  const patientData = [
    { label: 'First Name', value: patientProfile.firstName },
    { label: 'Last Name', value: patientProfile.lastName },
    { label: 'NRIC', value: patientProfile.nric },
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
      value: patientProfile.isRespiteCare || 'Not available',
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
        getDoctorNote.data &&
        getDoctorNote.data[0] &&
        getDoctorNote.data[0].doctorRemarks
          ? getDoctorNote.data[0].doctorRemarks
          : 'Not available',
    },
  ];

  useEffect(() => {
    if (getPatientGuardian.data.guardian) {
      // get data of first guardian
      setGuardianData([
        {
          label: 'First Name',
          value: getPatientGuardian.data.guardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.guardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.guardian.nric || 'Not Available',
        },
        {
          label: 'Relationship',
          value: getPatientGuardian.data.guardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.guardian.contactNo || 'Not Available',
        },
        {
          label: 'Is Active',
          value: getPatientGuardian.data.guardian.isActive,
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.guardian.email || 'Not Available',
        },
      ]);
    }
    // get data of 2nd guardian if any.
    if (
      getPatientGuardian.data.additionalGuardian &&
      getPatientGuardian.data.additionalGuardian.nric !== null &&
      getPatientGuardian.data.additionalGuardian.nric !==
        getPatientGuardian.data.guardian.nric
    ) {
      setIsSecondGuardian(true);
      setSecondGuardianData([
        {
          label: 'First Name',
          value: getPatientGuardian.data.additionalGuardian.firstName || 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.additionalGuardian.lastName || 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.additionalGuardian.nric || 'Not Available',
        },
        {
          label: 'Relationship',
          value: getPatientGuardian.data.additionalGuardian.relationship || 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.additionalGuardian.contactNo || 'Not Available',
        },
        {
          label: 'Is Active',
          value: getPatientGuardian.data.additionalGuardian.isActive,
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.additionalGuardian.email || 'Not Available',
        },
      ]);
    }
  }, [
    getPatientGuardian.data.guardian,
    getPatientGuardian.data.additionalGuardian,
  ]);

  useEffect(() => {
    if (getSocialHistory.data) {
      setSocialHistoryData([
        {
          label: 'Live with',
          value: getSocialHistory.data.liveWithDescription || 'Not Available',
        },
        {
          label: 'Education',
          value: getSocialHistory.data.educationDescription || 'Not Available',
        },
        {
          label: 'Occupation',
          value: getSocialHistory.data.occupationDescription || 'Not Available',
        },
        {
          label: 'Religion',
          value: getSocialHistory.data.religionDescription || 'Not Available',
        },
        {
          label: 'Pet',
          value: getSocialHistory.data.petDescription || 'Not Available',
        },
        {
          label: 'Diet',
          value: getSocialHistory.data.dietDescription || 'Not Available',
        },
        {
          label: 'Exercise',
          value: getSocialHistory.data.exercise,
        },
        {
          label: 'Sexually active',
          value: getSocialHistory.data.sexuallyActive,
        },
        {
          label: 'Drug use',
          value: getSocialHistory.data.drugUse,
        },
        {
          label: 'Caffeine use',
          value: getSocialHistory.data.caffeineUse,
        },
        {
          label: 'Alochol use',
          value: getSocialHistory.data.alcoholUse,
        },
        {
          label: 'Tobacco use',
          value: getSocialHistory.data.tobaccoUse,
        },
        {
          label: 'Secondhand smoker',
          value: getSocialHistory.data.secondhandSmoker,
        },
      ]);
    }
  }, [getSocialHistory.data]);

  // used to call api when page loads
  useEffect(() => {
    getPatient(patientID, true);
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    getSocialHistory.request(patientID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      getPatient(patientID, true)
      getPatientGuardian.request(patientID);
      getSocialHistory.request(patientID);
      setIsLoading(false);
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
    if (getSocialHistory.error) {
      getSocialHistory.request(patientID);
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
      guardianProfile: getPatientGuardian.data.guardian,
      navigation: navigation,
    })
  };
  
  const handlePatientSecondGuardianOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_GUARDIAN, { 
      guardianProfile: getPatientGuardian.data.additionalGuardian,
      navigation: navigation,
    })
  };
  
  const handlePatientSocialHistOnPress = () => {
    navigation.push(routes.EDIT_PATIENT_SOCIALHIST, { 
      socialHistory: getSocialHistory.data,
      navigation: navigation,
    })
  };

  return getDoctorNote.loading || getPatientGuardian.loading || getSocialHistory.loading || isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      {/* Note the immediate bunch of code will only be rendered
      when one of the APIs has an error. Purpose: Error handling of API */}
      {(getDoctorNote.error ||
        getPatientGuardian.error ||
        getSocialHistory.error) && (
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
            />
            {isSecondGuardian ? (
              <InformationCard
                subtitle={'Guardian 2'}
                displayData={secondGuardianData}
                handleOnPress={handlePatientSecondGuardianOnPress}
              />
            ) : null}
            <Divider />
            {
              //Divide into about and lifystyle?
            }
            <InformationCard
              title={'Social History'}
              displayData={socialHistoryData}
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
