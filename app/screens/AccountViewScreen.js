// Libs
import React, { useContext, useEffect, useState } from 'react';
import { Platform, Alert, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [userProfile, setUserProfile] = useState({});
  const [unMaskedUserNRIC, setUnMaskedUserNRIC] = useState('');
  const [uploading, setUploading] = useState(false);

const onPickAndUploadPhoto = async () => {
  // Ask permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== 'granted') {
    Alert.alert('Profile Photo', 'Permission to access photos is required.');
    return;
  }

  // Pick image
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (res.canceled) return;

  // Build file
  const a = res.assets[0];
  const file = {
    uri: a.uri,
    name: a.fileName || 'profile.jpg',
    type: a.mimeType || 'image/jpeg',
  };

  // Upload via your v1 wrapper, then refetch profile
  try {
    setUploading(true);
    const up = await userApi.uploadProfilePicV1(file); // POST /api/v1/user/upload_profile_pic/
    if (!up.ok) {
      Alert.alert('Profile Photo', up?.data?.detail || 'Upload failed.');
      return;
    }
    Alert.alert('Profile Photo', 'Uploaded successfully.');

    // Refresh so the new image shows
    const refetch = await userApi.getUser();       // GET /api/v1/user/get_user/
    if (refetch.ok) setUserProfile(refetch.data);
  } finally {
    setUploading(false);
  }
};

  const maskNRIC = (raw) =>
    typeof raw === 'string' ? raw.replace(/\d{4}(\d{3})/, 'xxxx$1') : 'Not available';
  
  const userData = [
    { label: 'Preferred Name', value: userProfile?.preferredName ?? '' },
    { label: 'Contact Number', value: userProfile?.contactNo ?? '' },
    { label: 'First Name', value: userProfile?.firstName ?? '' },
    { label: 'Last Name', value: userProfile?.lastName ?? '' },
    { label: 'Role', value: userProfile?.role ?? '' },
    { label: 'NRIC', value: maskNRIC(unMaskedUserNRIC) },
    {
      label: 'Gender',
      value:
        userProfile?.gender === 'F'
          ? 'FEMALE'
          : userProfile?.gender === 'M'
          ? 'MALE'
          : 'Not available',
    },
    { label: 'DOB', value: userProfile?.dob ?? 'Not available' },
    { label: 'Email', value: userProfile?.email ?? 'Not available' },
    { label: 'Address', value: userProfile?.address ?? 'Not available' },
  ];
  
  
  // Used to retrieve the user since after an editing of the user's particulars it will need to be refreshed - Russell
  const retrieveCurrentUser = async () => {
  // fetch full user profile information using v1 self endpoint
  const response = await userApi.getUser(); // v1: /api/v1/user/get_user/
  if (!response.ok) {
    console.log('Request failed with status code: ', response.status);
    return;
 }
    setUserProfile(response.data);
    setUnMaskedUserNRIC(response.data.nric);
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
      setUserProfile({});
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
  const FALLBACK =
  'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg';
  const hasPic =
  typeof userProfile?.profilePicture === 'string' &&
  userProfile.profilePicture.trim().length > 0;

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
                fallbackSource={{ uri: FALLBACK }}
                source={{ uri: hasPic ? userProfile.profilePicture : FALLBACK }}
                alt="user_image"
                />

            </AspectRatio>

            <Button
              title={uploading ? 'Uploading…' : 'Change Photo'}
              onPress={onPickAndUploadPhoto}
              disabled={uploading}
            />

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
