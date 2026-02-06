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
  allergy: '/get_allergy_types',
  allergyreaction: '/get_allergy_reaction_types',
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

  const legacyFallback = () => {
    // Legacy List endpoint expects type=OptionName (case-sensitive in some backends)
    const params = { type: option };
    return client.get(listOptions, params);
  };

  // If we have a v1 endpoint for this option type, use it
  if (v1Endpoint) {
    try {
      // Some v1 endpoints are paginated; request a larger page size when using `/get_*` routes.
      const paginationParams = { pageNo: 0, pageSize: 200 };
      const queryParams = v1Endpoint.startsWith('/get_') ? paginationParams : {};
      const res = await client.get(v1Endpoint, queryParams, withPatientV1Base());

      if (res.ok && res.data) {
        // v1 endpoints can return either an array or a paginated wrapper with `data`/`results`
        const rawData = Array.isArray(res.data) ? res.data : (res.data.data ?? res.data.results ?? []);

        const toLegacyIdValue = (item) => {
          // Prefer specific keys where we know them, otherwise fall back.
          if (optionKey === 'allergy') {
            return {
              id:
                item.AllergyTypeID ??
                item.allergyTypeID ??
                item.allergy_type_id ??
                item.Id ??
                item.id,
              value: item.Value ?? item.value ?? item.name ?? '',
            };
          }
          if (optionKey === 'allergyreaction') {
            return {
              id:
                item.AllergyReactionTypeID ??
                item.allergyReactionTypeID ??
                item.allergy_reaction_type_id ??
                item.Id ??
                item.id,
              value: item.Value ?? item.value ?? item.name ?? '',
            };
          }

          return {
            id: item.Id ?? item.id ?? item.patientListLanguageId ?? item.listId,
            value: item.Value ?? item.value ?? item.name ?? item.language ?? '',
          };
        };

        return {
          ok: true,
          data: {
            data: rawData.map((item) => {
              const mapped = toLegacyIdValue(item);
              return {
                // Use a stable, legacy-ish shape so `useGetSelectionOptions` keeps working.
                list_ID: mapped.id ?? '',
                value: mapped.value ?? '',
              };
            }),
          },
        };
      }

      // If v1 is down / returns unexpected shape, fall back to legacy `/List`.
      return legacyFallback();
    } catch (e) {
      return legacyFallback();
    }
  }

  // Relationship has no v1 endpoint - return error so screens use fallback lists
  if (optionKey === 'relationship') {
    return { ok: false, data: null };
  }

  // Fallback to old endpoint for any other option types not in the v1 map
  return legacyFallback();
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getSelectionOptionList,
};
