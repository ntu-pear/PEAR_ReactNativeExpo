// Libs
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, View } from 'react-native';
import {
  Image,
  VStack,
  AspectRatio,
  Center,
  FlatList,
  Text,
  Box,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';

// APIs
import userApi from 'app/api/user';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// Components
import InformationCard from 'app/components/InformationCard';
import AppButton from 'app/components/AppButton';
import InputField from 'app/components/input-components/InputField';

function AccountEditScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { navigation, userData, unMaskedUserNRIC } = props.route.params;
  const [profilePicture, setProfilePicture] = useState(props.route.params.profilePicture);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);

  // Account data to be submitted
  const [formData, setFormData] = useState({
    PreferredName: props.route.params.preferredName,
    ContactNo: props.route.params.contactNo,
  });

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.  
  useEffect(() => {
    setIsInputErrors(
      isPrefNameError ||
      isMobileNoError,
    );
  }, [
    isPrefNameError,
    isMobileNoError,
    isInputErrors,
  ]);

  // Functions for error state reporting for the child components
  const handlePrefNameError = useCallback(
    (state) => {
      setIsPrefNameError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handleMobileNoError = useCallback(
    (state) => {
      setIsMobileNoError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobileNoError],
  );

  // Function to update patient data
  const handleFormData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: e
    }));
  };

  // form submission when save button is pressed
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

  // Function to launch image picker and handle image picking.
  // Reference: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  const pickImage = (input) => async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const newImageUri = 'file:///' + result.uri.split('file:/').join('');

      var newData = formData['patientInfo'];
      newData[input] = {
        uri: newImageUri,
        name: newImageUri.split('/').pop(),
        type: mime.getType(newImageUri),
      };

      setFormData((prevState) => ({
        ...prevState,
        ['patientInfo']: newData,
      }));
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

                <InputField
                  isRequired
                  title={'Preferred Name'}
                  value={formData.PreferredName}
                  onChangeText={handleFormData('PreferredName')}
                  onEndEditing={handlePrefNameError}
                  dataType="name"
                />

                <InputField
                  isRequired
                  title={'Contact No.'}
                  value={formData.ContactNo}
                  onChangeText={handleFormData('ContactNo')}
                  onEndEditing={handleMobileNoError}
                  dataType={'mobile phone'}
                  keyboardType='numeric'                      
                  maxLength={8}
                />

                <InformationCard
                  displayData={userData}
                  unMaskedNRIC={unMaskedUserNRIC}
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
