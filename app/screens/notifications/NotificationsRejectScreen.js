import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import NotificationCard from 'app/components/NotificationCard';
import { FlatList, VStack } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useNotifications from 'app/screens/notifications/useNotifications';
import NotificationSortSelector from 'app/screens/notifications/NotificationsSortSelector';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationContext } from 'app/screens/notifications/NotificationContext';

function NotificationsRejectScreen(props) {
  const { notificationType } = props.route.params;
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationRejectedData, setNotificationRejectedData] = useState([]);
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const paginationParams = useRef({});
  const [sortBy, setSortBy] = useState('');
  const { getNotifications, handlePullToRefresh, getMoreNotifications } =
    useNotifications(
      notificationType,
      setIsError,
      setIsLoading,
      setNotificationRejectedData,
      setIsFetchingMoreNotifications,
    );
  const notificationContext = useNotificationContext();
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
    // Purpose: Get all notification items that has been `rejected`.
    handlePullToRefresh(paginationParams, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(() => {
    if (notificationContext.shouldRefetchRejectNotifications) {
      (async () => {
        await handlePullToRefresh(paginationParams, sortBy);
      })();
      notificationContext.shouldRefetchAcceptNotifications = false;
    }
  });

  const handleErrorWhenApiFails = () => {
    setIsError(false);
    // Note: `true` refers to readStatus = `true`
    getNotifications(paginationParams, sortBy);
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
            {notificationRejectedData.length > 0 && (
              <NotificationSortSelector sortBy={sortBy} setSortBy={setSortBy} />
            )}
            <FlatList
              showsVerticalScrollIndicator={false}
              data={notificationRejectedData}
              keyExtractor={(item) => item.notificationID}
              onEndReached={async () =>
                await getMoreNotifications(paginationParams, sortBy)
              }
              onRefresh={async () =>
                await handlePullToRefresh(paginationParams, sortBy)
              }
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
