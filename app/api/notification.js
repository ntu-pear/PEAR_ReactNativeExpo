import client from "./client";

/*
 * List all end points here
 */
const endPoint = "/Notification";
const notificationUser = endPoint + "/User";
const notificationRead = endPoint + "/Read";
const notificationReadAll = endPoint + "/ReadAll";

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// Purpose: Get all notifications of user (specified by userID in JWT token)
// based on specified read status
const getNotificationOfUser = () => {
  return client.get(notificationUser);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getNotificationOfUser,
};
