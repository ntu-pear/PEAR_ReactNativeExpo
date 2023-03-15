import React from 'react';
import { Center, VStack, HStack, ScrollView, View } from 'native-base';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import PatientInformationCard from 'app/components/PatientInformationCard';
import colors from 'app/config/colors';
import PatientProfileCard from 'app/components/PatientProfileCard';
import routes from 'app/navigation/routes';

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  // const patientProfile = route.params;
  const patientProfile = {
    patientID: 1,
    preferredLanguage: 'Cantonese',
    firstName: 'Alice',
    lastName: 'Lee',
    nric: 'Sxxxx922I',
    address: '73 Kampong Bahru Road 169373, Singapore',
    tempAddress: null,
    homeNo: '65123456',
    handphoneNo: '61234564',
    gender: 'F',
    dob: '1937-09-12T00:00:00',
    preferredName: 'Alice',
    privacyLevel: 2,
    updateBit: true,
    autoGame: true,
    startDate: '2020-05-04T00:00:00',
    endDate: null,
    terminationReason: null,
    isActive: true,
    inactiveReason: null,
    inactiveDate: null,
    isRespiteCare: true,
    profilePicture:
      'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
  };
  //   const handleProfileButton = () => {
  //     console.log("tesitn profile");
  //     console.log(patientProfile);
  //   };

  return (
    <Center backgroundColor={colors.white_var1}>
      <ScrollView w="100%">
        {/* mt="5" */}
        <VStack justifyContent="center" alignItems="center" mb="5" w="100%">
          <View w="100%">
            <PatientInformationCard
              patientProfile={patientProfile}
              navigation={navigation}
              w="100%"
            />
          </View>

          <VStack space={2} ml="3%" mr="3%" mt="6">
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="allergy"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Allergy"
                navigation={navigation}
                routes={routes.PATIENT_ALLERGY}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Vital"
                navigation={navigation}
                routes={routes.PATIENT_VITAL}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5 name="pills" size={30} color={colors.pink} />
                }
                text="Prescription"
                navigation={navigation}
                routes={routes.PATIENT_PRESCRIPTION}
                patientProfile={patientProfile}
              />
            </HStack>
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={28}
                    color={colors.pink}
                  />
                }
                text="Problem Log"
                navigation={navigation}
                routes={routes.PATIENT_PROBLEM_LOG}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="clipboard-text"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Medical History"
                navigation={navigation}
                routes={routes.PATIENT_ACTIVITY_PREFERENCE}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <FontAwesome5
                    name="calendar-day"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Activity"
                navigation={navigation}
                routes={routes.PATIENT_ROUTINE}
                patientProfile={patientProfile}
              />
            </HStack>
            <HStack space={2} w="100%">
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="emoticon-happy"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Patient Preference"
                navigation={navigation}
                routes={routes.PATIENT_PREFERENCE}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialIcons
                    name="insert-photo"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Photo Album"
                navigation={navigation}
                routes={routes.PATIENT_PHOTO_ALBUM}
                patientProfile={patientProfile}
              />
              <PatientProfileCard
                vectorIconComponent={
                  <MaterialCommunityIcons
                    name="umbrella-beach"
                    size={30}
                    color={colors.pink}
                  />
                }
                text="Holiday"
                navigation={navigation}
                routes={routes.PATIENT_HOLIDAY}
                patientProfile={patientProfile}
              />
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Center>
  );
}

export default PatientProfileScreen;
