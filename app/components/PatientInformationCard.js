/*eslint eslint-comments/no-unlimited-disable: error */
import React, { useState } from 'react';
import {
  Dimensions,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Box, VStack, Avatar, Text, HStack, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';
import { useNavigate } from 'react-router-dom';

// Hook
import formatDateTime from 'app/hooks/useFormatDateTime.js';

function PatientInformationCard(props) {
  const { patientProfile, navigation } = props;
  const [displayPicUrl, setDisplayPicUrl] = //eslint-disable-line no-unused-vars
    useState(
      `https://picsum.photos/400/400/?image=${Math.floor(Math.random() * 85)}`,
    );

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const calcAge = (dob) => {
    const today = new Date().getFullYear();
    const _dob = new Date(dob).getFullYear();
    return today - _dob;
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  // Helper function to get the correct image source format
  const getImageSource = () => {
    if (!patientProfile?.profilePicture) {
      return null; // Will show initials
    }
    
    // If it's a number (local require), use it directly
    if (typeof patientProfile.profilePicture === 'number') {
      return patientProfile.profilePicture;
    }
    
    // If it's a string URL, wrap it in { uri: ... }
    if (typeof patientProfile.profilePicture === 'string') {
      return { uri: patientProfile.profilePicture };
    }
    
    return null;
  };

  return (
    <Box
      overflow="visible"
      backgroundColor={colors.green}
      borderColor={colors.grey_lighter}
      borderBottomWidth="3"
      style={styles.container}
    >
      <HStack space={4} width="100%" alignItems="flex-start">
        {/* Avatar */}
        <Avatar
          testID="patient_profile_picture"
          size={Platform.OS === 'web' ? '28vh' : SCREEN_HEIGHT * 0.11}
          bg={colors.pink}
          source={getImageSource()}
          borderColor={colors.grey_lightest}
          borderWidth="2"
        >
          {patientProfile?.firstName?.substring(0, 1) || 
           patientProfile?.preferredName?.substring(0, 1) || 
           '--'}
        </Avatar>
        
        {/* Content Section - All in one HStack for mobile */}
        <HStack flex={1} justifyContent="space-between">
          {/* Left side: Name, Gender, Language */}
          <VStack justifyContent="center">
            <Text
              testID="patient_preferred_name"
              bold
              fontSize={SCREEN_HEIGHT * 0.024}
              color={colors.grey_lightest}
            >
              {patientProfile?.preferredName || '-'}
            </Text>
            <Text
              testID="patient_gender"
              italic
              fontSize={SCREEN_HEIGHT * 0.024}
              color={colors.grey_lightest}
            >
              {patientProfile?.gender === 'F' ? 'FEMALE' : 
               patientProfile?.gender === 'M' ? 'MALE' : '-'}
            </Text>
            <Text
              testID="patient_preferred_language"
              thin
              fontSize={SCREEN_HEIGHT * 0.024}
              color={colors.grey_lightest}
            >
              {patientProfile?.preferredLanguage || '-'}
            </Text>
          </VStack>

          {/* Right side: NRIC/DOB and Age/Mobile */}
          <HStack space={4}>
            {/* NRIC and DOB Column */}
            <VStack>
              <Text
                testID="nric_label"
                thin
                fontSize={SCREEN_HEIGHT * 0.014}
                color={colors.grey_lightest}
              >
                NRIC NO.
              </Text>
              <Text
                testID="nric_value"
                bold
                fontSize={SCREEN_HEIGHT * 0.024}
                lineHeight="xs"
                color={colors.grey_lightest}
              >
                {`${patientProfile?.nric || '-'}`}
              </Text>
              <Text
                testID="dob_label"
                thin
                fontSize={SCREEN_HEIGHT * 0.014}
                mt="2"
                color={colors.grey_lightest}
              >
                DATE OF BIRTH
              </Text>
              <Text
                testID="dob_value"
                bold
                fontSize={SCREEN_HEIGHT * 0.024}
                lineHeight="xs"
                color={colors.grey_lightest}
              >
                {patientProfile?.dob ? formatDateTime(patientProfile.dob, true) : '-'}
              </Text>
            </VStack>

            {/* Age and Mobile Column */}
            <VStack>
              <Text
                testID="age_label"
                thin
                fontSize={SCREEN_HEIGHT * 0.014}
                color={colors.grey_lightest}
              >
                AGE
              </Text>
              <Text
                testID="age_value"
                bold
                fontSize={SCREEN_HEIGHT * 0.024}
                lineHeight="xs"
                color={colors.grey_lightest}
              >
                {patientProfile?.dob ? calcAge(patientProfile.dob) : '-'}
              </Text>
              <Text
                testID="mobile_number_label"
                thin
                fontSize={SCREEN_HEIGHT * 0.014}
                mt="2"
                color={colors.grey_lightest}
              >
                Mobile Number
              </Text>
              <Text
                testID="mobile_number_value"
                bold
                fontSize={SCREEN_HEIGHT * 0.024}
                lineHeight="xs"
                color={colors.grey_lightest}
              >
                {patientProfile?.handphoneNo || '-'}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    flexDirection: 'column',
    paddingBottom: 12,
    paddingHorizontal: 25,
    paddingTop: 12,
  },
});

export default PatientInformationCard;
