import notificationActions from 'app/config/notificationActions';
import NotificationType from 'app/screens/notifications/NotificationType';

const defaultPaginationLimit = 20;
const paginationStartingParam = {
  offset: 0,
  limit: defaultPaginationLimit,
};

let data = null;

const init = () => {
  data = [...defaultNotificationData.results];
};

export const useMockNotifications = (
  notificationType,
  setIsError,
  setIsLoading,
  setNotificationData,
  setIsFetchingMoreNotifications,
) => {
  const getNotifications = async (paginationParams, sortBy) => {
    if (data == null) {
      init();
    }
    // Get all `unread` notification of user
    const { offset, limit } = paginationParams.current;
    if (offset === -1) {
      return;
    }
    console.log(paginationParams.current);
    // shift the slicing to after filtering operation!
    let results = [...data];
    console.log(`notification type: ${notificationType}`);
    console.log(
      `${NotificationType.Accept} ${NotificationType.Reject} ${NotificationType.Unread} ${NotificationType.Read}`,
    );
    console.log(`results before filtering: ${results}`);
    results = (() => {
      switch (notificationType) {
        case NotificationType.Accept:
          // console.log('accept');
          return results.filter(
            ({ status }) => status === notificationActions.Approve,
          );
        case NotificationType.Reject:
          // console.log('reject');
          return results.filter(
            (notification) =>
              notification.status === notificationActions.Reject,
          );
        case NotificationType.Unread:
          // console.log('reject');
          return results.filter((notification) => notification.status == null);
        case NotificationType.Read:
          // console.log('reject');
          return results.filter(
            (notification) => notification.status === notificationActions.Clear,
          );
      }
    })();
    // console.log(results.map(({ notificationID }) => notificationID));
    // console.log(`fetching from ${notificationType} screen ${results}`);
    const total_length = results.length;
    results = results.slice(offset, offset + limit);
    console.log(`results after filtering and slicing ${results.length}`);
    paginationParams.current.offset =
      offset + limit >= total_length ? -1 : offset + limit;
    paginationParams.current.limit =
      paginationParams.current.offset === -1 ? -1 : limit;
    console.log(paginationParams.current);
    setNotificationData((prv) => prv.concat(results));
    // console.log(`fetching from ${notificationType} screen done`);
  };

  // Purpose: pull to refresh for flat list
  // Reference: https://thewebdev.info/2022/02/19///how-to-implement-pull-to-refresh-flatlist-with-react-native/
  const handlePullToRefresh = async (paginationParams, sortBy = '') => {
    if (data == null) {
      init();
    }
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
};

export const setMockNotificationAction = (notificationID, action) => {
  data = data.map((item) => {
    if (item.notificationID === notificationID) {
      return {
        ...item,
        requiresAction: false,
        status: action,
      };
    }
    return item;
  });
  return {
    ok: true,
  };
};

export const defaultNotificationData = {
  next_limit: -1,
  next_offset: -1,
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
        'Audrey has requested to update Nric: S0948286H,  for patient Ellie',
      shortMessage: 'Audrey has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:26.2607374',
      senderName: 'Audrey Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 51,
      logID: 4616,
      message:
        'Alice has requested to update Nric: S0948176H,  for patient Ellie',
      shortMessage: 'Alice has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:20.9875217',
      senderName: 'Alice Tan',
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
        'Aaron has requested to update Nric: S0948776H,  for patient Ellie',
      shortMessage: 'Aaron has requested to update Nric, for patient Ellie',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-03-09T15:23:14.6565569',
      senderName: 'Aaron Tan',
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
      requiresAction: true,
      actions: ['clear', 'deliver', 'approve', 'reject'],
      notificationID: 1,
      logID: 4130,
      message:
        'Jessica has requested to update Nric: S1234567D,  for patient Alice',
      shortMessage: 'Jessica has requested to update Nric, for patient Alice',
      type: 'ApprovalRequestNotification',
      createdDateTime: '2023-01-29T04:26:27.0286342',
      senderName: 'Jessica Sim',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1681800423/User/Jessica_Sim_Sxxxx781F/ProfilePicture/n48gqhlxedg6rqaqsqmm.png',
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
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1681800423/User/Jessica_Sim_Sxxxx781F/ProfilePicture/n48gqhlxedg6rqaqsqmm.png',
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
      notificationID: 41,
      logID: 4222,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:43:44.4464341',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: 'clear',
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
      status: 'clear',
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
      status: 'clear',
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
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 30,
      logID: 4202,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:41:26.1989919',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 29,
      logID: 4200,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:41:17.286877',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: 'clear',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 28,
      logID: 4197,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:41:08.0576372',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 27,
      logID: 4196,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:41:05.3076122',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 26,
      logID: 4193,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:52.048406',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 25,
      logID: 4192,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:46.8031406',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 24,
      logID: 4190,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:38.8893781',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 23,
      logID: 4188,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:22.5141888',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 22,
      logID: 4186,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:15.176978',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 21,
      logID: 4183,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:40:01.9461387',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 20,
      logID: 4181,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:38:50.354677',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 19,
      logID: 4179,
      message: 'FYI: Adeline has updated information for patient Bi.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-02-07T05:38:33.3623374',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 5,
      logID: 4137,
      message: 'FYI: Adeline has updated information for patient Alice.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-01-29T04:28:05.0987489',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 4,
      logID: 4135,
      message: 'FYI: Adeline has updated information for patient Alice.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-01-29T04:27:29.0345298',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: null,
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 3,
      logID: 4132,
      message: 'FYI: Adeline has updated information for patient Alice.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-01-29T04:27:11.0141545',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: 'clear',
    },
    {
      requiresAction: false,
      actions: ['clear', 'deliver'],
      notificationID: 2,
      logID: 4133,
      message: 'FYI: Adeline has updated information for patient Alice.',
      shortMessage: null,
      type: 'StandardNotification',
      createdDateTime: '2023-01-29T04:27:07.1602429',
      senderName: 'Adeline Tan',
      senderPicUrl:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg',
      status: 'clear',
    },
  ],
};
