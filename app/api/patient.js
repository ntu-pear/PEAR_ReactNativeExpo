
/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';
import { Image } from 'react-native';

/*
 * List all end points here
 */
// --- Patient Service v1 base (new server) ---
const withPatientV1Base = (cfg = {}) => ({ baseURL: PATIENT_V1_BASE, timeout: 15000, ...cfg });
const v1PatientsListEndpoint = '/patients/';
// NOTE: patient service v1 is strict about trailing slashes for some routes
const v1PatientReadEndpoint = (patient_id) => `/patients/${patient_id}`;
const v1PatientMedicationsEndpoint = (patient_id) => `/patients/${patient_id}/medications/`;
const v1PatientMedicationDetailEndpoint = (patient_id, med_id) => `/patients/${patient_id}/medications/${med_id}/`;
const USE_COLLECTION_STYLE_MED_ENDPOINT = false;

// ---------- Patient Mobility (v1) ----------
const v1MobilityMapListByPatientEndpoint = (patient_id) => `/MobilityMapping/List/Patient/${patient_id}`;
const v1MobilityMapAddEndpoint = () => `/MobilityMapping/List/add`;
const v1MobilityMapUpdateEndpoint = (mobility_id) => `/MobilityMapping/List/update/${mobility_id}`;
const v1MobilityMapDeleteEndpoint = (mobility_id) => `/MobilityMapping/List/delete/${mobility_id}`;

// ---------- Vitals (v1) ----------
const v1VitalListEndpoint = `/Vital/list`;                      // GET ?patient_id=#
const v1VitalAddEndpoint = `/Vital/add`;                        // POST
const v1VitalUpdateEndpoint = (vital_id) => `/Vital/update/${vital_id}`; // PUT
const v1VitalDeleteEndpoint = `/Vital/delete`;                  // DELETE (expects vital_id)

// ---------- Profile Picture (v1) ----------
const v1UpdateProfilePictureEndpoint = (patient_id) => `/patients/update/${patient_id}/update_patient_profile_picture`;

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// ---------- Patient list/read (v1) ----------
const listPatientsV1 = (params = {}) => {
  // Pass through all params to support pagination (pageNo, pageSize), 
  // search (q), and filters (status, mask, etc.)
  // Remove undefined values to keep the query string clean
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  );
  return client.get(
    v1PatientsListEndpoint,
    cleanParams,
    withPatientV1Base()
  );
};

const readPatientV1 = async (patient_id, { require_auth = true, mask = true } = {}) => {
  return client.get(v1PatientReadEndpoint(patient_id), { require_auth, mask }, withPatientV1Base());
};

// ---------- Patient Medications (v1) ----------
const listPatientMedicationsV1 = async (patient_id, params = {}) => {
  if (!patient_id) {
    return { ok: false, status: 400, data: { detail: 'patient_id is required' } };
  }

  // candidates in order: nested, id-in-path, collection with query
  const candidates = [
    { path: `/patients/${patient_id}/medications/`, query: params },
    { path: `/patient-medications/${patient_id}/`, query: params },
    { path: `/patient-medications/`,              query: { patient_id, ...params } },
    { path: `/medications/`,                      query: { patient_id, ...params } },
    { path: `/medication/`,                       query: { patient_id, ...params } },
  ];

  for (const c of candidates) {
    const res = await client.get(c.path, c.query, withPatientV1Base());
    if (res.ok) {
      console.log('[MEDS v1] ✅ using', c.path);
      return res;
    }
    // stop early on non-404 (e.g., 401/500) since that’s a real response
    if (res.status && res.status !== 404) {
      console.log('[MEDS v1] ❌', c.path, res.status);
      return res;
    }
    console.log('[MEDS v1] 404', c.path);
  }

  // nothing matched
  return { ok: false, status: 404, data: { detail: 'No matching medications endpoint' } };
};



const addPatientMedicationV1 = (patient_id, payload) => {
  return client.post(v1PatientMedicationsEndpoint(patient_id), payload, withPatientV1Base());
};

