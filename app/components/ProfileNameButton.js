import React from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { Text, VStack } from 'native-base';
import typography from 'app/config/typography';
import DefaultImage from 'app/assets/placeholder.png';

function ProfileNameButton({
  profilePicture,
  profileLineOne,
  profileLineTwo,
  isPatient,
  size,
  isVertical,
  handleOnPress,
}) {
  const defaultImage = Image.resolveAssetSource(DefaultImage).uri;

  const containerStyle = isVertical
    ? styles.ContentWrapperVertical
    : styles.ContentWrapperHorizontal;

  return (
    <VStack alignItems="center">
      <TouchableOpacity onPress={handleOnPress}>
        <View style={containerStyle}>
          <Image
            style={styles.ProfilePicture(size)}
            alt={isPatient === true ? 'patient_image' : 'user_image'}
            // Note: This is a fall-back uri. Will only be used if source fails to render the image.
            fallbackSource={{
              uri: defaultImage,
            }}
            source={{
              uri: profilePicture ? `${profilePicture}` : defaultImage,
            }}
          />
          <View style={styles.TextContainer(isVertical)}>
            <Text
              style={[styles.DefaultText, styles.NameText]}
              fontSize={size / 4}
            >
              {profileLineOne}
            </Text>
            {profileLineTwo ? (
              <Text style={styles.DefaultText} fontSize={size / 6}>
                {`${profileLineTwo}`}
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
};

const styles = StyleSheet.create({
  ContentWrapperVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '4%',
    paddingTop: '6%',
  },
  ContentWrapperHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: '4%',
    paddingTop: '6%',
  },
  ProfilePicture: (size) => {
    return {
      height: size,
      width: size,
      borderRadius: 100,
      resizeMode: 'contain',
    };
  },
  DefaultText: {
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    textAlign: 'center',
  },
  NameText: {
    fontWeight: 'bold',
  },
  TextContainer: (isVertical) => {
    return {
      justifyContent: 'center',
      marginLeft: isVertical ? null : 30,
    };
  },
});

export default ProfileNameButton;
