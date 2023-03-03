import notificationApi from 'app/api/notification';
import notificationActions from 'app/config/notificationActions';
import NotificationType from 'app/screens/notifications/NotificationType';

const defaultPaginationLimit = 20;
const paginationStartingParam = {
  offset: 0,
  limit: defaultPaginationLimit,
};
export default function useNotifications(
  notificationType,
  setIsError,
  setIsLoading,
  setNotificationData,
) {
  const renderItem = () => {};

  const getNotifications = async (paginationParams, sortBy) => {
    // Get all `unread` notification of user
    const { offset, limit } = paginationParams.current;
    if (offset == -1) {
      return;
    }
    const readStatus = ((notificationType) => {
      switch (notificationType) {
        case NotificationType.Unread:
          return false;
        default:
          return true;
      }
    })(notificationType);

    const response = await notificationApi.getNotificationOfUser(
      readStatus,
      offset,
      limit,
      sortBy,
    );

    // console.log(
    // response.data.results.map(({ notificationID }) => notificationID),
    // );
    if (!response.ok) {
      // return error block
      setIsError(true);
      return;
    }
    let results = response?.data?.results ?? [];
    results = (() => {
      switch (notificationType) {
        case NotificationType.Accept:
          return results.filter(
            ({ status }) => status === notificationActions.Approve,
          );
        case NotificationType.Reject:
          return results.filter(
            (notification) =>
              notification.status === notificationActions.Reject,
          );
        default:
          return results;
      }
    })();

    paginationParams.current.offset = response.data.next_offset;
    paginationParams.current.limit =
      response.data.next_limit == -1 ? null : response.data.next_limit;
    setNotificationData((data) => data.concat(results));
  };

  // Purpose: pull to refresh for flat list
  // Reference: https://thewebdev.info/2022/02/19///how-to-implement-pull-to-refresh-flatlist-with-react-native/
  const handlePullToRefresh = async (paginationParams, sortBy = '') => {
    // Note: `false` refers to readStatus = `false`
    setNotificationData([]);
    setIsLoading(true);
    paginationParams.current = { ...paginationStartingParam };
    await getNotifications(paginationParams, sortBy);
    setIsLoading(false);
  };

  return {
    handlePullToRefresh,
    getNotifications,
    renderItem,
  };
}
