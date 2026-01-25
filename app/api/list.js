/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';

/*
 * List all end points here
 */
const listOptions = '/List';

// New v1 endpoints for list options (from Patient Service v1 OpenAPI spec)
const v1EndpointMap = {
  language: '/PatientListLanguage/',
  diet: '/get_diet_types',
  education: '/get_education_types',
  livewith: '/get_livewith_types',
  occupation: '/get_occupation_types',
  pet: '/get_pet_types',
  religion: '/get_religion_types',
};

// Helper for Patient Service v1 base
const withPatientV1Base = (cfg = {}) => ({ baseURL: PATIENT_V1_BASE, timeout: 15000, ...cfg });

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// purpose: retrieve selection options for dropdowns (Language, Diet, Education, etc.)
const getSelectionOptionList = async (option) => {
  const optionKey = option.toLowerCase();
  const v1Endpoint = v1EndpointMap[optionKey];

  // If we have a v1 endpoint for this option type, use it
  if (v1Endpoint) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[LIST API] GET ${optionKey} from v1:`, {
        baseURL: PATIENT_V1_BASE,
        path: v1Endpoint,
      });
    }

    const res = await client.get(v1Endpoint, {}, withPatientV1Base());

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[LIST API] GET ${optionKey} response:`, {
        ok: res?.ok,
        status: res?.status,
        dataLength: Array.isArray(res?.data) ? res.data.length : 'not array',
      });
    }

    if (res.ok && res.data) {
      // v1 endpoints return array directly (no wrapper), with { Id, Value, ... } structure
      const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const transformedData = {
        ok: true,
        data: {
          data: rawData.map((item) => ({
            // v1 uses PascalCase: Id, Value
            list_ID: item.Id ?? item.id ?? item.patientListLanguageId ?? item.listId,
            value: item.Value ?? item.value ?? item.name ?? item.language ?? '',
          })),
        },
      };
      return transformedData;
    }

    console.log(`[LIST v1] Failed to get ${option}:`, res.status, res.problem);
    // Return error response so screens can use their fallback lists
    return { ok: false, data: null };
  }

  // Relationship has no v1 endpoint - return error so screens use fallback lists
  if (optionKey === 'relationship') {
    console.log('[LIST] Relationship has no API endpoint, using fallback list');
    return { ok: false, data: null };
  }

  // Fallback to old endpoint for any other option types not in the v1 map
  const params = {
    type: option,
  };
  return client.get(listOptions, params);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getSelectionOptionList,
};
