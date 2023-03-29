import React, { useState, useEffect, useContext, useRef } from 'react';
import { Platform, View } from 'react-native';
import {
  Text,
  FlatList,
  VStack,
  DeleteIcon,
  Spinner,
  Heading,
  HStack,
} from 'native-base';
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
import useNotifications from 'app/screens/notifications/useNotifications';
import NotificationSortSelector from 'app/screens/notifications/NotificationsSortSelector';

function NotificationsScreen(props) {
  const { notificationType } = props.route.params;
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
  const [notificationData, setNotificationData] = useState([]);
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const paginationParams = useRef({});
  const [sortBy, setSortBy] = useState('');
  const { handlePullToRefresh, getMoreNotifications } = useNotifications(
    notificationType,
    setIsError,
    setIsLoading,
    setNotificationData,
    setIsFetchingMoreNotifications,
  );
  useEffect(() => {
    // Fetches data from notification api (Once)
    // Note: `false` refers readStatus = `false`
    (async () => {
      handlePullToRefresh(paginationParams, sortBy);
    })();
    // from NotificationApprovalRequestScreen, then proceed to update flatList
    setIsLoading(true);
    selectedId === acceptRejectNotifID ? filterAndRerender() : null;
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptRejectNotifID, sortBy]);
  const navigateToNotificationsApprovalRequestScreen = (item) => {
    navigation.navigate(routes.NOTIFICATION_APPROVAL_REQUEST, item);
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
  // console.log(notificationData);
  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible={true} />
      ) : (
        <VStack w="100%" h="100%" alignItems="center">
          {isError && (
            <ErrorRetryApiCard
              handleError={async () =>
                await handlePullToRefresh(paginationParams, sortBy)
              }
            />
          )}
          <VStack w="90%">
            <>
              {notificationData.length > 0 && (
                <NotificationSortSelector
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              )}
              <FlatList
                showsVerticalScrollIndicator={false}
                // onViewableItemsChanged={onViewableItemsChanged}
                data={notificationData}
                extraData={selectedId}
                keyExtractor={(item) => item?.notificationID}
                ListFooterComponent={
                  isFetchingMoreNotifications && (
                    <HStack mx="auto" space={2} justifyContent="center">
                      <Spinner accessibilityLabel="Loading posts" size="lg" />
                      <Heading color="red" fontSize="md">
                        Loading
                      </Heading>
                    </HStack>
                  )
                }
                onEndReached={async () =>
                  getMoreNotifications(paginationParams, sortBy)
                }
                onRefresh={async () =>
                  handlePullToRefresh(paginationParams, sortBy)
                }
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
            </>
          </VStack>
        </VStack>
      )}
    </>
  );
}

export default NotificationsScreen;
