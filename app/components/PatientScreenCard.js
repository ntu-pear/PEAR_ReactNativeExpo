import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

import { Center, Image, Text, HStack, VStack, Box, Avatar } from 'native-base';

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
        <MyComponent space={2} pl="5">
          <Center>
            <Avatar
              size={Platform.OS === 'web' ? '2xl' : 'lg'}
              source={{
                uri: `${patientProfile.profilePicture}`,
              }}
              resizeMode="cover"
              borderRadius="full"
              alt="patient_image"
            >
              {/* Note this is a fall-back, in case image isn't rendered */}
              {`${patientProfile.firstName.substring(
                0,
                1,
              )}${patientProfile.lastName.substring(0, 1)}`}
            </Avatar>
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
