/*eslint eslint-comments/no-unlimited-disable: error */
import doctorNoteApi from 'app/api/doctorNote';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AppButton from 'app/components/AppButton';
import InformationCard from 'app/components/InformationCard';
import PersonalSocialHistory from 'app/components/PersonalSocialHistory';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import useApi from 'app/hooks/useApi';
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
  // Avatar,
  // Input,
  // FormControl,
  // TextArea,
  // Select,
  // CheckIcon,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const [isLoading, setIsLoading] = useState(false); //eslint-disable-line no-unused-vars
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);

  const formatDate = (str) => {
    let splitDate = str.split('-');
    // splitDate[0] = splitDate[0].split('').reverse().join('');

    return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
  };

  const [guardianData, setGuardianData] = useState([]);
  const [secondGuardianData, setSecondGuardianData] = useState([]);
  const [isSecondGuardian, setIsSecondGuardian] = useState(false);

  const patientData = [
    { label: 'First Name', value: props.route.params.firstName },
    { label: 'Last Name', value: props.route.params.lastName },
    { label: 'NRIC', value: props.route.params.nric },
    {
      label: 'Gender',
      value: props.route.params.gender === 'F' ? 'Female' : 'Male',
    },
    {
      label: 'DOB',
      value: formatDate(props.route.params.dob.substring(0, 10)),
    },
    {
      label: 'Home Number',
      value: props.route.params.homeNo || 'Not available',
    },
    {
      label: 'Mobile Number',
      value: props.route.params.handphoneNo || 'Not available',
    },
    { label: 'Address', value: props.route.params.address || 'Not available' },
    {
      label: 'Temp. Address',
      value: props.route.params.tempAddress || 'Not available',
    },
  ];

  const preferenceData = [
    { label: 'Preferred name', value: props.route.params.preferredName },
    {
      label: 'Preferred language',
      value: props.route.params.preferredLanguage,
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
          value: getPatientGuardian.data.guardian.firstName
            ? getPatientGuardian.data.guardian.firstName
            : 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.guardian.lastName
            ? getPatientGuardian.data.guardian.lastName
            : 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.guardian.nric
            ? getPatientGuardian.data.guardian.nric
            : 'Not Available',
        },
        {
          label: 'Relationship',
          value: getPatientGuardian.data.guardian.relationship
            ? getPatientGuardian.data.guardian.relationship
            : 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.guardian.contactNo
            ? getPatientGuardian.data.guardian.contactNo
            : 'Not Available',
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.guardian.email
            ? getPatientGuardian.data.guardian.email
            : 'Not Available',
        },
      ]);
    }
    // get data of 2nd guardian if any.
    if (
      getPatientGuardian.data.additionalGuardian &&
      getPatientGuardian.data.additionalGuardian.nric !== null
    ) {
      setIsSecondGuardian(true);
      setSecondGuardianData([
        {
          label: 'First Name',
          value: getPatientGuardian.data.additionalGuardian.firstName
            ? getPatientGuardian.data.additionalGuardian.firstName
            : 'Not Available',
        },
        {
          label: 'Last Name',
          value: getPatientGuardian.data.additionalGuardian.lastName
            ? getPatientGuardian.data.additionalGuardian.lastName
            : 'Not Available',
        },
        {
          label: 'NRIC',
          value: getPatientGuardian.data.additionalGuardian.nric
            ? getPatientGuardian.data.additionalGuardian.nric
            : 'Not Available',
        },
        {
          label: 'Relationship',
          value: getPatientGuardian.data.additionalGuardian.relationship
            ? getPatientGuardian.data.additionalGuardian.relationship
            : 'Not Available',
        },
        {
          label: 'Contact Number',
          value: getPatientGuardian.data.additionalGuardian.contactNo
            ? getPatientGuardian.data.additionalGuardian.contactNo
            : 'Not Available',
        },
        {
          label: 'Email',
          value: getPatientGuardian.data.additionalGuardian.email
            ? getPatientGuardian.data.additionalGuardian.email
            : 'Not Available',
        },
      ]);
    }
  }, [
    getPatientGuardian.data.guardian,
    getPatientGuardian.data.additionalGuardian,
  ]);

  useEffect(() => {
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    getSocialHistory.request(patientID);
    // console.log(getPatientGuardian.data.guardian);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Purpose: Handle API error if fetch fails
   */
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

  return (
    <>
      {getDoctorNote.loading ||
      getPatientGuardian.loading ||
      getSocialHistory.loading ? (
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
                <VStack>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === 'ios' ? 'Helvetica' : typography.android
                      }`,
                      fontSize: '2xl',
                      fontWeight: '500',
                    }}
                  >
                    You're caring for
                  </Center>
                  <Center
                    _text={{
                      color: `${colors.white_var1}`,
                      fontFamily: `${
                        Platform.OS === 'ios' ? 'Helvetica' : typography.android
                      }`,
                      fontSize: '2xl',
                      fontWeight: '500',
                    }}
                  >
                    {`${firstName} ${lastName}`}
                  </Center>
                </VStack>
              </Center>
            </Box>
            <VStack maxW="100%" mt="2.5" mb="8">
              <Stack ml="5" mr="5" space={5}>
                <Divider mt="2" />

                <InformationCard
                  title={'Your Patient Information'}
                  displayData={patientData}
                />
                <Divider />

                <InformationCard
                  title={'Preferences'}
                  displayData={preferenceData}
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
                />
                {isSecondGuardian ? (
                  <InformationCard
                    subtitle={'Guardian 2'}
                    displayData={secondGuardianData}
                  />
                ) : null}
                <Divider />

                <PersonalSocialHistory socialHistory={getSocialHistory.data} />
              </Stack>
            </VStack>
          </ScrollView>
        </Center>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  Header: {
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 24,
    fontWeight: 'semibold',
    paddingTop: 5,
  },
  LabelStyle: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 18,
    fontWeight: 'thin',
  },
  InputStyle: {
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 18,
  },
});

export default PatientInformationScreen;
