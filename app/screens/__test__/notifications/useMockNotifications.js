import notificationActions from 'app/config/notificationActions';
import NotificationType from 'app/screens/notifications/NotificationType';

const data = {
  next_limit: 20,
  next_offset: 20,
  results: [
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 53,
      logID: 4620,
      message:
        'Adeline has requested to update Nric: S6948276H,  for patient Ellie',
      shortMessage: 'Adeline has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:32.9786367',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 52,
      logID: 4618,
      message:
        'Adeline has requested to update Nric: S0948286H,  for patient Ellie',
      shortMessage: 'Adeline has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:26.2607374',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 50,
      logID: 4614,
      message:
        'Adeline has requested to update Nric: S0948776H,  for patient Ellie',
      shortMessage: 'Adeline has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:14.6565569',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 49,
      logID: 4612,
      message:
        'Adeline has requested to update Nric: S0448276H,  for patient Ellie',
      shortMessage: 'Adeline has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:08.1695088',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 48,
      logID: 4609,
      message:
        'Adeline has requested to update Nric: S8866443F,  for patient Bi',
      shortMessage: 'Adeline has requested to update Nric, for patient Bi',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:21:55.9802423',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 47,
      logID: 4607,
      message:
        'Adeline has requested to update Nric: S7876443F,  for patient Bi',
      shortMessage: 'Adeline has requested to update Nric, for patient Bi',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:21:49.6816632',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 46,
      logID: 4605,
      message:
        'Adeline has requested to update Nric: S7866444F,  for patient Bi',
      shortMessage: 'Adeline has requested to update Nric, for patient Bi',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:21:43.2749926',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 44,
      logID: 4229,
      message: 'FYI: Jessica has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:44:27.7207337',
      senderName: 'Jessica Sim',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1679139494/User/Jessica_Sim_Sxxxx781F/ProfilePicture/rqcyrl00gnkxznny2hyp.png',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 43,
      logID: 4227,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:44:16.6231289',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 42,
      logID: 4225,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:44:01.5781728',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 40,
      logID: 4221,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:38.7647656',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 39,
      logID: 4219,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:31.8696082',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 38,
      logID: 4217,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:22.3630026',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 37,
      logID: 4214,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:14.634036',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 36,
      logID: 4213,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:10.0289859',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 35,
      logID: 4211,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:42:46.1034538',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 34,
      logID: 4209,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:42:27.9443561',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 32,
      logID: 4206,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:42:15.9593167',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 33,
      logID: 4205,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:42:14.3010262',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 31,
      logID: 4204,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:42:10.3634353',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
  ],
};

const defaultPaginationLimit = 20;
const paginationStartingParam = {
  offset: 0,
  limit: defaultPaginationLimit,
};
export default function useMockNotifications(
  notificationType,
  setIsError,
  setIsLoading,
  setNotificationData,
  setIsFetchingMoreNotifications,
) {
  const refetchLimit = 2;
  let refetchCount = 0;
  // mock get notifications => mock limit = 60
  const getNotifications = async (paginationParams, sortBy) => {
    // Get all `unread` notification of user
    const { offset, limit } = paginationParams.current;
    if (offset === -1) {
      return;
    }
    refetchCount += 1;

    let results = data.results;
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
    paginationParams.current.offset =
      refetchCount === refetchLimit
        ? -1
        : paginationParams.current.offset + limit;
    paginationParams.current.limit =
      refetchCount === refetchLimit ? null : data.next_limit;
    setNotificationData((prvData) => prvData.concat(results));
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

  const getMoreNotifications = async (paginationParams, sortBy) => {
    setIsFetchingMoreNotifications(true);
    await getNotifications(paginationParams, sortBy);
    setIsFetchingMoreNotifications(false);
  };

  return {
    handlePullToRefresh,
    getNotifications,
    getMoreNotifications,
  };
}
