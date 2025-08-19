import React, { useState, useEffect, useContext, useRef } from 'react';
import { FlatList, VStack } from 'native-base';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import NotificationCard from 'app/components/NotificationCard';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import useNotifications from 'app/screens/notifications/useNotifications';
import NotificationSortSelector from 'app/screens/notifications/NotificationsSortSelector';
// Resolve the tab bar cutting off issue
import { View } from 'react-native';
import globalStyles from 'app/utility/styles.js';

function NotificationsReadScreen(props) {
  const { notificationType } = props.route.params;
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationReadData, setNotificationReadData] = useState([]);
  const [isFetchingMoreNotifications, setIsFetchingMoreNotifications] =
    useState(false);
  const paginationParams = useRef({});
  const [sortBy, setSortBy] = useState('');
  const { handlePullToRefresh, getMoreNotifications } = useNotifications(
    notificationType,
    setIsError,
    setIsLoading,
    setNotificationReadData,
    setIsFetchingMoreNotifications,
  );

  useEffect(() => {
    //  Get all `read` notification of user
    // Note: `true` refers to readStatus = true
    handlePullToRefresh(paginationParams, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  return (
    <View style={globalStyles.mainContentContainer}>
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
              {notificationReadData.length > 0 && (
                <NotificationSortSelector
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              )}
              <FlatList
                showsVerticalScrollIndicator={false}
                data={notificationReadData}
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
    </View>
  );
}

export default NotificationsReadScreen;
