import React from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from 'native-base';
import typography from 'app/config/typography';
import routes from 'app/navigation/routes';
import DefaultImage from 'app/assets/placeholder.png';

function ProfileNameButton({ navigation, profile, isPatient, size }) {
  const defaultImage = Image.resolveAssetSource(DefaultImage).uri;

  const handleOnPress = () => {
    if (isPatient === true) {
      navigation.push(routes.PATIENT_PROFILE, { patientProfile: profile });
    } else {
      navigation.push(routes.ACCOUNT_VIEW, { ...profile });
    }
  };

  return (
    <View style={styles.ContentWrapper}>
      <TouchableOpacity onPress={handleOnPress}>
        <Image
          style={styles.ProfilePicture(size)}
          alt={isPatient === true ? 'patient_image' : 'user_image'}
          // Note: This is a fall-back uri. Will only be used if source fails to render the image.
          fallbackSource={{
            uri: defaultImage,
          }}
          source={{
            uri: profile.profilePicture
              ? `${profile.profilePicture}`
              : defaultImage,
          }}
        />
      </TouchableOpacity>
      <Text style={[styles.DefaultText, styles.NameText]} fontSize={size / 5}>
        {profile.preferredName}
      </Text>
      {isPatient !== true ? (
        <Text style={styles.DefaultText} fontSize={size / 6}>
          {`${profile.role}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ContentWrapper: {
    alignItems: 'center',
    // backgroundColor: 'red',
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
});

export default ProfileNameButton;
