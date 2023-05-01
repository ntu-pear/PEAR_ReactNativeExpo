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
import notificationApi from 'app/api/notification';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import NotificationActions from 'app/config/notificationActions';
import { useNotificationContext } from 'app/screens/notifications/NotificationContext';
import { setMockNotificationAction } from 'app/screens/notifications/NotificationDataContext';
notificationApi.setNotificationAction = setMockNotificationAction;

function NotificationsApprovalRequestScreen(props) {
  const { navigation, route } = props;
  const { senderName, senderPicUrl, message, notificationID } = route.params;
  const { setAcceptRejectNotifID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false);
  const [isInvalidErrorMessage, setIsInvalidErrorMessage] = useState(false);
  const [reasonTextAreaValue, setReasonTextAreaValue] = useState('');
  const [functionToCallAgain, setFunctionToCallAgain] = useState(null);
  const [isError, setIsError] = useState(false);
  const {
    setRefetchAcceptNotifications,
    setRefetchRejectNotifications,
    setRefetchNotifications,
  } = useNotificationContext();
  const cancelRef = useRef(null);

  const leftBtnFn = async () => {
    // setLoading
    setIsLoading(true);
    // (1) API Call to set current Notification ID as `read`, and type of action
    const response = await notificationApi.setNotificationAction(
      notificationID,
      NotificationActions.Approve,
    );
    if (!response.ok) {
      setIsLoading(false);
      setFunctionToCallAgain('leftBtnFn');
      setIsError(true);
      return;
    }
    // (2) Update parent screen
    setAcceptRejectNotifID(notificationID);
    // unSetLoading
    setIsLoading(false);
    // (3) Navigate back to parent screen
    setRefetchAcceptNotifications(true);
    setRefetchNotifications(true);
    navigation.goBack();
  };

  const rightBtnFn = () => {
    setAlertDialogIsOpen(!alertDialogIsOpen);
  };

  const handleAddRejectComment = async () => {
    // TODO: Further form invalidations to be included here
    // e.g. Sanitization
    // Form validation [Guard]
    if (reasonTextAreaValue.trim().length < 6) {
      // Set error message for form
      setIsInvalidErrorMessage(true);
      // Immediate return
      return null;
    }
    // Re-set error message for form to `False` before proceeding
    // with subsequent commands
    setIsInvalidErrorMessage(false);
    // (1) Set Loading
    setIsLoading(true);
    // (2) API Call to set current Notification ID as `read`, type of action, and comment
    const response = await notificationApi.setNotificationAction(
      notificationID,
      NotificationActions.Reject,
      reasonTextAreaValue,
    );
    if (!response.ok) {
      setIsLoading(false);
      setFunctionToCallAgain('handleAddRejectComment');
      setIsError(true);
      return;
    }
    setRefetchRejectNotifications(true);
    setRefetchNotifications(true);
    // (4) Update parent screen
    setAcceptRejectNotifID(notificationID);
    // (4) unSet Loading
    setIsLoading(false);
    // (5) Navigate back to parent screen
    navigation.goBack();
  };

  // Handles closing of Alert Dialog
  const onClose = () => {
    setAlertDialogIsOpen(!alertDialogIsOpen);
  };

  // Note: Can consider removing this, handleError is used only in the presence of network failure
  // Purpose: Error-handling. If any API fails, prompt user to re-run function.
  const handleError = () => {
    setIsError(false);
    if (functionToCallAgain === 'leftBtnFn') {
      setFunctionToCallAgain(null);
      leftBtnFn();
    }
    if (functionToCallAgain === 'handleAddRejectComment') {
      setFunctionToCallAgain(null);
      handleAddRejectComment();
    }
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
              {isError ? (
                <ErrorRetryApiCard handleError={handleError} />
              ) : (
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
                          Platform.OS === 'ios'
                            ? 'Helvetica'
                            : typography.android
                        }
                        fontWeight="hairline"
                        fontSize="md"
                      >
                        {message}
                      </Text>
                    </Box>
                  </ScrollView>
                </VStack>
              )}
            </Box>
          </TouchableWithoutFeedback>

          <AlertDialog
            leastDestructiveRef={cancelRef}
            isOpen={alertDialogIsOpen}
            onClose={onClose}
            bottom="10%"
          >
            <AlertDialog.Content>
              <AlertDialog.CloseButton />
              <AlertDialog.Header>Add Reason For Rejection</AlertDialog.Header>
              <AlertDialog.Body>
                <FormControl isInvalid={isInvalidErrorMessage}>
                  <FormControl.Label
                    _text={{
                      fontSize: 'md',
                      fontWeight: 'medium',
                    }}
                  >
                    Reasons
                  </FormControl.Label>
                  <TextArea
                    aria-label="t1Disabled"
                    numberOfLines={6}
                    onChangeText={(text) => setReasonTextAreaValue(text)}
                  />
                  <FormControl.ErrorMessage>
                    Please include a reason with minimum length of 5 characters.
                  </FormControl.ErrorMessage>
                </FormControl>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  bg={colors.pink}
                  onPress={handleAddRejectComment}
                  size="md"
                  w="30%"
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
