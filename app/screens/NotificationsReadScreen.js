import React, { useState, useEffect, useContext } from 'react';
import { FlatList, VStack } from 'native-base';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import NotificationCard from 'app/components/NotificationCard';
import ErrorRetryApiCard from 'app/components/ErrorRetryApiCard';
import notificationApi from 'app/api/notification';

function NotificationsReadScreen(props) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationReadData, setNotificationReadData] = useState([
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
    //  Get all `read` notification of user
    // Note: `true` refers to readStatus = true
    getAllNotificationReadData(true);
  }, []);

  const handlePullToRefresh = async () => {
    //  Get all `read` notification of user
    setIsRefreshing(true);
    // Note: `true` refers to readStatus = true
    await getAllNotificationReadData(true);
    setIsRefreshing(false);
  };

  const getAllNotificationReadData = async (readStatus) => {
    setIsLoading(true);
    const response = await notificationApi.getNotificationOfUser(readStatus);
    if (!response.ok) {
      // return error block
      setIsLoading(false);
      setIsError(true);
      return;
    }
    setIsLoading(false);
    setNotificationReadData(response.data);
  };

  const handleErrorWhenApiFails = () => {
    //  Get all `read` notification of user;
    //  Note: `true` refers to readStatus = true
    getAllNotificationReadData(true);
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
