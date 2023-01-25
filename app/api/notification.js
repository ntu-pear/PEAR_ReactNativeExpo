/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endPoint = '/Notification';
const notificationUser = `${endPoint}/User`;
const notificationReadAll = `${endPoint}/ReadAll`; //eslint-disable-line no-unused-vars
const notificationAction = `${endPoint}/Action`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// Purpose: Get all notifications of user (specified by userID in JWT token)
// based on specified read status
// 1 Parameter: (1) readStatus: Boolean [optional]
const getNotificationOfUser = async (
  readStatus,
  start = null,
  limit = null,
) => {
  if (readStatus == null) {
    return client.get(notificationUser);
  }
  const params = {
    readStatus,
    start,
    limit,
  };
  return client.get(notificationUser, params);
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

  // Enums for actions
  const Actions = {
    Approve: 'approve',
    Reject: 'reject',
    Clear: 'clear',
    Endorse: 'endorse',
  };

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
  var params;

  if (comment == null) {
    params = {
      notificationID,
      action,
    };
    return client.put(notificationAction, {}, { params: params });
  }

  params = {
    notificationID,
    action,
    comment,
  };

  // Reference: Including params in `.put`
  // https://github.com/infinitered/apisauce/issues/191
  // [Note] params == params:params; AKA shorthand object notation, refer to this https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
  return client.put(notificationAction, {}, { params });
};

/*
 * Expose your end points here
 */
export default {
  getNotificationOfUser,
  setNotificationAction,
};
