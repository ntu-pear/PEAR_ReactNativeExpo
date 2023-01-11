import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Center, Image, Text, HStack, VStack, Box } from 'native-base';

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
      <Box mt="3.5" mb="3.5" minW="90%" overflow="hidden" rounded="lg">
        <HStack pl="5">
          <Center>
            <Image
              alt="patient_image"
              borderRadius="full"
              // Note: This is a fall-back uri. Will only be used if source fails to render the image.
              fallbackSource={{
                uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1673348736/Assets/bvtnichzakwtzwu2zqt5.jpg',
              }}
              resizeMode="cover"
              size="sm"
              source={{
                uri: `${patientProfile.profilePicture}`,
              }}
            />
          </Center>
          <VStack>
            <Text bold fontSize="lg" pl="2" pt="2">
              {`${patientProfile.preferredName}`}
            </Text>
            <Text pl="2">
              {`${patientProfile.firstName} ${patientProfile.lastName}`}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

export default PatientScreenCard;
