import React, { useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import {
  Text,
  FlatList,
  VStack,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
} from 'native-base';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthContext from '../auth/context';
import colors from '../config/colors';
import typography from '../config/typography';
import NotificationCard from '../components/NotificationCard';
import notificationApi from '../api/notification';
import ActivityIndicator from '../components/ActivityIndicator';
import ErrorRetryApiCard from '../components/ErrorRetryApiCard';

function NotifcationsScreen(props) {
  const { user } = useContext(AuthContext);
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
      responseNotifications: {
        approve: {
          requiresAction: false,
          actions: ['clear', 'deliver'],
          notificationID: 0,
          logID: 0,
          message:
            'Your request to update patient information of patient Alice has been approved',
          initiatorUID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
          type: 'StandardNotification',
          recipientKey: 'initialRequestor',
          recipientUIDs: ['B22698B8-42A2-4115-9631-1C2D1E2AC5F2'],
        },
        reject: {
          requiresAction: false,
          actions: ['clear', 'deliver'],
          notificationID: 0,
          logID: 0,
          message:
            'Your request to update patient information of patient Alice has been approved',
          initiatorUID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
          type: 'StandardNotification',
          recipientKey: 'initialRequestor',
          recipientUIDs: ['B22698B8-42A2-4115-9631-1C2D1E2AC5F2'],
        },
      },
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 1,
      logID: 3620,
      message:
        'Adeline has requested to update \nNric: S1234560D\n\n for patient Alice',
      initiatorUID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
      type: 'ApprovalRequestNotification',
      recipientKey: 'supervisorInCharge',
      recipientUIDs: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 2,
      logID: 3621,
      message: 'FYI: Adeline has updated information for patient Alice:\n\n',
      initiatorUID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
      type: 'StandardNotification',
      recipientKey: 'supervisorInCharge',
      recipientUIDs: null,
    },
  ]);

  useEffect(() => {
    // Fetches data from notification api
    getAllNotificationOfUser(false);
  }, []);

  const getAllNotificationOfUser = async (readStatus) => {
    setIsLoading(true);
    const response = await notificationApi.getNotificationOfUser(readStatus);
    if (!response.ok) {
      // return error block
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
    setNotificationData(response.data);
  };

  // Purpose: When api fails, perform another fetch
  const handleErrorWhenApiFails = async () => {
    await getAllNotificationOfUser(false);
  };

  // Purpose: pull to refresh for flat list
  // Reference: https://thewebdev.info/2022/02/19///how-to-implement-pull-to-refresh-flatlist-with-react-native/
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
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
        <VStack
          w="40%"
          backgroundColor={colors.pink_lighter}
          justifyContent="center"
        >
          <CloseIcon color={colors.white} size="2xl" alignSelf="center" />
          <Text
            alignSelf="center"
            bold
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            color={colors.white}
          >
            Reject
          </Text>
        </VStack>
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
  const rightSwipeActions = () => (
    <>
      {requiresAction ? (
        <VStack
          w="40%"
          backgroundColor={colors.green_lighter}
          justifyContent="center"
        >
          <CheckIcon color={colors.white} size="2xl" alignSelf="center" />
          <Text
            alignSelf="center"
            bold
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            color={colors.white}
          >
            Accept
          </Text>
        </VStack>
      ) : (
        // Don't show anything if no action required
        <VStack w="5%" />
      )}
    </>
  );

  /*
   *   *** Peforms action when Left boundary is opened ***
   */
  const swipeFromLeftOpen = () => {
    filterAndRerender();
    // TODO: Call Reject Notificaiton API
  };

  /*
   *   *** Peforms action when Right boundary is opened ***
   */
  const swipeFromRightOpen = () => {
    requiresAction ? filterAndRerender() : null;
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

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <VStack w="100%" h="100%" alignItems="center">
          {isError && (
            <ErrorRetryApiCard handleError={handleErrorWhenApiFails} />
          )}
          <VStack w="90%">
            <FlatList
              // onViewableItemsChanged={onViewableItemsChanged}
              data={notificationData}
              extraData={selectedId}
              keyExtractor={(item) => item.notificationID}
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
