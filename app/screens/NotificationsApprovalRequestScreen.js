import React, { useContext, useState } from 'react';
import { Platform } from 'react-native';
import { Text, Box, VStack, ScrollView, Avatar, HStack } from 'native-base';
import TopHeaderWithBackButton from 'app/components/TopHeaderWithBackButton';
import BottomTabWithCustomizedButtons from 'app/components/BottomTabWithCustomizedButtons';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';

function NotificationsApprovalRequestScreen(props) {
  const { navigation, route } = props;
  const { senderName, senderPicUrl, message, notificationID } = route.params;
  const { setAcceptRejectNotifID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const leftBtnFn = () => {
    // setLoading
    setIsLoading(true);
    // (1) TODO: API Call to accept this LogID
    // (2) Update parent screen
    setAcceptRejectNotifID(notificationID);
    // unSetLoading
    setIsLoading(false);
    // (3) Navigate back to parent screen
    navigation.goBack();
  };
  const rightBtnFn = () => {
    // setLoading
    setIsLoading(true);
    // (1) TODO: API Call to reject this LogID
    // (2) Update parent screen
    setAcceptRejectNotifID(notificationID);
    // unSetLoading
    setIsLoading(false);
    // (3) Navigate back to parent screen
    navigation.goBack();
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <Box h="100%" w="100%" safeAreaTop>
          <TopHeaderWithBackButton navigation={navigation} />
          <Box w="90%" ml="5" mr="5" mt="5">
            <VStack space={5}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  color={colors.black_var1}
                  fontFamily={
                    Platform.OS === 'ios' ? 'Helvetica' : typography.android
                  }
                  fontWeight="bold"
                  fontSize="md"
                >
                  {senderName} has requested for an update
                </Text>
                <Avatar
                  size="md"
                  bg={colors.pink}
                  source={{
                    uri: senderPicUrl
                      ? senderPicUrl
                      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
                  }}
                >
                  --
                </Avatar>
              </HStack>
              <ScrollView h="100%" w="100%">
                <Box>
                  <Text
                    color={colors.black_var1}
                    fontFamily={
                      Platform.OS === 'ios' ? 'Helvetica' : typography.android
                    }
                    fontWeight="hairline"
                    fontSize="md"
                  >
                    {message}
                  </Text>
                </Box>
              </ScrollView>
            </VStack>
          </Box>

          <BottomTabWithCustomizedButtons
            leftButtonText="Accept"
            rightButtonText="Reject"
            leftBtnFn={leftBtnFn}
            rightBtnFn={rightBtnFn}
          />
        </Box>
      )}
    </>
  );
}

export default NotificationsApprovalRequestScreen;
