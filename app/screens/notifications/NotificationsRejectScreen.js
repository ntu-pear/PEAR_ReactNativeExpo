import notificationApi from 'app/api/notification';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import NotificationCard from 'app/components/NotificationCard';
import { FlatList, VStack } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import NotificationActions from 'app/config/notificationActions';

const defaultPaginationLimit = 20;
const paginationStartingParam = {
  offset: 0,
  limit: defaultPaginationLimit,
};
function NotificationsRejectScreen(props) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationRejectedData, setNotificationRejectedData] = useState([]);
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const paginationParams = useRef({ ...paginationStartingParam });
  // const [notificationRejectedData, setNotificationRejectedData] = useState([
  //   {
  //     requiresAction: false,
  //     actions: ['clear', 'deliver'],
  //     notificationID: 2,
  //     logID: 3621,
  //     message: 'FYI: Adeline has updated information for patient Alice:\n\n',
  //     initiatorUID: 'B22698B8-42A2-4115-9631-1C2D1E2AC5F2',
  //     type: 'StandardNotification',
  //     recipientKey: 'supervisorInCharge',
  //     recipientUIDs: null,
  //   },
  // ]);

  useEffect(() => {
    // Note: `true` refers to readStatus = `true`
    getAllNotificationRejectedData(true);
  }, []);

  const handlePullToRefresh = async () => {
    // TODO: Uncomment this when api is up
    setNotificationRejectedData([]);
    setIsRefreshing(true);
    paginationParams.current = { ...paginationStartingParam };
    // Note: `true` refers to readStatus = `true`
    await getAllNotificationRejectedData(true);
    setIsRefreshing(false);
  };
  // Purpose: Get all notification items that has been `rejected`.
  const getAllNotificationRejectedData = async (readStatus) => {
    const { offset, limit } = paginationParams.current;
    if (offset === -1) {
      return;
    }
    setIsLoading(true);
    const response = await notificationApi.getNotificationOfUser(
      readStatus,
      offset,
      limit,
    );
    if (!response.ok) {
      setIsLoading(false);
      setIsError(true);
      return;
    }
    const filteredNotificationItemsWithRejectAction =
      response?.data.results.filter(
        (notification) => notification.status === NotificationActions.Reject,
      );
    paginationParams.current.offset = response.data.next_offset;
    paginationParams.current.limit =
      response.data.next_limit === -1 ? null : response.data.next_limit;
    setIsLoading(false);
    setNotificationRejectedData(filteredNotificationItemsWithRejectAction);
  };

  const handleErrorWhenApiFails = () => {
    setIsError(false);
    // Note: `true` refers to readStatus = `true`
    getAllNotificationRejectedData(true);
  };

  const getMoreNotifications = async () => {
    setIsFetchingMoreNotifications(true);
    await getAllNotificationRejectedData(false);
    setIsFetchingMoreNotifications(false);
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
              data={notificationRejectedData}
              keyExtractor={(item) => item.notificationID}
              onEndReached={getMoreNotifications}
              onRefresh={handlePullToRefresh}
              refreshing={isRefreshing}
              renderItem={({ item }) => (
                <NotificationCard item={item} user={user} readStatus={true} />
              )}
            />
          </VStack>
        </VStack>
      )}
    </>
  );
}

export default NotificationsRejectScreen;