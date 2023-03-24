import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

import { Center, Image, Text, HStack, VStack, Box } from 'native-base';

// Import Constants from routes
import routes from 'app/navigation/routes';

function PatientScreenCard(props) {
  const { patientProfile, navigation, onClick } = props;

  const handleOnPress = () => {
    // Navigate to PatientProfileScreen
    navigation.push(routes.PATIENT_PROFILE, { patientProfile: patientProfile });
  };

  const MyComponent = Platform.OS === 'web' ? VStack : HStack;

  return (
    <TouchableOpacity onPress={Platform.OS === 'web' ? onClick : handleOnPress}>
      <Box mt="3.5" mb="3.5" minW="90%" overflow="hidden" rounded="lg">
        <MyComponent pl="5">
          <Center>
            <Image
              alt="patient_image"
              borderRadius="full"
              // Note: This is a fall-back uri. Will only be used if source fails to render the image.
              fallbackSource={{
                uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1677039560/Assets/jzfbdl15jstf8bgt5ax0.png',
              }}
              resizeMode="cover"
              size={Platform.OS === 'web' ? 'xl' : 'sm'}
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
        </MyComponent>
      </Box>
    </TouchableOpacity>
  );
}

export default PatientScreenCard;
