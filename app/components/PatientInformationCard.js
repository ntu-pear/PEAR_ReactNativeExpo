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

function PatientInformationCard(props) {
  const { patientProfile, navigation } = props;
  const [displayPicUrl, setDisplayPicUrl] = //eslint-disable-line no-unused-vars
    useState(
      `https://picsum.photos/400/400/?image=${Math.floor(Math.random() * 85)}`,
    );

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  // const handleOnPress = () => {
  //   if (Platform.OS === 'web') {
  //     navigate('/' + routes.PATIENT_INFORMATION, {
  //       state: { displayPicUrl: `${displayPicUrl}`, ...patientProfile },
  //     });
  //   } else {
  //     navigation.push(routes.PATIENT_INFORMATION, {
  //       displayPicUrl: `${displayPicUrl}`,
  //       navigation: navigation,
  //       ...patientProfile,
  //     });
  //   }
  // };

  const calcAge = (dob) => {
    const today = new Date().getFullYear();
    const _dob = new Date(dob).getFullYear();
    return today - _dob;
  };

  const extractFullYear = (dob) => {
    const _date = new Date(dob);
    return `${_date.getDate()}-${_date.getMonth()+1}-${_date.getFullYear()}`;
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const MyComponent = () => {
    return (
      <HStack space={'10%'} justifyContent="flex-end">
        <VStack>
          <Text thin fontSize={SCREEN_HEIGHT * 0.014} color={colors.light}>
            NRIC NO.
          </Text>
          <Text
            bold
            fontSize={SCREEN_HEIGHT * 0.024}
            lineHeight="xs"
            color={colors.light}
          >
            {`${patientProfile?.nric}`}
          </Text>
          <Text
            thin
            fontSize={SCREEN_HEIGHT * 0.014}
            mt="2"
            color={colors.light}
          >
            DATE OF BIRTH
          </Text>
          <Text
            bold
            fontSize={SCREEN_HEIGHT * 0.024}
            lineHeight="xs"
            color={colors.light}
          >
            {`${extractFullYear(patientProfile?.dob)}`}
          </Text>
        </VStack>

        <VStack>
          <Text thin fontSize={SCREEN_HEIGHT * 0.014} color={colors.light}>
            AGE
          </Text>
          <Text
            bold
            fontSize={SCREEN_HEIGHT * 0.024}
            lineHeight="xs"
            color={colors.light}
          >
            {`${calcAge(patientProfile?.dob)}`}
          </Text>
          <Text
            thin
            fontSize={SCREEN_HEIGHT * 0.014}
            mt="2"
            color={colors.light}
          >
            LANGUAGE
          </Text>
          <Text
            bold
            fontSize={SCREEN_HEIGHT * 0.024}
            lineHeight="xs"
            color={colors.light}
          >
            {`${patientProfile?.preferredLanguage}`}
          </Text>
        </VStack>
      </HStack>
    );
  };

  return (
    <Box
      overflow="visible"
      backgroundColor={colors.green}
      borderColor={colors.primary_gray}
      borderBottomWidth="3"
      style={styles.container}
    >
        <HStack space={'4%'} justifyContent="center">
          <Avatar
            size={Platform.OS === 'web' ? '28vh' : SCREEN_HEIGHT * 0.11}
            bg={colors.pink}
            marginY="auto"
            source={
              patientProfile?.profilePicture
                ? {
                    uri: `${patientProfile.profilePicture}`,
                  }
                : null
            }
            borderColor={colors.light}
            borderWidth="2"
          >
            {' '}
            {patientProfile &&
            patientProfile.firstName &&
            patientProfile.firstName.substring(0, 1)
              ? patientProfile.firstName.substring(0, 1)
              : '--'}{' '}
          </Avatar>
          <VStack space={'8%'}>
            <VStack>
              <Text
                bold
                fontSize={SCREEN_HEIGHT * 0.034}
                color={colors.light}
              >
                {`${patientProfile?.firstName} ${patientProfile?.lastName}`}
              </Text>
              <Text
                italic
                fontSize={SCREEN_HEIGHT * 0.024}
                color={colors.light}
              >
                {`${patientProfile?.preferredName}`}
              </Text>
              <Text
                italic
                fontSize={SCREEN_HEIGHT * 0.024}
                color={colors.light}
              >
                {patientProfile?.gender === 'F' ? 'Female' : 'Male'}
              </Text>
            </VStack>
            {Platform.OS === 'web' ? MyComponent() : null}
          </VStack>
        </HStack>
        {Platform.OS === 'web' ? null : MyComponent()}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 190,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default PatientInformationCard;
