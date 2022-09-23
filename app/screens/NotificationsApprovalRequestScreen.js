import React, { useContext, useState, useRef } from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {
  Text,
  Box,
  VStack,
  ScrollView,
  Avatar,
  HStack,
  AlertDialog,
  Button,
  FormControl,
  TextArea,
} from 'native-base';
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
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false);
  const cancelRef = useRef(null);

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
    setAlertDialogIsOpen(!alertDialogIsOpen);
    // // setLoading
    // setIsLoading(true);
    // // (1) TODO: API Call to reject this LogID
    // // (2) Update parent screen
    // setAcceptRejectNotifID(notificationID);
    // // unSetLoading
    // setIsLoading(false);
    // // (3) Navigate back to parent screen
    // navigation.goBack();
  };

  const handleAddRejectComment = () => {
    // (1) Set Loading
    // (2) API - Notification Action API Call -- to add comments
    // (3) API - Set Notification as Read
    // (4) unSet Loading
    // (5) Navigate back to parent screen
  };

  const onClose = () => {
    setAlertDialogIsOpen(!alertDialogIsOpen);
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <Box h="100%" w="100%" safeAreaTop>
          <TopHeaderWithBackButton navigation={navigation} />
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
          </TouchableWithoutFeedback>

          <AlertDialog
            leastDestructiveRef={cancelRef}
            isOpen={alertDialogIsOpen}
            onClose={onClose}
          >
            <AlertDialog.Content>
              <AlertDialog.CloseButton />
              <AlertDialog.Header>Add Reason For Rejection</AlertDialog.Header>
              <AlertDialog.Body>
                <FormControl>
                  <FormControl.Label
                    _text={{
                      fontSize: 'md',
                      fontWeight: 'medium',
                    }}
                  >
                    Reasons
                  </FormControl.Label>
                  <TextArea numberOfLines={6} />
                </FormControl>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  w="30%"
                  size="md"
                  bg={colors.pink}
                  _text={{
                    color: `${colors.white_var1}`,
                    fontFamily:
                      Platform.OS === 'ios' ? 'Helvetica' : typography.android,
                    fontSize: 'sm',
                  }}
                >
                  Confirm
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>

          <BottomTabWithCustomizedButtons
            leftButtonText="Accept"
            rightButtonText="Reject"
            popOverWithForm={true}
            leftBtnFn={leftBtnFn}
            rightBtnFn={rightBtnFn}
          />
        </Box>
      )}
    </>
  );
}

export default NotificationsApprovalRequestScreen;
