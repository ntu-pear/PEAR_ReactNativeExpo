import React, { useContext } from 'react';
import { useState } from 'react';
import { Platform, Alert, ActivityIndicator } from 'react-native';
import {
  Image,
  VStack,
  HStack,
  Input,
  FormControl,
  Stack,
  TextArea,
  AspectRatio,
  Center,
  ScrollView,
  Text,
  Button,
  Box
} from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import userApi from 'app/api/user';
import routes from 'app/navigation/routes';
import EditField from 'app/components/EditField';
import ErrorMessage from 'app/components/ErrorMessage';
import * as Yup from 'yup';

function EditAccountScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { navigation, route } = props;
  const userProfile = route.params;
  const [formData, setFormData] = useState({
    preferredName: userProfile.preferredName,
    contactNo: userProfile.contactNo,
  });
  const [profilePicture, setProfilePicture] = useState(
    userProfile.profilePicture,
  );
  const [errors, setErrors] = useState({});

  const schema = Yup.object().shape({
    preferredName: Yup.string()
    .required('Preferred Name is a required field.'),
    contactNo: Yup.string().matches(/^$|^[869][0-9]{7}$/, {
      message:
        'Contact No. must start with the digit 6, 8 or 9, and must have 8 digits.',
    }).required('Contact No. is a required field.'),
  });

  const handleFormData =
    (input = null) =>
    (e, date = null) => {
      const newData = formData;
      date ? (newData[input] = date) : (newData[input] = e);
      setFormData(() => ({
        preferredName: newData.preferredName,
        contactNo: newData.contactNo,
      }));
    };

    const validate = async () => {
      try {
        // Validate the form data against the schema and set errors when needed
        await schema.validate(formData, { abortEarly: false });
        return true;
      } catch (error) {
        if (error.inner) {
          const errorList = {};
        error.inner.forEach((e) => {
          errorList[e.path] = e.message;
        });
        // console.log(errorList);
        setErrors(errorList);
        return false;
      }
    }
    };

  const handleOnPressToSave = async () => {
    const validation = await validate();
    if (!validation) {
      return;
    }

    setIsLoading(true);
    const result = await userApi.updateUser(formData, profilePicture);
    console.log('Edit acc screen', result);
    if (!result.ok) {
      setErrors({
        api: result.data.message,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    Alert.alert('Successfully updated.');
    navigation.pop();
    navigation.navigate(routes.ACCOUNT_SCREEN);
  };

  const handleOnPressToCancel = () => {
    navigation.goBack();
  };

  const handleOnPressToImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status == 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log(result)
      if (!result.cancelled) {
        setProfilePicture(result.uri);
      } else { 
        return false
      }
    } else {
      Alert.alert('Please enable permissions to pick from image gallery.');
    }
  };

  return (
    <ScrollView>
      <VStack mt="4" ml="4">
        <Center>
          <HStack>
            <Center>
              <TouchableOpacity onPress={handleOnPressToImagePicker} alignItems="center">
                <AspectRatio w="70%" ratio={1} mb="2" alignSelf="center">
                  <Image
                    borderRadius="full"
                    fallbackSource={{
                      uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
                    }}
                    resizeMode="cover"
                    source={{
                      uri: profilePicture
                        ? `${profilePicture}`
                        : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1678354032/User/Jessica_Sim_Sxxxx781F/ProfilePicture/osu40mslpycgtm1kajjo.png',
                    }}
                    alt="user_image"
                  />
                </AspectRatio>
                <Text color={colors.red}> Click to edit profile picture</Text>
              </TouchableOpacity>
              
            </Center>
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
              First Name
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.firstName}
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
              Last Name
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.lastName}
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
              Role
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.role}
              w="100%"
            />
          </HStack>
        </FormControl>


        <EditField isRequired
          isInvalid={'preferredName' in errors}
          title="Preferred Name"
          placeholder={userProfile.preferredName}
          onChangeText={handleFormData('preferredName')}
          value={formData.preferredName}
          ErrorMessage={errors.preferredName}
        />
       
       <EditField isRequired
          isInvalid={'contactNo' in errors}
          title="Contact No."
          placeholder={userProfile.contactNo}
          onChangeText={handleFormData('contactNo')}
          value={formData.contactNo}
          ErrorMessage={errors.contactNo}
        />

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
              NRIC
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.nric}
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
              Gender
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.gender}
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
              DOB
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.dob.substring(0, 10)}
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
              Email
            </FormControl.Label>

            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              variant="unstyled"
              value={userProfile.email}
              w="100%"
            />
          </HStack>
        </FormControl>

        <FormControl>
          <Stack space={0} alignItems="flex-start" flexWrap="wrap">
            <FormControl.Label
              width="100%"
              _text={{
                fontFamily: `${
                  Platform.OS === 'ios' ? 'Helvetica' : typography.android
                }`,
                fontSize: 'lg',
                fontWeight: 'thin',
              }}
            >
              Address
            </FormControl.Label>
            <TextArea
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
              fontSize="lg"
              isReadOnly
              input="lg"
              ml="-2.5"
              minH="30%"
              maxH="50%"
              variant="unstyled"
              value={userProfile.address || 'Not available'}
              w="100%"
            />
          </Stack>
        </FormControl>

        <Text
          mb="4"
          color={colors.red}
          fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        >
          {' '}
          Note: To edit other information, please contact system administrator.
        </Text>

        <Box>
          <ErrorMessage visible={'api' in errors} message={errors.api} />
        </Box>

        <HStack
          w="100%"
          space="0"
          alignItems="center"
          justifyContent="space-around"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary_overlay_color} />
              ) : (
          <Button
            onPress={() => handleOnPressToSave()}
            w="25%"
            size="md"
            bg={colors.green}
            _text={{
              color: `${colors.white_var1}`,
              fontFamily:
                Platform.OS === 'ios' ? 'Helvetica' : typography.android,
              fontSize: 'sm',
            }}
          >
            Save
          </Button>
          )}

          <Button
            onPress={() => handleOnPressToCancel()}
            w="25%"
            size="md"
            bg={colors.pink}
            _text={{
              color: `${colors.white_var1}`,
              fontFamily:
                Platform.OS === 'ios' ? 'Helvetica' : typography.android,
              fontSize: 'sm',
            }}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </ScrollView>
  );
}

export default EditAccountScreen;
