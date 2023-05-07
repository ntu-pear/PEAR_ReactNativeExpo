import React, { useContext, useCallback, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';
import userApi from 'app/api/user';

function AccountViewScreen(props) {
  const { navigation, route } = props;
  const { user, setUser } =
    Platform.OS === 'web' ? useContext(AuthContext) : {};

  const userProfile = Platform.OS === 'web' ? user : route.params;

  // get current user
  useEffect(() => {
    if (Platform.OS === 'web') {
      getUserCallback();
    }
  }, [getUserCallback]);

  const getUserCallback = useCallback(() => {
    const promiseFunction = async () => {
      const response = await getCurrentUser();
      // console.log(response);

      setUser(response.data);
    };
    promiseFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    const currentUser = await authStorage.getUser();
    const response = await userApi.getUser(currentUser?.userID);
    // console.log('getCurrentUser', response);
    if (!response.ok) {
      // Proceed to log out if account screen does not load due to api failure
      // Note: should use useCheckExpiredThenLogOut hook but it isnt working and had no time to fix
      setUser(null);
      await authStorage.removeToken();
      return;
    }
    return response.data;
  };

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const handleOnPress = () => {
    if (Platform.OS === 'web') {
      navigate('/' + routes.ACCOUNT_EDIT, {
        state: { userProfile: userProfile },
      });
    } else {
      navigation.push(routes.ACCOUNT_EDIT, { ...userProfile });
    }
  };

  return (
    <ScrollView>
      <VStack mt="4" ml="4" px={Platform.OS === 'web' ? '10%' : null}>
        {Platform.OS === 'web' ? (
          <HStack px="20%">
            <AspectRatio w="35%" ml="20%" ratio={1} mb="2" alignSelf="center">
              <Image
                borderRadius="full"
                fallbackSource={{
                  uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                }}
                source={{
                  uri: userProfile.profilePicture,
                }}
                alt="user_image"
              />
            </AspectRatio>

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
        ) : (
          <Center>
            <HStack>
              <Center>
                <AspectRatio w="80%" ratio={1} mb="2" alignSelf="center">
                  <Image
                    borderRadius="full"
                    fallbackSource={{
                      uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                    }}
                    source={{
                      uri: userProfile.profilePicture
                        ? `${userProfile.profilePicture}`
                        : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
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
        )}

        <FormControl>
          <HStack space={2} alignItems="center">
            <FormControl.Label
              _text={{
                fontFamily: `${
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }`,
                fontSize: Platform.OS === 'web' ? '2xl' : 'lg',
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
              fontSize={Platform.OS === 'web' ? '3xl' : 'lg'}
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
                fontSize: Platform.OS === 'web' ? '2xl' : 'lg',
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
              fontSize={Platform.OS === 'web' ? '3xl' : 'lg'}
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
