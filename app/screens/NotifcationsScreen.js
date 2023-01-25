import React, { useState, useEffect, useContext } from 'react';
import { Platform, SafeAreaView, View } from 'react-native';
import { Text, FlatList, VStack, DeleteIcon, Box } from 'native-base';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthContext from 'app/auth/context';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import NotificationCard from 'app/components/NotificationCard';
import notificationApi from 'app/api/notification';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import routes from 'app/navigation/routes';

function NotifcationsScreen(props) {
  const { navigation } = props;
  const { user } = useContext(AuthContext);
  const { acceptRejectNotifID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // used to manage flatlist
  const [selectedId, setSelectedId] = useState(null);
  // used to manage flatlist
  const [requiresAction, setRequiresAction] = useState(false);

  /*
   * Mock Data to populate flat list
   */
  const [notificationData, setNotificationData] = useState([
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 15,
      logID: 3637,
      shortMessage: 'Adeline1 has requested for approval',
      message:
        'Adeline has requested to update Nric: S1231234F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:09.4266658',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 14,
      logID: 3638,
      shortMessage: 'Adeline2 has requested for approval',
      message:
        'Adeline has requested to update Nric: S1231233F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:17.7333058',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 13,
      logID: 3639,
      shortMessage: 'Adeline3 has requested for approval',
      message:
        'Adeline has requested to update Nric: S1231231F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:22.8725344',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver'],
      notificationID: 11,
      logID: 3641,
      shortMessage: 'Adeline4 has requested for approval',
      message: 'FYI: Adeline has updated information for patient Alice.',
      type: 'StandardNotification',
      createdDateTime: '2022-08-12T10:49:59.6130118',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 7,
      logID: 3637,
      shortMessage: 'FYI: James1 has accepted this request',
      message:
        'Adeline has requested to update Nric: S1231234F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:09.4266658',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 8,
      logID: 3637,
      shortMessage: 'FYI: James2 has accepted this request',
      message:
        'Adeline has requested to update Nric: S1231234F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:09.4266658',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 9,
      logID: 3637,
      shortMessage: 'FYI: James3 has accepted this request.',
      message:
        'Adeline has requested to update Nric: S1231234F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:09.4266658',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 10,
      logID: 3637,
      shortMessage: 'FYI: James4 has accepted this request.',
      message:
        'Adeline has requested to update Nric: S1231234F, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2022-08-12T10:41:09.4266658',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
    },
  ]);

  useEffect(() => {
    // Fetches data from notification api (Once)
    // Note: `false` refers readStatus = `false`
    getAllNotificationOfUser(false);
    // If selecteID from NotificationCard === the Accepted/Rejected notification ID
    // from NotificationApprovalRequestScreen, then proceed to update flatList
    selectedId === acceptRejectNotifID ? filterAndRerender() : null; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptRejectNotifID]);

  const navigateToNotificationsApprovalRequestScreen = (item) => {
    navigation.navigate(routes.NOTIFICATION_APPROVAL_REQUEST, item);
  };

  const getAllNotificationOfUser = async (readStatus) => {
    setIsLoading(true);
    // Get all `unread` notification of user
    const response = await notificationApi.getNotificationOfUser(readStatus);
    console.log(response);
    if (!response.ok) {
      // return error block
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
  };

  // Purpose: When api fails, perform another fetch
  const handleErrorWhenApiFails = async () => {
    // Note: `false` refers to readStatus = `false`
    await getAllNotificationOfUser(false);
  };

  // Purpose: pull to refresh for flat list
  // Reference: https://thewebdev.info/2022/02/19///how-to-implement-pull-to-refresh-flatlist-with-react-native/
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    // Note: `false` refers to readStatus = `false`
    await getAllNotificationOfUser(false);
    setIsRefreshing(false);
  };

  /*  *** React Native Hande Gesture ***
   *
   * Reference(s):
   * (1) https://docs.swmansion.com/react-native-gesture-handler/docs/quickstart/quickstart
   * (2) https://blog.logrocket.com/react-native-gesture-handler-swipe-long-press-and-more/
   * (3) https://reactnative-examples.com/remove-selected-item-from-flatlist-in-react-native/
   */

  /*
   *   *** Renders view when swiped to left ***
   */
  const leftSwipeActions = () => (
    <>
      {requiresAction ? (
        <VStack w="5%" />
      ) : (
        <VStack
          w="40%"
          backgroundColor={colors.pink_lighter}
          justifyContent="center"
        >
          <DeleteIcon color={colors.white} size="2xl" alignSelf="center" />
          <Text
            alignSelf="center"
            bold
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            color={colors.white}
          >
            Clear
          </Text>
        </VStack>
      )}
    </>
  );

  /*
   *   *** Renders view when swiped to right ***
   */
  const rightSwipeActions = () => <VStack w="5%" />;

  /*
   *   *** Peforms action when Left boundary is opened ***
   */
  const swipeFromLeftOpen = async () => {
    // If action is required, do not allow allow filterAndRerender
    if (requiresAction) {
      return;
    }
    filterAndRerender();
    // (1) API Call to set current Notification ID as `read`, and type of action
    await notificationApi.setNotificationAction(selectedId, 'clear');
  };

  /*
   *   *** Peforms action when Right boundary is opened ***
   */
  const swipeFromRightOpen = () => {
    // requiresAction ? filterAndRerender() : null;
    null;
    // TODO: Call Accept Notification API
  };

  const filterAndRerender = () => {
    // Filter Data
    const filteredData = notificationData.filter(
      (item) => item.notificationID !== selectedId,
    );
    // Update Notification Data with the newly filtered data; to re-render flat list.
    setNotificationData(filteredData);
  };
  const fetchNextPage = () => {
    console.log('fetch more data');
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <VStack w="100%" h="100%" alignItems="center">
          {isError && (
            <ErrorRetryApiCard handleError={handleErrorWhenApiFails} />
          )}
          <VStack w="90%">
            <FlatList
              showsVerticalScrollIndicator={false}
              // onViewableItemsChanged={onViewableItemsChanged}
              data={notificationData}
              extraData={selectedId}
              keyExtractor={(item) => item.notificationID}
              onEndReached={fetchNextPage}
              onRefresh={handlePullToRefresh}
              refreshing={isRefreshing}
              renderItem={({ item }) => (
                /*
                 * Issue resolved -- cannot swipe on Android. Soln: Wrap with <GestureHandlerRootView>
                 * Ref: https://stackoverflow.com/questions/70545275/react-native-swipeable-gesture-not-working-on-android
                 */
                <GestureHandlerRootView>
                  <Swipeable
                    renderLeftActions={leftSwipeActions}
                    renderRightActions={rightSwipeActions}
                    onSwipeableLeftWillOpen={swipeFromLeftOpen}
                    onSwipeableRightWillOpen={swipeFromRightOpen}
                  >
                    <NotificationCard
                      item={item}
                      user={user}
                      setSelectedId={setSelectedId}
                      setRequiresAction={setRequiresAction}
                      readStatus={false}
                      navigateToNotificationsApprovalRequestScreen={
                        navigateToNotificationsApprovalRequestScreen
                      }
                    />
                  </Swipeable>
                </GestureHandlerRootView>
              )}
            />
          </VStack>
        </VStack>
      )}
    </>
  );
}

export default NotifcationsScreen;
