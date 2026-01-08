/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';

/*
 * List all end points here
 */
const listOptions = '/List';

// New v1 endpoints for list options
const v1LanguageListEndpoint = '/PatientListLanguage/';
// Note: Relationship list has no API endpoint - screens use hardcoded fallback lists

// Helper for Patient Service v1 base
const withPatientV1Base = (cfg = {}) => ({ baseURL: PATIENT_V1_BASE, timeout: 15000, ...cfg });

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

// purpose: retrieve selection options for dropdowns (Language, Relationship, etc.)
const getSelectionOptionList = async (option) => {
  // Try new v1 endpoints first based on option type
  if (option.toLowerCase() === 'language') {
    const res = await client.get(v1LanguageListEndpoint, {}, withPatientV1Base());
    if (res.ok && res.data) {
      // Transform the response to match the expected format: [{label: value, value: id}, ...]
      const data = res.data.data || res.data || [];
      const transformedData = {
        ok: true,
        data: {
          data: data.map((item) => ({
            // Try to extract ID and value from various possible field names
            list_ID: item.id || item.patientListLanguageId || item.listId,
            value: item.value || item.name || item.language || '',
          })),
        },
      };
      return transformedData;
    }
    console.log(`[LIST v1] Failed to get ${option}:`, res.status, res.data);
    // Return error response so screens can use their fallback lists
    return { ok: false, data: null };
  }

  // Relationship has no v1 endpoint - return error so screens use fallback lists
  if (option.toLowerCase() === 'relationship') {
    console.log('[LIST] Relationship has no API endpoint, using fallback list');
    return { ok: false, data: null };
  }

  // Fallback to old endpoint for other option types
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
