import { Center, VStack, HStack, ScrollView, View, Platform, StyleSheet } from 'native-base';
import React, { useContext } from 'react';
import authStorage from 'app/auth/authStorage';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import AuthContext from 'app/auth/context';
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';
import LoadingWheel from 'app/components/LoadingWheel';
import jwt_decode from 'jwt-decode';
import useInactivityLogout from 'app/hooks/useInactivityLogout';
import globalStyles from 'app/utility/styles.js';
import { useGetPersonalDetails } from 'app/hooks/useGetPersonalDetails';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import routes from 'app/navigation/routes';
import ConfigCard from 'app/components/ConfigCard';
import Icon from 'react-native-vector-icons/FontAwesome';

// Configurations
import ScheduleAccordion from 'app/components/ScheduleAccordion';

// const getUserTokens = async () => {
//   const accessToken1 = await authStorage.getToken('userAuthToken');
//   const refreshToken1 = await authStorage.getToken('userRefreshToken');
//   console.log('access token: ' + accessToken1);
//   var decoded = jwt_decode(accessToken1);
//   const utcPlus8Date = new Date();
//   // Convert UTC+8 time to UTC time
//   const utcTimeInMilliseconds = utcPlus8Date.getTime() - 8 * 60 * 60 * 1000;
//   // Create a new Date object with the UTC time
//   // const utcDate = new Date(utcTimeInMilliseconds);
//   // console.log(utcTimeInMilliseconds);
//   var exp = decoded.exp * 1000;
//   // var exp = 1698292834 * 1000;
//   console.log(exp);
//   // if expired
//   if (utcTimeInMilliseconds >= exp) {
//     console.log('expired');
//   } else console.log('valid');
//   return;
// };

function ConfigScreen() {
  // getUserTokens();
 
  return(
  <ScheduleAccordion />
  );
}

export default ConfigScreen;
