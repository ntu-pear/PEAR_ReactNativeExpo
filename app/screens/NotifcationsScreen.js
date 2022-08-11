import React, { useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { Text, FlatList, VStack, CheckIcon, CloseIcon } from 'native-base';
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

  /*
   * Mock Data to populate flat list
   */
  const [notificationData, setNotificationData] = useState([
    {
      notificationID: 446,
      title: 'Approval request (Delete LikeDislike)',
      createdDateTime: '2022-05-08T20:16:29.8150851',
      logID: 3535,
      approvalRequestID: 437,
      receiverUserID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      message:
        'Caregiver Adeline Tan has requested to delete a LikeDislike item for Patient Alice Lee.',
      readStatus: false,
    },
    {
      notificationID: 445,
      title: 'Approval request (Update LikeDislike)',
      createdDateTime: '2022-05-08T20:16:10.9527239',
      logID: 3534,
      approvalRequestID: 436,
      receiverUserID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      message:
        'Caregiver Adeline Tan has requested to update a LikeDislike item.',
      readStatus: false,
    },
    {
      notificationID: 444,
      title: 'Approval request (Add LikeDislike)',
      createdDateTime: '2022-05-08T20:15:50.3813064',
      logID: 3533,
      approvalRequestID: 435,
      receiverUserID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F4',
      message:
        'Caregiver Adeline Tan has requested to add a LikeDislike item for Patient Alice Lee.',
      readStatus: false,
    },
  ]);

  useEffect(() => {
    // Fetches data from notification api
    getAllNotificationOfUser();
  }, []);

  const getAllNotificationOfUser = async () => {
    setIsLoading(true);
    const response = await notificationApi.getNotificationOfUser();
    if (!response.ok) {
      // return error block
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
    // Filters for data only with readStatus === true
    const filteredData = response.data.filter(
      (item) => item.readStatus === false,
    );
    setNotificationData(filteredData);
  };

  // Purpose: When api fails, perform another fetch
  const handleErrorWhenApiFails = async () => {
    await getAllNotificationOfUser();
  };

  // Purpose: pull to refresh for flat list
  // Reference: https://thewebdev.info/2022/02/19///how-to-implement-pull-to-refresh-flatlist-with-react-native/
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    await getAllNotificationOfUser();
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
    <VStack
      w="40%"
      backgroundColor={colors.pink_lighter}
      justifyContent="center"
    >
      <CloseIcon color={colors.white} size="2xl" alignSelf="center" />
      <Text
        alignSelf="center"
        bold
        fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        color={colors.white}
      >
        Reject
      </Text>
    </VStack>
  );

  /*
   *   *** Renders view when swiped to right ***
   */
  const rightSwipeActions = () => (
    <VStack
      w="40%"
      backgroundColor={colors.green_lighter}
      justifyContent="center"
    >
      <CheckIcon color={colors.white} size="2xl" alignSelf="center" />
      <Text
        alignSelf="center"
        bold
        fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        color={colors.white}
      >
        Accept
      </Text>
    </VStack>
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
    filterAndRerender();
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
