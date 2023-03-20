import React from 'react';
import { Platform } from 'react-native';
import {
  Image,
  VStack,
  HStack,
  Input,
  FormControl,
  AspectRatio,
  IconButton,
  Center,
  ScrollView,
} from 'native-base';
// Import Constants from routes
import routes from 'app/navigation/routes';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserInformationCard from 'app/components/UserInformationCard';

function AccountViewScreen(props) {
  const { navigation, route } = props;
  const userProfile = route.params;

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_EDIT, { ...userProfile });
  };

  return (
    <ScrollView>
      <VStack mt="4" ml="4">
        <Center>
          <HStack>
            <Center>
              <AspectRatio w="80%" ratio={1} mb="2" alignSelf="center">
                <Image
                  borderRadius="full"
                  fallbackSource={{
                    uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
                  }}
                  source={{
                    uri: userProfile.profilePicture
                      ? `${userProfile.profilePicture}`
                      : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
                  }}
                  alt="user_image"
                />
              </AspectRatio>
            </Center>

            <IconButton
              alignSelf="flex-start"
              _icon={{
                as: MaterialCommunityIcons,
                name: 'pencil',
              }}
              size="lg"
              onPress={handleOnPress}
              testID="iconButton"
            />
          </HStack>
        </Center>

        <FormControl>
          <HStack space={2} alignItems="center">
            <FormControl.Label
              _text={{
                fontFamily: `${
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }`,
                fontSize: 'lg',
                fontWeight: 'thin',
              }}
            >
              Preferred Name
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.preferredName}
              w="100%"
            />
          </HStack>
        </FormControl>

        <FormControl>
          <HStack space={2} alignItems="center">
            <FormControl.Label
              _text={{
                fontFamily: `${
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }`,
                fontSize: 'lg',
                fontWeight: 'thin',
              }}
            >
              Contact Number
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.contactNo}
              w="100%"
            />
          </HStack>
        </FormControl>

        <UserInformationCard userProfile={props} />
      </VStack>
    </ScrollView>
  );
}

export default AccountViewScreen;