const updatePatientMedicationV1 = (patient_id, payload) => {
  // Accept legacy/v1 id keys
  const med_id = payload.medicationID ?? payload.medication_id ?? payload.id;
  return client.put(v1PatientMedicationDetailEndpoint(patient_id, med_id), payload, withPatientV1Base());
};

const deletePatientMedicationV1 = ({ patientID, patient_id, medicationID, medication_id, id }) => {
  const pid = patientID ?? patient_id;
  const mid = medicationID ?? medication_id ?? id;
  return client.delete(v1PatientMedicationDetailEndpoint(pid, mid), {}, withPatientV1Base());
};

// ---------- Allergy (v1) ----------
const listPatientAllergiesV1 = async (patient_id, params = {}) => {
  if (!patient_id) {
    return { ok: false, status: 400, data: { detail: 'patient_id is required' } };
  }

  // NOTE: PATIENT_V1_BASE already includes `/api/v1`
  const url = `/get_patient_allergy/${patient_id}`;
  const res = await client.get(url, params, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][GET]', url, res.status, res.data);
  return res;
};

const addPatientAllergyV1 = async (patient_id, data) => {
  if (!patient_id) {
    return { ok: false, status: 400, data: { detail: 'patient_id is required' } };
  }

  const payload = {
    PatientID: patient_id,
    AllergyTypeID: data.AllergyListID ?? data.allergy_type_id ?? data.allergyListID ?? data.AllergyTypeID,
    AllergyReactionTypeID: data.AllergyReactionListID ?? data.allergy_reaction_type_id ?? data.allergyReactionListID ?? data.AllergyReactionTypeID,
    AllergyRemarks: data.AllergyRemarks ?? data.allergy_remarks ?? data.allergyRemarks ?? '',
    IsDeleted: '0',
  };
  
  // NOTE: PATIENT_V1_BASE already includes `/api/v1`
  const url = `/create_patient_allergy`;
  const res = await client.post(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][POST]', url, res.status, payload, res.data);
  return res;
};

const updatePatientAllergyV1 = async (patient_id, allergy_id, data) => {
  if (!patient_id || !allergy_id) {
    return { ok: false, status: 400, data: { detail: 'patient_id and allergy_id are required' } };
  }

  const payload = {
    Patient_AllergyID: allergy_id,
    AllergyTypeID: data.AllergyListID ?? data.allergy_type_id ?? data.allergyListID,
    AllergyReactionTypeID: data.AllergyReactionListID ?? data.allergy_reaction_type_id ?? data.allergyReactionListID,
    AllergyRemarks: data.AllergyRemarks ?? data.allergy_remarks ?? data.allergyRemarks ?? '',
    IsDeleted: data.IsDeleted ?? '0',
  };
  
  // NOTE: PATIENT_V1_BASE already includes `/api/v1`
  const url = `/update_patient_allergy/${patient_id}`;
  const res = await client.put(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][PUT]', url, res.status, payload, res.data);
  return res;
};

const deletePatientAllergyV1 = async (patient_id, patient_allergy_id) => {
  if (!patient_id || !patient_allergy_id) {
    return { ok: false, status: 400, data: { detail: 'patient_id and patient_allergy_id are required' } };
  }

  // NOTE: PATIENT_V1_BASE already includes `/api/v1`
  const url = `/delete_patient_allergy/${patient_allergy_id}`;
  const res = await client.delete(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][DELETE]', url, res.status, res.data);
  return res;
};

