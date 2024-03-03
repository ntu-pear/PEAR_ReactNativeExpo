import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Image,
  ToastAndroid,
} from 'react-native';
import { Text, VStack } from 'native-base';
import typography from 'app/config/typography';
import DefaultImage from 'app/assets/placeholder.png';
import colors from 'app/config/colors';

function ProfileNameButton({
  profilePicture,
  profileLineOne,
  profileLineTwo,
  isPatient,
  size,
  isVertical,
  handleOnPress,
  isActive=null,
  startDate=null,
}) {
  const defaultImageUri = Image.resolveAssetSource(DefaultImage).uri;

  const [isError, setIsError] = useState(false);

  const containerStyle = isVertical
    ? styles.ContentWrapperVertical
    : styles.ContentWrapperHorizontal;

  const profilePictureStyle = styles.ProfilePicture;
  const textLayoutStyle = styles.TextContainer;

  const customProfilePictureStyle = {
    ...profilePictureStyle,
    borderRadius: 100,
    height: size,
    width: size,
  };

  const customTextContainerStyle = {
    ...textLayoutStyle,
    marginLeft: isVertical ? null : 30,
  };

  const handleProfilePicError = () => {
    ToastAndroid.show(('Error loading profile picture for patient ' + profileLineOne.trim()), ToastAndroid.SHORT)
    setIsError(true);
  }

  return (
    <VStack alignItems="center">
      <TouchableOpacity onPress={handleOnPress}>
        <View style={containerStyle}>
          <Image
            style={customProfilePictureStyle}
            alt={isPatient === true ? 'patient_image' : 'user_image'}
            onError={handleProfilePicError}
            // Note: This is a fall-back uri. Will only be used if source fails to render the image.
            source={
              profilePicture 
                ? isError 
                  ? DefaultImage
                  : { uri: `${profilePicture}` } 
                : DefaultImage
            }
          />
          <View style={customTextContainerStyle}>
            {profileLineOne ? (
              <Text
                style={[styles.DefaultText, styles.NameText, ...isVertical ? [{textAlign: 'center'}] : []]}
                fontSize={size / 4}
              >
                {profileLineOne.trim()}
              </Text>
            ) 
            : null}
            {profileLineTwo ? (
              <Text style={[styles.DefaultText, ...isVertical ? [{textAlign: 'center'}] : []]} fontSize={size / 6}>
                {profileLineTwo.trim()}
              </Text>
            ) : null}
            {startDate != null ? (
              <Text style={styles.DefaultText} fontSize={size / 6}>
                Start date: {startDate.split('T')[0]}
              </Text>
            ) : null}
            {isActive != null ? (
              <Text style={styles.DefaultText} fontSize={size / 6} color={isActive ? colors.green : colors.red}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </VStack>
  );
}

ProfileNameButton.defaultProps = {
  isVertical: true,
  isPatient: false,
  size: 65,
};

const styles = StyleSheet.create({
  ContentWrapperVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '4%',
    paddingTop: '6%',
  },
  ContentWrapperHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '4%',
    paddingTop: '6%',
  },
  ProfilePicture: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  DefaultText: {
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  NameText: {
    fontWeight: 'bold',
  },
  TextContainer: {
    justifyContent: 'flex-start',
    marginLeft: 30,
  },
});

export default ProfileNameButton;
