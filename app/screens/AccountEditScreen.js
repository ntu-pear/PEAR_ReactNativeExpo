// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, View } from 'react-native';
import {
  Image,
  VStack,
  HStack,
  AspectRatio,
  Center,
  FlatList,
  Text,
  Box,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';

//API
import userApi from 'app/api/user';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// Components
import NameInputField from 'app/components/NameInputField';
import TelephoneInputField from 'app/components/TelephoneInputField';
import InformationCard from 'app/components/InformationCard';
import AppButton from 'app/components/AppButton';

function AccountEditScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { navigation, userData } = props.route.params;
  const [profilePicture, setProfilePicture] = useState(props.route.params.profilePicture);

  // error state for component
  const [isInputErrors, setIsInputErrors] = useState(false);

  // error states for child components
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isContactError, setIsContactError] = useState(false);

  const handlePrefNameState = useCallback(
    (state) => {
      setIsPrefNameError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handleContactNoState = useCallback(
    (state) => {
      setIsContactError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isContactError],
  );

  // Error state handling for this component
  useEffect(() => {
    setIsInputErrors(
      isPrefNameError ||
      isContactError,
    );
  }, [
    isPrefNameError,
    isContactError,
    isInputErrors,
  ]);

  const [formData, setFormData] = useState({
    PreferredName: props.route.params.preferredName,
    ContactNo: props.route.params.contactNo,
  });

  const handleFormData =
    (input = null) =>
    (e) => {
      setFormData((previousState) => ({
        ...previousState,
        [input]: e,
      }));
    };

  const submitForm = async () => {
    setIsLoading(true);
    const result = await userApi.updateUser(formData);
    let alertTitle = '';
    let alertDetails = '';

    if (result.ok) {
      navigation.goBack(routes.ACCOUNT_SCREEN, {
        navigation: navigation,
      });
      alertTitle = 'Saved Successfully';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error in Editing Personal Information';
      console.log("result error "+JSON.stringify(result));
    }
    Alert.alert(alertTitle, alertDetails);
    console.log("formData "+JSON.stringify(formData));
    setIsLoading(false);
  };

  const handleOnPressToImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setProfilePicture(result.uri);
        const fileName = result.uri.split('/').pop();
        const fileType = fileName.split('.').pop();
        setFormData(prevUserData => ({
          ...prevUserData,
          "uploadProfilePicture": {
            uri: result.uri,
            name: fileName,
            type: `image/${fileType}`,
          },
        }));
      } else {
        return false;
      }
    } else {
      const alertTxt = 'Please enable permissions to pick from image gallery.';
      Platform.OS === 'web' ? alert(alertTxt) : Alert.alert(alertTxt);
    }
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <View style={styles.formContainer}>
                <Center alignSelf="center">
                  <TouchableOpacity
                    onPress={handleOnPressToImagePicker}
                  >
                    <AspectRatio
                      w='70%'
                      ratio={1}
                      mb="2"
                    >
                      <Image
                        borderRadius="full"
                        fallbackSource={{
                          uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                        }}
                        resizeMode="cover"
                        source={{
                          uri: profilePicture
                            ? `${profilePicture}`
                            : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
                        }}
                        alt="user_image"
                      />
                    </AspectRatio>
                    <Text style={styles.redText}> Click to edit profile picture</Text>
                  </TouchableOpacity>
                </Center>

                <NameInputField
                  isRequired
                  title={'Preferred Name'}
                  value={formData['PreferredName']}
                  onChangeText={handleFormData('PreferredName')}
                  onChildData={handlePrefNameState}
                />

                <TelephoneInputField
                  isRequired
                  title={'Contact No.'}
                  value={formData['ContactNo']}
                  numberType={'mobile'}
                  onChangeText={handleFormData('ContactNo')}
                  onChildData={handleContactNoState}
                />

                <InformationCard
                  displayData={userData}
                />

                <Text style={styles.redText}>
                  Note: To edit other information, please contact system administrator.
                </Text>
              </View>
              <View style={styles.saveButtonContainer}>
                <Box width='70%'>
                  {isLoading ? 
                  <AppButton title="Save" color="green" onPress={submitForm} isDisabled={true} /> :
                  <AppButton title="Save" color="green" onPress={submitForm} isDisabled={isInputErrors} /> 
                  }
                </Box>
              </View>
            </VStack>
          </Box>
        </Box>
      )}
    />
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: '10%',
    width: '90%',
    marginBottom: 20,
  },
  redText: {
    marginBottom: 4,
    alignSelf: "center",
    color: colors.red,
  },
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default AccountEditScreen;
