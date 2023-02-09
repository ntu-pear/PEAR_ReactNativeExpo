import React, { useState, useEffect, useContext, useRef } from 'react';
import { FlatList, VStack } from 'native-base';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import NotificationCard from 'app/components/NotificationCard';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import notificationApi from 'app/api/notification';

const defaultPaginationLimit = 20;
const paginationStartingParam = {
  offset: 0,
  limit: defaultPaginationLimit,
};
function NotificationsReadScreen(props) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationReadData, setNotificationReadData] = useState([]);
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const paginationParams = useRef({ ...paginationStartingParam });
  // const [notificationReadData, setNotificationReadData] = useState([
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
    //  Get all `read` notification of user
    // Note: `true` refers to readStatus = true
    getAllNotificationReadData(true);
  }, []);

  const handlePullToRefresh = async () => {
    //  Get all `read` notification of user
    setNotificationReadData([]);
    setIsRefreshing(true);
    paginationParams.current = { ...paginationStartingParam };
    // Note: `true` refers to readStatus = true
    await getAllNotificationReadData(true);
    setIsRefreshing(false);
  };

  const getAllNotificationReadData = async (readStatus) => {
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
    setIsLoading(false);
    if (!response.ok) {
      // return error block
      setIsError(true);
      return;
    }
    paginationParams.current.offset = response.data.next_offset;
    paginationParams.current.limit =
      response.data.next_limit === -1 ? null : response.data.next_limit;
    setNotificationReadData((data) => data.concat(response.data.results));
  };

  const handleErrorWhenApiFails = () => {
    //  Get all `read` notification of user;
    //  Note: `true` refers to readStatus = true
    getAllNotificationReadData(true);
  };

  const getMoreNotifications = async () => {
    setIsFetchingMoreNotifications(true);
    await getAllNotificationReadData(false);
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
              data={notificationReadData}
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

export default NotificationsReadScreen;
