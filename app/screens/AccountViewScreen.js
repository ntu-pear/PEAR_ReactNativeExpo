// Libs
import React, { useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { Image, VStack, AspectRatio, Center, ScrollView } from 'native-base';
import AuthContext from 'app/auth/context';

// API
import userApi from 'app/api/user';

// Configurations
import routes from 'app/navigation/routes';

// Components
import InformationCard from 'app/components/InformationCard';
import authStorage from 'app/auth/authStorage';

function AccountViewScreen(props) {
  const { user, setUser } = useContext(AuthContext);
  const { navigation } = props;
  
  // Data used for display, sent to InformationCard
  const userData = [
    { label: 'Preferred Name', value: user.preferredName },
    { label: 'Contact Number', value: user.contactNo },
    { label: 'First Name', value: user.firstName },
    { label: 'Last Name', value: user.lastName },
    { label: 'Role', value: user.role },
    { label: 'NRIC', value: user.nric },
    {
      label: 'Gender',
      value: user.gender === 'F' ? 'Female' : 'Male',
    },
    {
      label: 'DOB',
      value: user.dob || 'Not available',
    },
    {
      label: 'Email',
      value: user.email || 'Not available',
    },
    {
      label: 'Address',
      value: user.address || 'Not available',
    },
  ];

  const getCurrentUser = async () => {
    // get current user from authStorage
    const currentUser = await authStorage.getUser();
    // fetch full user profile information by calling api using user ID
    const response = await userApi.getUser(currentUser.userID);
    return response.data;
  };

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_EDIT, { 
      userData: userData,
      navigation: navigation,
       ...user 
      });
  };

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      const promiseFunction = async () => {
        const response = await getCurrentUser();
        setUser(response.data);
      };
      promiseFunction();
    });
    return navListener;
  }, [navigation]);

  return (
    <ScrollView>
      <VStack mt="4" ml="4" px={Platform.OS === 'web' ? '10%' : null}>
        <Center>
          <Center>
            <AspectRatio w="80%" ratio={1} mb="2" alignSelf="center">
              <Image
                borderRadius="full"
                fallbackSource={{
                  uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                }}
                source={{
                  uri: user.profilePicture
                    ? `${user.profilePicture}`
                    : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                }}
                alt="user_image"
              />
            </AspectRatio>
          </Center>
        </Center>

        <InformationCard
          title={"Personal Information"}
          displayData={userData}
          handleOnPress={handleOnPress}
        />
      </VStack>
    </ScrollView>
  );
}

export default AccountViewScreen;
