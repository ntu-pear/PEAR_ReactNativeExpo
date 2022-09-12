import notificationApi from 'app/api/notification';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import NotificationCard from 'app/components/NotificationCard';
import { FlatList, VStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

function NotificationsRejectScreen(props) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationRejectedData, setNotificationRejectedData] = useState([
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
    // TODO: Uncomment this when api is up
    // getAllNotificationAcceptedData(true)
  }, []);

  const handlePullToRefresh = () => {
    // TODO: Uncomment this when api is up
    // getAllNotificationAcceptedData(true)
  };
  const getAllNotificationRejectedData = async (readStatus) => {
    setIsLoading(true);
    const response = await notificationApi.getNotificationOfUser(readStatus);
    if (!response.ok) {
      // return error block
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
    setNotificationRejectedData(response.data);
  };

  const handleErrorWhenApiFails = () => {
    // TODO: Uncomment this when api is up
    // getAllNotificationAcceptedData(true)
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
              // onViewableItemsChanged={onViewableItemsChanged}
              data={notificationRejectedData}
              keyExtractor={(item) => item.notificationID}
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
