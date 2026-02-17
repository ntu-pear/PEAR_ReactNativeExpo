/* eslint-disable no-console */
/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';

/*
 * List all end points here
 */
const withPatientV1Base = (cfg = {}) => ({
  baseURL: PATIENT_V1_BASE,
  timeout: 15000,
  ...cfg,
});

// Highlight endpoints with /Highlight prefix as per staging spec
const v1AllHighlightsEndpoint = '/Highlight/get_all_highlights';
const v1HighlightsByPatientEndpoint = (patient_id) =>
  `/Highlight/get_highlights_by_patient/${patient_id}`;

/*
 * List all functions here
 */

// ********************** GET REQUESTS *************************

// Get ALL patient highlights
const getAllHighlights = async () => {
  const url = v1AllHighlightsEndpoint;
  const res = await client.get(url, {}, withPatientV1Base());

  if (!res.ok) {
    console.log('[HIGHLIGHT v1][GET ALL]', url, res.status, res.data);
  } else {
    console.log(
      '[HIGHLIGHT v1][SUCCESS] Fetched highlights:',
      res.data?.length || 0,
      'items',
    );
    console.log('[HIGHLIGHT v1][RAW DATA]:', JSON.stringify(res.data, null, 2));
  }

  return res;
};

// Get highlights by specific patient ID
const getHighlightsByPatient = async (patient_id) => {
  const url = v1HighlightsByPatientEndpoint(patient_id);
  const res = await client.get(url, {}, withPatientV1Base());

  if (!res.ok) {
    console.log('[HIGHLIGHT v1][GET BY PATIENT]', url, res.status, res.data);
  }

  return res;
};

/*
 * Expose your end points here
 */
export default {
  getAllHighlights,
  getHighlightsByPatient,
};
