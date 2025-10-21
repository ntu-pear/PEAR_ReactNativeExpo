
/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';
import { Image } from 'react-native';

/*
 * List all end points here
 */
// --- Patient Service v1 base (new server) ---
const withPatientV1Base = (cfg = {}) => ({ baseURL: PATIENT_V1_BASE, timeout: 15000, ...cfg });
const v1PatientsListEndpoint = '/patients/';
const v1PatientReadEndpoint = (patient_id) => `/patients/${patient_id}/`;
const v1PatientMedicationsEndpoint = (patient_id) => `/patients/${patient_id}/medications/`;
const v1PatientMedicationDetailEndpoint = (patient_id, med_id) => `/patients/${patient_id}/medications/${med_id}/`;
const USE_COLLECTION_STYLE_MED_ENDPOINT = false;

// --- Patient Photos (v1) --- //
const v1PatientPhotoUploadEndpoint = (patient_id, albumCategoryListID, createdByID, modifiedByID) => `/v1`;
const v1PatientPhotoGetEndpoint = (photo_id) => `/v1/{photo_id}`;
const v1PatientPhotoUpdateEndpoint = (patient_id, modifiedByID) => `/v1/{patient_id}`;
const v1PatientPhotoDeleteEndpoint = (patient_id, modifiedByID) => `/v1/{patient_id}`

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

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// --- Patient Photo (v1) --- //

const getPatientPhotoV1 = async (photo_id) => {
    return client.get(v1PatientPhotoGetEndpoint(photo_id), {}, withPatientV1Base())
}

const addPatientPhotoV1 = async (patient_id, photoData) => {
  const photoFormData = new FormData();

  if (photoData.Photo) {
    photoFormData.append('Photo', {
      uri: photoData.Photo.uri,
      name: photoData.Photo.name,
      type: photoData.Photo.type,
    });
  }
  photoFormData.append('PhotoDetails', photoData.PhotoDetails || '');
  photoFormData.append('AlbumCategoryName', photoData.AlbumCategoryName || '');
  photoFormData.append('AlbumCategoryListID', photoData.AlbumCategoryListID ?? '');
  photoFormData.append('PatientID', patientID);
  photoFormData.append('PatientPhotoID', photoData.PatientPhotoID ?? '');
  return client.post(v1PatientPhotoUploadEndpoint, photoFormData);
};

const deletePatientPhotoV1 = async (patient_id) => {
    return client.delete(v1PatientPhotoDeleteEndpoint(patient_id), {}, withPatientV1Base())
}

