import React from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { Image, Text, VStack, Box, HStack } from 'native-base';
// Import Constants from routes
import routes from 'app/navigation/routes';
// import { useNavigate } from 'react-router-dom';

function AccountDetailCard(props) {
  const { userProfile, navigation } = props;

  // useNavigate() hook cannot work on mobile
  // const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const handleOnPress = () => {
    if (Platform.OS === 'web') {
      navigation('/' + routes.ACCOUNT_VIEW, {
        state: { userProfile: userProfile },
      });
    } else {
      navigation.push(routes.ACCOUNT_VIEW, { ...userProfile });
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <Box style={styles.CardBoxContainer} testID="accountDetailCard">
        <HStack space={10}>
          <Image
            style={styles.ProfileImage}
            alt="user_image"
            // Note: This is a fall-back uri. Will only be used if source fails to render the image.
            fallbackSource={{
              uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
            }}
            source={{
              uri: userProfile.profilePicture
                ? `${userProfile.profilePicture}`
                : 'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
            }}
          />
          <VStack style={styles.TextContentWrapper}>
            <Text style={styles.PreferredName}>
              {`${userProfile.preferredName}`}
            </Text>
            <Text style={styles.Role}>{`${userProfile.role}`}</Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  CardBoxContainer: {
    minWidth: '90%',
    marginVertical: Platform.OS === 'web' ? 2 : 20,
    padding: Platform.OS === 'web' ? 8 : 10,
    overflow: 'visible',
    borderRadius: 10,
    borderColor: colors.primary_gray,
    borderWidth: 3,
  },
  ProfileImage: {
    borderRadius: 100,
    resizeMode: 'contain',
    width: 90,
    height: 90,
  },
  TextContentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  PreferredName: {
    alignSelf: 'flex-start',
    fontSize: 23,
    fontWeight: 'bold',
  },
  Role: {
    alignSelf: 'flex-start',
    fontSize: 18,
  },
});

export default AccountDetailCard;
