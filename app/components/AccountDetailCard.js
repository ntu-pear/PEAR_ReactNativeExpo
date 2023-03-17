import React from 'react';
import { TouchableOpacity } from 'react-native';
import colors from 'app/config/colors';
import { Image, Text, VStack, Box, HStack } from 'native-base';
// Import Constants from routes
import routes from 'app/navigation/routes';

function AccountDetailCard(props) {
  const { userProfile, navigation } = props;

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_DETAIL, { ...userProfile });
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <Box
        minW="90%"
        mb="5"
        mt="5"
        overflow="visible"
        rounded="lg"
        borderColor={colors.primary_gray}
        borderWidth="1"
        testID="accountDetailCard"
      >
        <HStack space={10}>
          <Image
            alt="user_image"
            borderRadius="full"
            // Note: This is a fall-back uri. Will only be used if source fails to render the image.
            fallbackSource={{
              uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
            }}
            resizeMode="cover"
            size="lg"
            source={{
              uri: userProfile.profilePicture
                ? `${userProfile.profilePicture}`
                : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
            }}
          />
          <VStack mt="3" mb="2">
            <Text alignSelf="flex-start" fontSize="2xl">
              {`${userProfile.preferredName}`}
            </Text>

            <Text alignSelf="flex-start" fontSize="lg">
              {`${userProfile.role}`}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

export default AccountDetailCard;
