import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

import { Center, Image, Text, HStack, VStack, Box } from 'native-base';

// Import Constants from routes
import routes from 'app/navigation/routes';

function PatientScreenCard(props) {
  const { patientProfile, navigation, onClick } = props;

  const handleOnPress = () => {
    // Navigate to PatientProfileScreen
    navigation.push(routes.PATIENT_PROFILE, { ...patientProfile });
  };

  const MyComponent  = Platform.OS === 'web' ? VStack : HStack;
  
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
                  uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
                }}
                resizeMode="cover"
                size={Platform.OS === 'web' ? "xl": "sm"}
                source={{
                  uri: `${patientProfile.profilePicture}`,
                }}
              />
            </Center>
            <VStack>
              <Center>
                <Text bold fontSize="lg" alignSelf={true} pl="2" pt="2">
                  {`${patientProfile.preferredName}`}
                </Text>
              </Center>
              <Center>
                <Text alignSelf={true} pl="2">
                  {`${patientProfile.firstName} ${patientProfile.lastName}`}
                </Text>
              </Center>
            </VStack>
          </MyComponent>
      </Box>
    </TouchableOpacity>
  );
}

export default PatientScreenCard;
