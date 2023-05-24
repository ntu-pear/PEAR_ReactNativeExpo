/*eslint eslint-comments/no-unlimited-disable: error */
import doctorNoteApi from 'app/api/doctorNote';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AppButton from 'app/components/AppButton';
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
  Avatar,
  Input,
  FormControl,
  TextArea,
  Select,
  CheckIcon,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

function PatientInformationScreen(props) {
  const { displayPicUrl, firstName, lastName, patientID } = props.route.params;
  const [isLoading, setIsLoading] = useState(false); //eslint-disable-line no-unused-vars
  const getDoctorNote = useApi(doctorNoteApi.getDoctorNote);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getSocialHistory = useApi(socialHistoryApi.getSocialHistory);

  useEffect(() => {
    getDoctorNote.request(patientID);
    getPatientGuardian.request(patientID);
    getSocialHistory.request(patientID);

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
                <Stack name="PersonalInformationCard">
                  <Text style={styles.Header}>
                    Your Patient Information
                  </Text>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        First Name
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.firstName}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Last Name
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.lastName}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        NRIC
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.nric}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Gender
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.gender === 'F' ? 'Female' : 'Male'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        DOB
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.dob.substring(0, 10)}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Home Number
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.homeNo || 'Not available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Mobile Number
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.handphoneNo || 'Not available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <Stack space={0} alignItems="flex-start" flexWrap="wrap">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Address
                      </FormControl.Label>
                      <TextArea 
                        style={styles.InputStyle}
                        isReadOnly
                        input="lg"
                        ml="-2.5"
                        minH="30%"
                        maxH="50%"
                        variant="unstyled"
                        value={props.route.params.address || 'Not available'}
                        w="100%"
                      />
                    </Stack>
                  </FormControl>
                  <FormControl>
                    <Stack space={0} alignItems="flex-start" flexWrap="wrap">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Temporary Address
                      </FormControl.Label>
                      <TextArea
                        style={styles.InputStyle}
                        isReadOnly
                        input="lg"
                        ml="-2.5"
                        minH="30%"
                        maxH="50%"
                        variant="unstyled"
                        value={props.route.params.tempAddress || 'Not available'}
                        w="100%"
                      />
                    </Stack>
                  </FormControl>

                  <Center position="absolute" right="0" py="1.5">
                    <Avatar
                      size={Platform.OS === 'web' ? '2xl' : 'md'}
                      source={{uri: props.route.params.profilePicture,}}
                    >
                      {/* Note this is a fall-back, in case image isn't rendered */}
                      {`${props.route.params.firstName.substring(0, 1)}${props.route.params.lastName.substring(0, 1)}`}
                    </Avatar>
                  </Center>
                </Stack>
                <Divider />
                <Stack name="PersonalPreferenceCard" space={2}>
                  <Text style={styles.Header}>
                    Preference
                  </Text>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Preferred Name
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.preferredName}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Preferred Language
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={props.route.params.preferredLanguage}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                </Stack>
                <Divider />
                <Stack name="PersonalDoctorCard" space={2}>
                  <Text style={styles.Header}>
                    Doctor's Notes
                  </Text>
                  <FormControl>
                    <Stack space={0} alignItems="flex-start" flexWrap="wrap">
                      <TextArea
                        style={styles.InputStyle}
                        isReadOnly
                        input="lg"
                        //ml="-2.5"
                        //minH="30%"
                        //maxH="50%"
                        //w="100%"
                        //variant="unstyled"
                        value={
                          getDoctorNote.data && getDoctorNote.data[0] && getDoctorNote.data[0].doctorRemarks
                            ? getDoctorNote.data[0].doctorRemarks
                            : 'Not available'}
                      />
                    </Stack>
                  </FormControl>
                </Stack>
                <Divider />
                <Stack name="PersonalGuardianCard">
                  <Text style={styles.Header}>
                    Guardian(s)
                  </Text>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        First Name
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={getPatientGuardian.data.guardian && getPatientGuardian.data.guardian.firstName 
                          ? getPatientGuardian.data.guardian.firstName : 'Not Available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Last Name
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={getPatientGuardian.data.guardian && getPatientGuardian.data.guardian.lastName
                          ? getPatientGuardian.data.guardian.lastName: 'Not Available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        NRIC
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={getPatientGuardian.data.guardian && getPatientGuardian.data.guardian.nric
                          ? getPatientGuardian.data.guardian.nric : 'Not Available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <HStack space={2} alignItems="center">
                      <FormControl.Label _text={styles.LabelStyle}>
                        Relationship
                      </FormControl.Label>

                      <Input
                        style={styles.InputStyle}
                        isReadOnly
                        variant="unstyled"
                        value={getPatientGuardian.data.guardian && getPatientGuardian.data.guardian.relationship
                          ? getPatientGuardian.data.guardian.relationship: 'Not Available'}
                        w="100%"
                      />
                    </HStack>
                  </FormControl>
                </Stack>
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
    fontWeight: "semibold",
    paddingTop: 5,
  },
  LabelStyle: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 18,
    fontWeight: "thin",
  },
  InputStyle: {
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
    fontSize: 18,
  },
});

export default PatientInformationScreen;

