/*eslint eslint-comments/no-unlimited-disable: error */
import client from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/List?type=';
const allergyList = `${endpoint}allergy`;
const allergyReactionList = `${endpoint}allergyreaction`;
const languageList = `${endpoint}language`;
const relationshipList = `${endpoint}relationship`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getAllergyList = async () => {
  return client.get(allergyList);
};
const getAllergyReactionList = async () => {
  return client.get(allergyReactionList);
};
const getLanguageList = async () => {
  return client.get(languageList);
};
const getRelationshipList = async () => {
  return client.get(relationshipList);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getAllergyList,
  getAllergyReactionList,
  getLanguageList,
  getRelationshipList,
};
