import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { FlatList, VStack } from 'native-base';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import NotificationCard from 'app/components/NotificationCard';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import useNotifications from 'app/screens/notifications/useNotifications';
import NotificationSortSelector from 'app/screens/notifications/NotificationsSortSelector';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationContext } from 'app/screens/notifications/NotificationContext';

function NotificationsAcceptScreen(props) {
  const { notificationType } = props.route.params;
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const paginationParams = useRef({});
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const [notificationAcceptedData, setNotificationAcceptedData] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const { getNotifications, handlePullToRefresh, getMoreNotifications } =
    useNotifications(
      notificationType,
      setIsError,
      setIsLoading,
      setNotificationAcceptedData,
      setIsFetchingMoreNotifications,
    );
  const { shouldRefetchAcceptNotifications, setRefetchAcceptNotifications } =
    useNotificationContext();
  // const [notificationAcceptedData, setNotificationAcceptedData] = useState([
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
    // Purpose: Get all notification items that has been `approved`.
    handlePullToRefresh(paginationParams, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useFocusEffect(
    useCallback(
      () => {
        if (shouldRefetchAcceptNotifications) {
          (async () => {
            await handlePullToRefresh(paginationParams, sortBy);
          })();
          setRefetchAcceptNotifications(false);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [shouldRefetchAcceptNotifications],
    ),
  );

  const handleErrorWhenApiFails = async () => {
    setIsError(false);
    // Note: `true` refers to readStatus = `true`
    await getNotifications(paginationParams, sortBy);
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
            <>
              {notificationAcceptedData.length > 0 && (
                <NotificationSortSelector
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              )}
              <FlatList
                showsVerticalScrollIndicator={false}
                data={notificationAcceptedData}
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
            </>
          </VStack>
        </VStack>
      )}
    </>
  );
}

export default NotificationsAcceptScreen;
