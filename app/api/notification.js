/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 * Note: User Service v1 OpenAPI (staging) does not currently expose Notification routes
 * (web Navbar still uses local mock data). Keep legacy paths; fail visibly when missing.
 */
const endPoint = '/Notification';
const notificationUser = `${endPoint}/User`;
const notificationAction = `${endPoint}/Action`;

const Actions = {
  Approve: 'approve',
  Reject: 'reject',
  Clear: 'clear',
  Endorse: 'endorse',
};

const normalizeNotification = (item = {}) => ({
  notificationID:
    item.notificationID ??
    item.notificationId ??
    item.notification_id ??
    item.id ??
    null,
  message: item.message ?? item.content ?? item.body ?? '',
  status: item.status ?? item.action ?? item.notificationStatus ?? null,
  readStatus:
    item.readStatus ??
    item.read_status ??
    item.isRead ??
    item.is_read ??
    false,
  requiresAction: Boolean(
    item.requiresAction ?? item.requires_action ?? item.actionRequired,
  ),
  senderName: item.senderName ?? item.sender_name ?? item.from ?? '',
  senderPicUrl: item.senderPicUrl ?? item.sender_pic_url ?? item.senderPic ?? '',
  createdDate:
    item.createdDate ?? item.created_date ?? item.createdAt ?? item.created_at ?? '',
  ...item,
});

const toMobileListResponse = (res) => {
  const body = res?.data ?? {};
  const nested = body.data ?? body;
  const raw = Array.isArray(nested?.results)
    ? nested.results
    : Array.isArray(nested)
      ? nested
      : Array.isArray(body.results)
        ? body.results
        : Array.isArray(body)
          ? body
          : [];

  const results = raw.map(normalizeNotification);
  return {
    ...res,
    data: {
      ...body,
      data: {
        ...(typeof nested === 'object' && !Array.isArray(nested) ? nested : {}),
        results,
      },
      next_offset: body.next_offset ?? nested.next_offset ?? -1,
      next_limit: body.next_limit ?? nested.next_limit ?? -1,
    },
  };
};

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// Purpose: Get all notifications of user (specified by userID in JWT token)
// based on specified read status
// 1 Parameter: (1) readStatus: Boolean [optional]
const getNotificationOfUser = async (
  readStatus = null,
  offset = null,
  limit = null,
  sortBy = '',
) => {
  const params = {
    offset,
    limit,
  };
  if (readStatus != null) {
    params.readStatus = readStatus;
  }
  if (sortBy) {
    params.sortBy = sortBy;
  }
  const res = await client.get(notificationUser, params);
  return toMobileListResponse(res);
};

// **********************  POST REQUESTS *************************

// **********************  PUT REQUESTS *************************

// Purpose: Take an action on a notification
// 3 Parameters: (1) notificationID (2) action -- approve, reject, clear, endorse
// (3) comment [optional]
const setNotificationAction = async (notificationID, action, comment) => {
  // [Guard] check if notificationID is specified
  if (notificationID == null) {
    return {
      ok: false,
      ErrorMessage: 'Improper notificationID parameter',
    };
  }

  // [Guard] check if actions are specified correctly
  if (
    action !== Actions.Approve &&
    action !== Actions.Reject &&
    action !== Actions.Clear &&
    action !== Actions.Endorse
  ) {
    return {
      ok: false,
      ErrorMessage: 'Improper action parameter',
    };
  }

  // Manage params with checks on whether comment is specified, since it's optional
  const params =
    comment == null
      ? {
          notificationID,
          action,
        }
      : {
          notificationID,
          action,
          comment,
        };

  // Reference: Including params in `.put`
  // https://github.com/infinitered/apisauce/issues/191
  return client.put(notificationAction, {}, { params });
};

/*
 * Expose your end points here
 */
export default {
  getNotificationOfUser,
  setNotificationAction,
  normalizeNotification,
  Actions,
};
