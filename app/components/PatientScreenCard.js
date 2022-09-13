import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Center, Image, Text, VStack, Box } from 'native-base';

// Import Constants from routes
import routes from 'app/navigation/routes';

function PatientScreenCard(props) {
  const { patientProfile, navigation } = props;

  const handleOnPress = () => {
    // Navigate to PatientProfileScreen
    navigation.push(routes.PATIENT_PROFILE, { ...patientProfile });
  };
  return (
    <TouchableOpacity onPress={handleOnPress}>
      <Box mt="5" mb="5" minW="90%" overflow="hidden" rounded="lg">
        <VStack mb="2">
          <Center>
            <Image
              alt="patient_image"
              borderRadius="full"
              // Note: This is a fall-back uri. Will only be used if source fails to render the image.
              fallbackSource={{
                uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
              }}
              resizeMode="cover"
              size="2xl"
              source={{
                uri: `${patientProfile.profilePicture}`,
              }}
            />
          </Center>
          <Center>
            <Text bold fontSize="md">
              {`${patientProfile.firstName} ${patientProfile.lastName}`}
            </Text>
          </Center>
          <Center>
            <Text>{`${patientProfile.preferredName}`}</Text>
          </Center>
          <Center>
            <Text>{`${patientProfile.nric}`}</Text>
          </Center>
        </VStack>
      </Box>
    </TouchableOpacity>
  );
}

export default PatientScreenCard;
