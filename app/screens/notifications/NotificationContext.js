import { createContext, useContext } from 'react';

const NotificationContext = createContext({
  shouldRefetchAcceptNotifications: false,
  shouldRefetchRejectNotifications: false,
  shouldRefetchReadNotifications: false,
  shouldRefetchNotifications: false,
  setRefetchNotifications: () => {},
  setRefetchReadNotifications: () => {},
  setRefetchAcceptNotifications: () => {},
  setRefetchRejectNotifications: () => {},
});

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};

export default NotificationContext;