const updatePatientPhotoV1 = async (patientID, photoData) => {
  const photoFormData = new FormData();
  if (photoData.Photo) {
    if (typeof photoData.Photo === 'object' && photoData.Photo.uri) {
      photoFormData.append('Photo', {
        uri: photoData.Photo.uri,
        name: photoData.Photo.name,
        type: photoData.Photo.type,
      });
    } else if (typeof photoData.Photo === 'string') {
      photoFormData.append('Photo', '');
    }
  } else {
    photoFormData.append('Photo', '');
  }
  photoFormData.append('PhotoDetails', photoData.PhotoDetails || '');
  if (photoData.AlbumCategoryListID) {
    photoFormData.append('AlbumCategoryListID', photoData.AlbumCategoryListID);
  } else {
    photoFormData.append('AlbumCategoryName', photoData.AlbumCategoryName || '');
  }
  photoFormData.append('PatientID', patientID);
  photoFormData.append('PatientPhotoID', photoData.PatientPhotoID);

  return client.put(patientPhotoUpdate, photoFormData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ---------- Patient list/read (v1) ----------
const listPatientsV1 = (params = {}) => {
  const { q, page, page_size } = params; // neutral; backend can ignore if unsupported
  return client.get(
    v1PatientsListEndpoint,
    { ...(q ? { q } : {}), ...(page ? { page } : {}), ...(page_size ? { page_size } : {}) },
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
const listPatientAllergiesV1 = async (patient_id) => {
  const url = `/api/v1/get_patient_allergy/${patient_id}`;
  const res = await client.get(url, {}, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][GET]', url, res.status, res.data);
  return res;
};

const addPatientAllergyV1 = async (patient_id, data) => {
  const payload = {
    patient_id,
    allergy_type_id:
      data.AllergyListID ?? data.allergy_type_id ?? data.allergyListID,
    allergy_reaction_type_id:
      data.AllergyReactionListID ?? data.allergy_reaction_type_id ?? data.allergyReactionListID,
    allergy_remarks:
      data.AllergyRemarks ?? data.allergy_remarks ?? data.allergyRemarks ?? '',
  };
  const url = `/api/v1/create_patient_allergy`;
  const res = await client.post(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][POST]', url, res.status, payload, res.data);
  return res;
};

const updatePatientAllergyV1 = async (patient_id, data) => {
  const payload = {
    allergy_type_id:
      data.AllergyListID ?? data.allergy_type_id ?? data.allergyListID,
    allergy_reaction_type_id:
      data.AllergyReactionListID ?? data.allergy_reaction_type_id ?? data.allergyReactionListID,
    allergy_remarks:
      data.AllergyRemarks ?? data.allergy_remarks ?? data.allergyRemarks ?? '',
  };
  const url = `/api/v1/update_patient_allergy/${patient_id}`;
  const res = await client.put(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][PUT]', url, res.status, payload, res.data);
  return res;
};

const deletePatientAllergyV1 = async (patient_allergy_id) => {
  const url = `/api/v1/delete_patient_allergy/${patient_allergy_id}`;
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


// Normalize v1 -> legacy shape your UI already expects
export const normalizePatientAllergyV1 = (a = {}) => ({
  allergyID: a.patient_allergy_id ?? a.id ?? a.allergy_id ?? null,
  allergyListID: a.allergy_type_id ?? a.AllergyListID ?? null,
  allergyReactionListID: a.allergy_reaction_type_id ?? a.AllergyReactionListID ?? null,
  allergyRemarks: a.allergy_remarks ?? a.AllergyRemarks ?? '',
  allergyListDesc: a.allergy_type_desc ?? a.allergyListDesc ?? '',          // if backend returns description
  allergyReaction: a.allergy_reaction_type_desc ?? a.allergyReaction ?? '', // if backend returns description
  createdDate: a.created_at ?? a.createdDate ?? null,
});

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
const getPatientList = async (maskNRIC = true, patientStatus = null) => {
  const params = {};
  if (patientStatus) params.status = patientStatus;
  if (maskNRIC !== undefined) params.mask = maskNRIC;
  return listPatientsV1(params);
};

// Create patient (used by AddPatient screen)
const addPatient = async (patientFormData) => {
  const formData = new FormData();

  for (const key in patientFormData.patientInfo) {
    let value = patientFormData.patientInfo[key];
    if (value instanceof Date) value = value.toISOString().split('T')[0];
    if (key === 'NRIC') value = String(value || '').toUpperCase();
    if (key === 'IsChecked') continue;
    formData.append(key, value);
  }

  return client.post('/patients/', formData, withPatientV1Base());
};

// Update patient (used by EditPatientInfoScreen)
const updatePatient = async (patientID, data) => {
  return client.put(`/patients/${patientID}/`, data, withPatientV1Base());
};


// ---------- NORMALIZERS ----------
export const normalizePatientV1 = (p = {}) => ({
  id: p.id ?? p.patient_id ?? p.uuid ?? null,
  firstName: p.first_name ?? p.given_name ?? p.first ?? '',
  lastName: p.last_name ?? p.family_name ?? p.last ?? '',
  fullName:
    [p.first_name ?? p.given_name ?? p.first, p.last_name ?? p.family_name ?? p.last]
      .filter(Boolean)
      .join(' ') || p.name || '',
  nric: p.nric ?? p.nric_number ?? p.id_number ?? null,
});

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

/*
 * Expose your end points here
 */
export default {
  // Core Patient v1 (used by screens)
  getPatient,
  getPatientList,
  addPatient,
  updatePatient,

  // --- v1 Patient Service (new) ---
  listPatientsV1,
  readPatientV1,

  // --- normalizers ---
  normalizePatientV1,
  normalizePatientAllergyV1,

  //--- v1 Patient Photos ---
  getPatientPhotoV1,
  addPatientPhotoV1,
  deletePatientPhotoV1,
  updatePatientPhotoV1,
  
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


};

