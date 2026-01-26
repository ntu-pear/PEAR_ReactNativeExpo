/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';
import authStorage from 'app/auth/authStorage';
import jwt_decode from 'jwt-decode';

/*
 * Helper to use Patient Service v1 base URL
 */
const withPatientV1Base = (cfg = {}) => ({
  baseURL: PATIENT_V1_BASE,
  timeout: 15000,
  ...cfg,
});

/*
 * List all end points here
 */
const endPoint = '/SocialHistory';
const socialHistoryAdd = `${endPoint}/add`; //eslint-disable-line no-unused-vars
const socialHistoryUpdate = `${endPoint}/update`; //eslint-disable-line no-unused-vars
const socialHistoryDelete = `${endPoint}/delete`; //eslint-disable-line no-unused-vars

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Mapper for Patient Service v1 API
const toPatientV1SocialHistoryUpdate = (data = {}) => {
  return {
    isDeleted: data.isDeleted ?? '0',
    patientId: toIntOrNull(data.PatientID), // UI uses PatientID, API expects patientId
    sexuallyActive: toIntOrNull(data.SexuallyActiveDisplay ?? data.SexuallyActive),
    secondHandSmoker: toIntOrNull(data.SecondhandSmokerDisplay ?? data.SecondhandSmoker),
    alcoholUse: toIntOrNull(data.AlcoholUseDisplay ?? data.AlcoholUse),
    caffeineUse: toIntOrNull(data.CaffeineUseDisplay ?? data.CaffeineUse),
    tobaccoUse: toIntOrNull(data.TobaccoUseDisplay ?? data.TobaccoUse),
    drugUse: toIntOrNull(data.DrugUseDisplay ?? data.DrugUse),
    exercise: toIntOrNull(data.ExerciseDisplay ?? data.Exercise),
    dietListId: toIntOrNull(data.DietListId),
    educationListId: toIntOrNull(data.EducationListId),
    liveWithListId: toIntOrNull(data.LiveWithListId),
    occupationListId: toIntOrNull(data.OccupationListId),
    petListId: toIntOrNull(data.PetListId),
    religionListId: toIntOrNull(data.ReligionListId),
    id: toIntOrNull(data.SocialHistoryId ?? data.id),
  };
};

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// params: patientID
// purpose: get the social history of specific patient
const getSocialHistory = (patientID, { require_auth = true } = {}) => {
  const params = {
    patient_id: patientID,
    require_auth,
  };

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API SocialHistory] GET', {
      baseURL: PATIENT_V1_BASE,
      path: endPoint,
      params,
    });
  }

  return client.get(endPoint, params, withPatientV1Base()).then((resp) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[API SocialHistory] GET response', {
        ok: resp?.ok,
        status: resp?.status,
        problem: resp?.problem,
        data: resp?.data,
      });
    }
    return resp;
  });
};

// **********************  POST REQUESTS *************************

const addSocialHistory = async (data, { require_auth = true } = {}) => {
  const payload = toPatientV1SocialHistoryUpdate(data);
  // For add, we don't need the 'id' field
  delete payload.id;

  // Add required timestamp fields
  const now = new Date().toISOString();
  payload.createdDate = now;
  payload.modifiedDate = now;
  
  // Get user ID from token directly
  let userId = ''; // backend might need empty string to use token user
  try {
    const token = await authStorage.getToken('userAuthToken');
    if (token) {
      const decoded = jwt_decode(token);
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[addSocialHistory] decoded token:', decoded);
      }
      // The 'sub' field contains a JSON string with user data
      if (decoded?.sub) {
        const userInfo = JSON.parse(decoded.sub);
        userId = userInfo.userId || userInfo.userID || '';
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[addSocialHistory] extracted userId:', userId);
        }
      }
    }
  } catch (e) {
    // Token extraction failed, use default
  }
  
  // Use extracted userId or default to a placeholder the backend accepts
  payload.createdById = userId || 'SYSTEM';
  payload.modifiedById = userId || 'SYSTEM';

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API SocialHistory] POST', {
      baseURL: PATIENT_V1_BASE,
      path: socialHistoryAdd,
      params: { require_auth },
      payload,
    });
  }

  const resp = await client.post(
    socialHistoryAdd,
    payload,
    withPatientV1Base({ params: { require_auth } }),
  );

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API SocialHistory] POST response', {
      ok: resp?.ok,
      status: resp?.status,
      problem: resp?.problem,
      data: resp?.data,
    });
  }

  return resp;
};

// ************************* UPDATE REQUESTS *************************
const updateSocialHistory = async (data, { require_auth = true } = {}) => {
  const payload = toPatientV1SocialHistoryUpdate(data);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API SocialHistory] PUT', {
      baseURL: PATIENT_V1_BASE,
      path: socialHistoryUpdate,
      params: { require_auth },
      payload,
    });
  }

  const resp = await client.put(
    socialHistoryUpdate,
    payload,
    withPatientV1Base({ params: { require_auth } }),
  );

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API SocialHistory] PUT response', {
      ok: resp?.ok,
      status: resp?.status,
      problem: resp?.problem,
      data: resp?.data,
    });
  }

  return resp;
};

/*
 * Expose your end points here
 */
export default {
  getSocialHistory,
  addSocialHistory,
  updateSocialHistory,
};
