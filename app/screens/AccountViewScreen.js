// Libs
import React, { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Image, VStack, AspectRatio, Center, ScrollView } from 'native-base';
import AuthContext from 'app/auth/context';

// API
import userApi from 'app/api/user';

// Configurations
import routes from 'app/navigation/routes';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import InformationCard from 'app/components/InformationCard';
import authStorage from 'app/auth/authStorage';

function AccountViewScreen(props) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState([]);
  const [unMaskedUserNRIC, setUnMaskedUserNRIC] = useState('');
  
  // Data used for display, sent to InformationCard
  const userData = [
    { label: 'Preferred Name', value: userProfile.preferredName },
    { label: 'Contact Number', value: userProfile.contactNo },
    { label: 'First Name', value: userProfile.firstName },
    { label: 'Last Name', value: userProfile.lastName },
    { label: 'Role', value: userProfile.role },
    { label: 'NRIC', value: unMaskedUserNRIC.replace(/\d{4}(\d{3})/, 'xxxx$1') },
    {
      label: 'Gender',
      value: userProfile.gender === 'F' ? 'Female' : 'Male',
    },
    {
      label: 'DOB',
      value: userProfile.dob || 'Not available',
    },
    {
      label: 'Email',
      value: userProfile.email || 'Not available',
    },
    {
      label: 'Address',
      value: userProfile.address || 'Not available',
    },
  ];
  // Used to retrieve the user since after an editing of the user's particulars it will need to be refreshed - Russell
  const retrieveCurrentUser = async () => {
    // get current user from authStorage
    const currentUser = await authStorage.getUser();
    // fetch full user profile information by calling api using user ID
    const response = await userApi.getUser(currentUser.userID, false);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setUserProfile(response.data.data);
    setUnMaskedUserNRIC(response.data.data.nric)
  };

  // used to confirm that data has returned from apis before loading the page - Russell
  useEffect(() => {
    if(userProfile !== undefined && Object.keys(userProfile).length>0){
      setIsLoading(false);
    }
  }, [userProfile]);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      setUserProfile([]);
      setIsLoading(true);
      retrieveCurrentUser();
    });
    return navListener;
  }, [navigation]);

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_EDIT, { 
      userData: userData,
      navigation: navigation,
      unMaskedUserNRIC: unMaskedUserNRIC,
       ...userProfile 
      });
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
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
                  uri: userProfile.profilePicture
                    ? `${userProfile.profilePicture}`
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
          unMaskedNRIC={unMaskedUserNRIC}
        />
      </VStack>
    </ScrollView>
  );
}

export default AccountViewScreen;
