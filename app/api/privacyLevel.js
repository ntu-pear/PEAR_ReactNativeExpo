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
const getPatientPrivacyLevel = '/privacy_level_patient'; // GET /{patient_id}
const getAllPrivacyLevels = '/privacy_levels_patient/'; // GET
const addPrivacyLevel = '/privacy_levels/add'; // POST
const updatePrivacyLevel = '/privacy_levels/update'; // PUT /{patient_id}
const deletePrivacyLevel = '/privacy_levels/delete'; // DELETE /{patient_id}

/*
 * List all functions here
 */

// **********************  GET REQUESTS *************************

/**
 * Get privacy level for a specific patient
 * @param {number} patientID - The patient ID
 * @returns {Promise} API response
 */
const getPrivacyLevel = (patientID) => {
  const endpoint = `${getPatientPrivacyLevel}/${patientID}`;
  
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] GET', {
      baseURL: PATIENT_V1_BASE,
      endpoint,
    });
  }

  return client.get(endpoint, {}, withPatientV1Base()).then((resp) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[API PrivacyLevel] GET response', {
        ok: resp?.ok,
        status: resp?.status,
        data: resp?.data,
      });
    }
    return resp;
  });
};

/**
 * Get all privacy levels
 * @returns {Promise} API response
 */
const getAllPrivacyLevelsForPatients = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] GET ALL', {
      baseURL: PATIENT_V1_BASE,
      endpoint: getAllPrivacyLevels,
    });
  }

  return client.get(getAllPrivacyLevels, {}, withPatientV1Base()).then((resp) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[API PrivacyLevel] GET ALL response', {
        ok: resp?.ok,
        status: resp?.status,
        data: resp?.data,
      });
    }
    return resp;
  });
};

// **********************  POST REQUESTS *************************

/**
 * Create a new privacy level for a patient (Supervisor only)
 * @param {Object} data - Privacy level data
 * @param {number} data.patientId - Patient ID
 * @param {number} data.privacyLevel - Privacy level (1=Low, 2=Medium, 3=High)
 * @returns {Promise} API response
 */
const createPrivacyLevel = async (data) => {
  const payload = {
    accessLevelSensitive: data.privacyLevel || 2, // 1=Low, 2=Medium, 3=High
    active: true,
  };

  // patient_id is passed as a query parameter, not in body
  const params = {
    patient_id: data.patientId.toString(),
    require_auth: true,
  };

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] POST', {
      baseURL: PATIENT_V1_BASE,
      endpoint: addPrivacyLevel,
      params,
      payload,
    });
  }

  const resp = await client.post(addPrivacyLevel, payload, {
    ...withPatientV1Base(),
    params,
  });

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] POST response', {
      ok: resp?.ok,
      status: resp?.status,
      data: resp?.data,
    });
  }

  return resp;
};

// ************************* UPDATE REQUESTS *************************

/**
 * Update privacy level for a patient (Supervisor and Primary Guardian only)
 * @param {number} patientID - Patient ID
 * @param {Object} data - Privacy level data
 * @param {number} data.privacyLevel - Privacy level (1=Low, 2=Medium, 3=High)
 * @returns {Promise} API response
 */
const updatePrivacyLevelForPatient = async (patientID, data) => {
  const endpoint = `${updatePrivacyLevel}/${patientID}`;
  
  const payload = {
    accessLevelSensitive: data.privacyLevel,
    active: data.active !== undefined ? data.active : true,
  };

  const params = {
    require_auth: true,
  };

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] PUT', {
      baseURL: PATIENT_V1_BASE,
      endpoint,
      params,
      payload,
    });
  }

  const resp = await client.put(endpoint, payload, {
    ...withPatientV1Base(),
    params,
  });

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] PUT response', {
      ok: resp?.ok,
      status: resp?.status,
      data: resp?.data,
    });
  }

  return resp;
};

// ************************* DELETE REQUESTS *************************

/**
 * Delete privacy level for a patient (Supervisor only)
 * @param {number} patientID - Patient ID
 * @returns {Promise} API response
 */
const deletePrivacyLevelForPatient = async (patientID) => {
  const endpoint = `${deletePrivacyLevel}/${patientID}`;

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] DELETE', {
      baseURL: PATIENT_V1_BASE,
      endpoint,
    });
  }

  const resp = await client.delete(endpoint, {}, withPatientV1Base());

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[API PrivacyLevel] DELETE response', {
      ok: resp?.ok,
      status: resp?.status,
      data: resp?.data,
    });
  }

  return resp;
};

/*
 * Expose your end points here
 */
export default {
  getPrivacyLevel,
  getAllPrivacyLevelsForPatients,
  createPrivacyLevel,
  updatePrivacyLevelForPatient,
  deletePrivacyLevelForPatient,
};