// ---------- Mobility (v1) ----------
const listPatientMobilityAidsV1 = async (patient_id) => {
  const url = v1MobilityMapListByPatientEndpoint(patient_id);
  const res = await client.get(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[MOBILITY v1][GET]', url, res.status, res.data);

  // normalize to UI shape
  const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return raw.map((x) => ({
    mobilityId: x.mobility_id ?? x.id,
    mobilityListId: x.mobility_list_id,
    mobilityListDesc: x.mobility_list_desc ?? '', // description if backend joins the master table
    mobilityRemark: x.remark ?? '',
    isRecovered: x.is_recovered,
    date: x.date ?? x.created_at ?? '',
  }));
};

const addPatientMobilityV1 = async (patient_id, data) => {
  const payload = {
    patient_id,
    mobility_list_id: data.mobilityListId,
    remark: data.mobilityRemark,
    is_recovered: data.isRecovered,
    date: data.date,
  };
  const url = v1MobilityMapAddEndpoint();
  const res = await client.post(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[MOBILITY v1][POST]', url, res.status, payload, res.data);
  return res;
};

const updatePatientMobilityV1 = async (patient_id, data) => {
  const mobility_id = data.mobilityId;
  const payload = {
    patient_id,
    mobility_list_id: data.mobilityListId,
    remark: data.mobilityRemark,
    is_recovered: data.isRecovered,
    date: data.date,
  };
  const url = v1MobilityMapUpdateEndpoint(mobility_id);
  const res = await client.put(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[MOBILITY v1][PUT]', url, res.status, payload, res.data);
  return res;
};

const deletePatientMobilityV1 = async (patient_id, mobility_id) => {
  const url = v1MobilityMapDeleteEndpoint(mobility_id);
  const res = await client.delete(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[MOBILITY v1][DELETE]', url, res.status, res.data);
  return res;
};

// ---------- Vitals (v1) ----------
const listPatientVitalsV1 = async (patient_id, params = {}) => {
  const res = await client.get(
    v1VitalListEndpoint,
    { patient_id, ...params },
    withPatientV1Base()
  );
  if (!res.ok) {
    console.log('[VITAL v1][GET LIST]', res.status, res.data);
    throw res;
  }

  // normalize: FastAPI -> UI shape already used on the screen
  const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return raw.map((x) => ({
    vitalID:           x.vital_id ?? x.id,
    temperature:       x.temperature ?? null,
    weight:            x.weight ?? null,
    height:            x.height ?? null,
    systolicBP:        x.systolic_bp ?? x.systolicBP ?? null,
    diastolicBP:       x.diastolic_bp ?? x.diastolicBP ?? null,
    heartRate:         x.heart_rate ?? x.heartRate ?? null,
    spO2:              x.spo2 ?? x.SpO2 ?? null,
    bloodSugarlevel:   x.blood_sugar_level ?? x.bloodSugarlevel ?? null, // keep UI’s key
    vitalRemarks:      x.vital_remarks ?? x.vitalRemarks ?? '',
    afterMeal:         x.after_meal ?? x.afterMeal ?? false,
    createdDateTime:   x.created_at ?? x.createdDateTime ?? x.date ?? null,
  }));
};

const addPatientVitalV1 = (patient_id, data) => {
  const payload = {
    patient_id,
    temperature:        data.temperature,
    weight:             data.weight,
    height:             data.height,
    systolic_bp:        data.systolicBP,
    diastolic_bp:       data.diastolicBP,
    heart_rate:         data.heartRate,
    spo2:               data.spO2,
    blood_sugar_level:  data.bloodSugarLevel ?? data.bloodSugarlevel,
    vital_remarks:      data.vitalRemarks,
    after_meal:         data.afterMeal,
  };
  return client.post(v1VitalAddEndpoint, payload, withPatientV1Base());
};

const updatePatientVitalV1 = (patient_id, data) => {
  const payload = {
    patient_id,
    temperature:        data.temperature,
    weight:             data.weight,
    height:             data.height,
    systolic_bp:        data.systolicBP,
    diastolic_bp:       data.diastolicBP,
    heart_rate:         data.heartRate,
    spo2:               data.spO2,
    blood_sugar_level:  data.bloodSugarLevel ?? data.bloodSugarlevel,
    vital_remarks:      data.vitalRemarks,
    after_meal:         data.afterMeal,
  };
  return client.put(v1VitalUpdateEndpoint(data.vitalID), payload, withPatientV1Base());
};

const deletePatientVitalV1 = async (vital_id) => {
  // Try query param first (most common). If backend needs JSON body for DELETE, try again with `data`.
  let res = await client.delete(v1VitalDeleteEndpoint, { vital_id }, withPatientV1Base());
  if (!res.ok) {
    res = await client.delete(
      v1VitalDeleteEndpoint,
      {},
      { baseURL: PATIENT_V1_BASE, timeout: 15000, data: { vital_id } }
    );
  }
  if (!res.ok) console.log('[VITAL v1][DELETE]', res.status, res.data);
  return res;
};

// ---------- Problem Logs (v1) ----------
const v1PatientProblemLogsEndpoint = (patient_id) => `/patients/${patient_id}/problem_logs/`;
const v1PatientProblemLogDetailEndpoint = (patient_id, log_id) => `/patients/${patient_id}/problem_logs/${log_id}/`;

// List all logs for a patient
const listPatientProblemLogsV1 = async (patient_id) => {
  const res = await client.get(v1PatientProblemLogsEndpoint(patient_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[PROBLEM LOG v1][GET LIST]', res.status, res.data);
  return res;
};

// Add new problem log
const addPatientProblemLogV1 = async (patient_id, data) => {
  const payload = {
    problem_log_list_id: data.problemLogListID ?? data.problemLogListId ?? 1,
    problem_log_remarks: data.problemLogRemarks ?? data.problem_log_remarks ?? '',
  };
  const res = await client.post(v1PatientProblemLogsEndpoint(patient_id), payload, withPatientV1Base());
  if (!res.ok) console.log('[PROBLEM LOG v1][POST]', res.status, payload, res.data);
  return res;
};

// Update existing problem log
const updatePatientProblemLogV1 = async (patient_id, log_id, data) => {
  const payload = {
    problem_log_list_id: data.problemLogListID ?? data.problemLogListId ?? 1,
    problem_log_remarks: data.problemLogRemarks ?? data.problem_log_remarks ?? '',
  };
  const res = await client.patch(v1PatientProblemLogDetailEndpoint(patient_id, log_id), payload, withPatientV1Base());
  if (!res.ok) console.log('[PROBLEM LOG v1][PATCH]', res.status, payload, res.data);
  return res;
};

// Delete a problem log
const deletePatientProblemLogV1 = async (patient_id, log_id) => {
  const res = await client.delete(v1PatientProblemLogDetailEndpoint(patient_id, log_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[PROBLEM LOG v1][DELETE]', res.status, res.data);
  return res;
};


// ---------- Medical History (v1) ----------
const v1PatientMedicalHistoriesEndpoint = (patient_id) => `/patients/${patient_id}/medical_histories/`;
const v1PatientMedicalHistoryDetailEndpoint = (patient_id, hx_id) => `/patients/${patient_id}/medical_histories/${hx_id}/`;

// List all medical histories for a patient
const listPatientMedicalHistoriesV1 = async (patient_id) => {
  const res = await client.get(v1PatientMedicalHistoriesEndpoint(patient_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[MEDICAL HISTORY v1][GET LIST]', res.status, res.data);
  return res;
};

// Add new medical history
const addPatientMedicalHistoryV1 = async (patient_id, data) => {
  const payload = {
    information_source: data.informationSource ?? '',
    medical_details: data.medicalDetails ?? '',
    medical_remarks: data.medicalRemarks ?? '',
    estimated_date: data.medicalEstimatedDate ?? null,
  };
  const res = await client.post(v1PatientMedicalHistoriesEndpoint(patient_id), payload, withPatientV1Base());
  if (!res.ok) console.log('[MEDICAL HISTORY v1][POST]', res.status, payload, res.data);
  return res;
};

// Delete a medical history
const deletePatientMedicalHistoryV1 = async (patient_id, hx_id) => {
  const res = await client.delete(v1PatientMedicalHistoryDetailEndpoint(patient_id, hx_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[MEDICAL HISTORY v1][DELETE]', res.status, res.data);
  return res;
};

// ---------- Prescriptions (v1) ----------
const v1PatientPrescriptionsEndpoint = (patient_id) => `/patients/${patient_id}/prescriptions/`;
const v1PatientPrescriptionDetailEndpoint = (patient_id, presc_id) => `/patients/${patient_id}/prescriptions/${presc_id}/`;

const listPatientPrescriptionsV1 = async (patient_id) => {
  const res = await client.get(v1PatientPrescriptionsEndpoint(patient_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[PRESCRIPTION v1][GET LIST]', res.status, res.data);
  return res;
};

const addPatientPrescriptionV1 = async (patient_id, data) => {
  const payload = {
    prescription_list_id: data.prescriptionListID ?? 1,
    dosage: data.dosage ?? '',
    frequency_per_day: Number(data.frequencyPerDay) ?? 1,
    is_chronic: data.isChronic ?? false,
    instruction: data.instruction ?? '',
    start_date: data.startDate ?? null,
    end_date: data.endDate ?? null,
    after_meal: data.afterMeal ?? false,
    prescription_remarks: data.prescriptionRemarks ?? '',
  };
  const res = await client.post(v1PatientPrescriptionsEndpoint(patient_id), payload, withPatientV1Base());
  if (!res.ok) console.log('[PRESCRIPTION v1][POST]', res.status, payload, res.data);
  return res;
};

const updatePatientPrescriptionV1 = async (patient_id, presc_id, data) => {
  const payload = {
    prescription_list_id: data.prescriptionListID ?? 1,
    dosage: data.dosage ?? '',
    frequency_per_day: Number(data.frequencyPerDay) ?? 1,
    is_chronic: data.isChronic ?? false,
    instruction: data.instruction ?? '',
    start_date: data.startDate ?? null,
    end_date: data.endDate ?? null,
    after_meal: data.afterMeal ?? false,
    prescription_remarks: data.prescriptionRemarks ?? '',
  };
  const res = await client.patch(v1PatientPrescriptionDetailEndpoint(patient_id, presc_id), payload, withPatientV1Base());
  if (!res.ok) console.log('[PRESCRIPTION v1][PATCH]', res.status, payload, res.data);
  return res;
};

const deletePatientPrescriptionV1 = async (patient_id, presc_id) => {
  const res = await client.delete(v1PatientPrescriptionDetailEndpoint(patient_id, presc_id), {}, withPatientV1Base());
  if (!res.ok) console.log('[PRESCRIPTION v1][DELETE]', res.status, res.data);
  return res;
};


// ---------- Helpers ----------
const addPatientForm = (arr, str, patientData) => {
  for (const item in arr) {
    const value = arr[item];
    for (const key in value) {
      let val = value[key];

      // if key is IsChecked, do not append to patientData
      if (key === 'NRIC') {
        val = String(val || '').toUpperCase();
      }
      if (key === 'IsChecked') continue;

      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      // if AllergyListID is 'None', do not append allergy info to patientData
      if (key === 'AllergyListID' && val == 2) {
        break;
      } else {
        const param = `${str}[${item}].${key}`;
        patientData.append(param, val);
      }
    }
  }
  return patientData;
};

// ---------- Pure v1 patient endpoints (replaces legacy wrappers) ----------

// Direct v1 read — used by many screens (e.g., PatientProfile)
const getPatient = async (patientID) => {
  return readPatientV1(patientID); // internally uses /patients/:id/
};

// List patients (used by dashboard, preferences, etc.)
// NOTE: Fetches a large page by default to maintain backward compatibility
// with screens that expect all patients at once
const getPatientList = async (maskNRIC = true, patientStatus = null) => {
  const params = {
    pageNo: 0,
    pageSize: 1000,  // Large page to get all patients for screens that need full list
  };
  if (patientStatus) params.status = patientStatus;
  if (maskNRIC !== undefined) params.mask = maskNRIC;
  return listPatientsV1(params);
};

// Create patient (used by AddPatient screen)
// Expects a properly formatted payload matching the API schema
const addPatient = async (patientPayload) => {
  console.log('[ADD PATIENT] Sending patient payload:', patientPayload);
  return client.post('/patients/add', patientPayload, withPatientV1Base());
};

// Add guardian for a patient
const addGuardian = async (guardianPayload) => {
  console.log('[ADD GUARDIAN] Sending guardian payload:', guardianPayload);
  return client.post('/Guardian/add', guardianPayload, withPatientV1Base());
};

// Update patient (used by EditPatientInfoScreen)
const updatePatient = async (patientID, data) => {
  return client.put(`/patients/${patientID}/`, data, withPatientV1Base());
};


// ---------- NORMALIZERS ----------
// Normalize patient data from v1 API to UI shape (shared across screens)
export const normalizePatientV1 = (p = {}) => {
  const nameParts = (p.name ?? '').split(' ');
  const inferredFirst = nameParts[0] ?? '';
  const inferredLast = nameParts.slice(1).join(' ') ?? '';

  const firstName =
    p.firstName ?? p.FirstName ?? p.first_name ?? p.given_name ?? p.first ?? inferredFirst;
  const lastName =
    p.lastName ?? p.LastName ?? p.last_name ?? p.family_name ?? p.last ?? inferredLast;

  return {
    id: p.id ?? p.patientID ?? p.PatientID ?? p.patient_id ?? p.uuid ?? null,
    patientID: p.patientID ?? p.PatientID ?? p.id ?? p.patient_id ?? null,
    firstName,
    lastName,
    preferredName: p.preferredName ?? p.PreferredName ?? p.preferred_name ?? '',
    fullName:
      (p.fullName ?? p.FullName ?? p.name ?? [firstName, lastName].filter(Boolean).join(' ')) || '',
    nric: p.nric ?? p.NRIC ?? p.nric_number ?? p.id_number ?? null,
    profilePicture:
      p.profilePicture ??
      p.ProfilePicture ??
      p.profile_picture ??
      p.profile_picture_url ??
      p.photoUrl ??
      null,
  };
};


// --- v1 Allergy dropdown sources ---
const getAllergyTypesV1 = async () => {
  const url = `/get_allergy_types`;
  const res = await client.get(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][GET TYPES]', url, res.status, res.data);
  return res;
};

const getAllergyReactionTypesV1 = async () => {
  const url = `/get_allergy_reaction_types`;
  const res = await client.get(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][GET REACTION TYPES]', url, res.status, res.data);
  return res;
};

// ---------- Profile Picture Upload (v1) ----------
const uploadPatientProfilePictureV1 = (patient_id, file) => {
  const form = new FormData();
  form.append('file', file);
  return client.put(v1UpdateProfilePictureEndpoint(patient_id), form, {
    ...withPatientV1Base(),
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/*
 * Expose your end points here
 */
export default {
  // Core Patient v1 (used by screens)
  getPatient,
  getPatientList,
  addPatient,
  addGuardian,
  updatePatient,

  // --- v1 Patient Service (new) ---
  listPatientsV1,
  readPatientV1,

  // --- normalizers ---
  normalizePatientV1,

  // --- v1 Patient Medications ---
  listPatientMedicationsV1,
  addPatientMedicationV1,
  updatePatientMedicationV1,
  deletePatientMedicationV1,

  // --- v1 Allergy ---
  listPatientAllergiesV1,
  addPatientAllergyV1,
  updatePatientAllergyV1,
  deletePatientAllergyV1,
  getAllergyTypesV1,
  getAllergyReactionTypesV1,

  // --- v1 Mobility ---
  listPatientMobilityAidsV1,
  addPatientMobilityV1,
  updatePatientMobilityV1,
  deletePatientMobilityV1,

  // --- v1 Vitals ---
  listPatientVitalsV1,
  addPatientVitalV1,
  updatePatientVitalV1,
  deletePatientVitalV1,

  // --- v1 Problem Logs ---
  listPatientProblemLogsV1,
  addPatientProblemLogV1,
  updatePatientProblemLogV1,
  deletePatientProblemLogV1,

  // --- v1 Medical History ---
  listPatientMedicalHistoriesV1,
  addPatientMedicalHistoryV1,
  deletePatientMedicalHistoryV1,

  // --- v1 Prescriptions ---
  listPatientPrescriptionsV1,
  addPatientPrescriptionV1,
  updatePatientPrescriptionV1,
  deletePatientPrescriptionV1,

  // --- v1 Profile Picture ---
  uploadPatientProfilePictureV1,
};
