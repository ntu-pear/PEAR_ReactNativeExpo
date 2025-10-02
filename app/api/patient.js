
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


// ---- Legacy service endpoints (existing server) ----
const endpoint = '/Patient';
const allergyEndpoint = '/Allergy';
const vitalEndpoint = '/Vital';
const prescriptionEndpoint = '/Prescription';
const problemLogEndpoint = '/ProblemLog';
const medicalHistoryEndpoint = '/MedicalHistory';
const medicationEndpoint = '/Medication';
const activityEndpoint = '/Activity';
const routineEndpoint = '/Routine';
const mobilityEndpoint = '/Mobility';
const photoEndpoint = '/PatientPhoto';


const patientRoutine = `${activityEndpoint}${routineEndpoint}/PatientRoutine`; //eslint-disable-line no-unused-vars

// Medical History
const patientMedicalHistory = `${medicalHistoryEndpoint}/list`; //eslint-disable-line no-unused-vars


// Vitals
const patientVitalList = `${vitalEndpoint}/list`; //eslint-disable-line no-unused-vars

// Photo Album
const patientPhoto = `${photoEndpoint}/GetAlbumByCategory`; //eslint-disable-line no-unused-vars

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

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
  const url = `/get_patient_allergy/${patient_id}`;
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
  const url = `/create_patient_allergy`;
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
  const url = `/update_patient_allergy/${patient_id}`;
  const res = await client.put(url, payload, withPatientV1Base());
  if (!res.ok) console.log('[ALLERGY v1][PUT]', url, res.status, payload, res.data);
  return res;
};

const deletePatientAllergyV1 = async (patient_allergy_id) => {
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

// **********************  GET REQUESTS *************************
const getPatient = async (patientID, maskNRIC = true) => {
  let params;
  if (patientID !== null) {
    params = { patientID, maskNRIC };
  } else {
    params = { maskNRIC };
  }
  return client.get(endpoint, params);
};

const getPatientList = async (maskNRIC = true, patientStatus = null) => {
  return client.get(patientList, { maskNRIC, patientStatus });
};

const getPatientListByLoggedInCaregiver = async (maskNRIC = true, patientStatus = null) => {
  return client.get(patientListByUserId, { maskNRIC, patientStatus });
};

const getPatientStatusCountList = async () => client.get(patientStatusCountList, {});

const getPatientAllergy = async (patientID) => client.get(patientAllergy, { patientID });

const getPatientVitalList = async (patientID) => client.get(patientVitalList, { patientID });

const getPatientPrescriptionList = async (patientID) =>
  client.get(patientPrescriptionList, { patientID });

const getPatientProblemLog = async (patientID) => client.get(patientProblemLog, { patientID });

const getPatientMedicalHistory = async (patientID) =>
  client.get(patientMedicalHistory, { patientID });

const getPatientMedication = async (medicationID) => client.get(medicationEndpoint, { medicationID });

const getPatientRoutine = async (patientID) => client.get(patientRoutine, { patientID });

const getPatientMobility = async (patientID) => client.get(patientMobility, { patientID });

const getPatientPhoto = async (patientID) => client.get(photoEndpoint, { patientID });

const getPatientPhotoByCategory = async (patientID, albumCategoryListID) =>
  client.get(patientPhoto, { patientID, albumCategoryListID });

// **********************  POST REQUESTS *************************
const addPatient = (patientFormData) => {
  const patientData = new FormData();

  for (const key in patientFormData.patientInfo) {
    let value = patientFormData.patientInfo[key];

    // do not append 'IsChecked' to patientData
    if (key === 'IsChecked') continue;
    else if (key === 'EndDate' && value?.getTime?.() === 0) {
      value = '';
    }

    // if no profile image is uploaded, don't use profile pic as a parameter
    if (key === 'UploadProfilePicture' && Object.values(value).every((val) => val === '')) {
      continue;
    }

    if (key === 'NRIC') value = String(value || '').toUpperCase();
    if (value instanceof Date) value = value.toISOString().split('T')[0];

    const param = `patientAddDTO.${key}`;
    patientData.append(param, value);
  }

  addPatientForm(patientFormData.guardianInfo, 'GuardianAddDto', patientData);
  addPatientForm(patientFormData.allergyInfo, 'AllergyAddDto', patientData);

  const headers = { 'Content-Type': 'multipart/form-data' };
  return client.post(patientAdd, patientData, { headers });
};

// AddPatientAllergy is used in AddPatientAllergyModal.js - Joel
const AddPatientAllergy = async (patientID, allergyData) => {
  const payload = {
    patientID,
    allergyListID: allergyData.AllergyListID,
    allergyReactionListID: allergyData.AllergyReactionListID,
    allergyRemarks: allergyData.AllergyRemarks,
  };
  return client.post(patientAllergyAdd, payload);
};

const AddPatientVital = async (patientID, vitalData) => {
  const payload = {
    PatientID: patientID,
    Temperature: vitalData.temperature,
    SystolicBP: vitalData.systolicBP,
    DiastolicBP: vitalData.diastolicBP,
    HeartRate: vitalData.heartRate,
    SpO2: vitalData.spO2,
    BloodSugarLevel: vitalData.bloodSugarLevel,
    Height: vitalData.height,
    Weight: vitalData.weight,
    VitalRemarks: vitalData.vitalRemarks,
    AfterMeal: vitalData.afterMeal,
  };
  return client.post(patientVitalAdd, payload);
};

const addPatientProblemLog = async (patientID, userID, problemLogData) => {
  const payload = {
    userID,
    patientID,
    problemLogRemarks: problemLogData.problemLogRemarks,
    problemLogListID: problemLogData.problemLogListID,
  };
  return client.post(patientProblemLogAdd, payload);
};

const AddPatientMedicalHistory = async (patientID, medicalData) => {
  const payload = {
    PatientID: patientID,
    medicalDetails: medicalData.medicalDetails,
    informationSource: medicalData.informationSource,
    medicalRemarks: medicalData.medicalRemarks,
    medicalEstimatedDate: medicalData.medicalEstimatedDate,
  };
  return client.post(patientMedicalHistoryAdd, payload);
};

const addPatientMedication = async (patientID, medicationData) => {
  const payload = {
    patientID,
    prescriptionName: medicationData.prescriptionName,
    dosage: medicationData.dosage,
    administerTime: medicationData.administerTime,
    instruction: medicationData.instruction,
    startDateTime: medicationData.startDateTime,
    endDateTime: medicationData.endDateTime,
    prescriptionRemarks: medicationData.prescriptionRemarks,
  };
  return client.post(patientMedicationAdd, payload);
};

const addPatientMedicalHistory = async (patientID, hxData) => {
  const payload = {
    patientID,
    informationSource: hxData.informationSource,
    medicalDetails: hxData.medicalDetails,
    medicalRemarks: hxData.medicalRemarks,
    medicalEstimatedDate: hxData.medicalEstimatedDate,
  };
  return client.post(patientMedicalHistoryAdd, payload);
};

const addPatientPrescription = async (patientID, prescriptionData) => {
  const payload = {
    patientID,
    prescriptionListID: prescriptionData.prescriptionListID,
    dosage: prescriptionData.dosage,
    frequencyPerDay: prescriptionData.frequencyPerDay,
    instruction: prescriptionData.instruction,
    startDate: prescriptionData.startDate,
    endDate: prescriptionData.endDate,
    afterMeal: prescriptionData.afterMeal,
    prescriptionRemarks: prescriptionData.prescriptionRemarks,
    isChronic: prescriptionData.isChronic,
  };
  return client.post(patientPrescriptionAdd, payload);
};

const addPatientMobility = async (patientID, mobilityData) => {
  const payload = {
    patientID,
    mobilityListId: mobilityData.mobilityListId,
    mobilityListDesc: mobilityData.mobilityListDesc,
    mobilityRemark: mobilityData.mobilityRemark,
    isRecovered: mobilityData.isRecovered,
  };
  return client.post(patientMobilityAdd, payload);
};

const addPatientPhoto = async (patientID, photoData) => {
  const photoFormData = new FormData();

  // Append the image file if it exists, using the key "Photo"
  if (photoData.Photo) {
    photoFormData.append('Photo', {
      uri: photoData.Photo.uri,
      name: photoData.Photo.name,
      type: photoData.Photo.type,
    });
  }

  // Holiday experience fields
  if (photoData.HolidayExperienceAddDTO) {
    const he = photoData.HolidayExperienceAddDTO;
    photoFormData.append('HolidayExperienceAddDTO.CountryListID', he.CountryListID ?? '');
    let startDate = he.StartDate instanceof Date ? he.StartDate.toISOString() : he.StartDate || '';
    let endDate = he.EndDate instanceof Date ? he.EndDate.toISOString() : he.EndDate || '';
    photoFormData.append('HolidayExperienceAddDTO.StartDate', startDate);
    photoFormData.append('HolidayExperienceAddDTO.EndDate', endDate);
  } else {
    if (photoData.CountryListID != null) {
      photoFormData.append('HolidayExperienceAddDTO.CountryListID', photoData.CountryListID);
    }
    if (photoData.StartDate) {
      const sd = photoData.StartDate instanceof Date ? photoData.StartDate.toISOString() : photoData.StartDate;
      photoFormData.append('HolidayExperienceAddDTO.StartDate', sd);
    }
    if (photoData.EndDate) {
      const ed = photoData.EndDate instanceof Date ? photoData.EndDate.toISOString() : photoData.EndDate;
      photoFormData.append('HolidayExperienceAddDTO.EndDate', ed);
    }
  }

  // Remaining fields
  photoFormData.append('PhotoDetails', photoData.PhotoDetails || '');
  photoFormData.append('AlbumCategoryName', photoData.AlbumCategoryName || '');
  photoFormData.append('AlbumCategoryListID', photoData.AlbumCategoryListID ?? '');
  photoFormData.append('PatientID', patientID);

  return client.post(patientPhotoAdd, photoFormData);
};

// ************************* UPDATE REQUESTS *************************
const updatePatient = async (data) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  const headers = { 'Content-Type': 'multipart/form-data' };
  return client.put(patientUpdate, formData, { headers });
};

const updatePatientAllergy = async (patientID, allergyData) => {
  const payload = {
    patientID,
    allergyListID: allergyData.AllergyListID,
    allergyReactionListID: allergyData.AllergyReactionListID,
    allergyRemarks: allergyData.AllergyRemarks,
  };
  return client.put(patientAllergyUpdate, payload);
};

const deletePatientAllergy = async (allergyData) => {
  const payload = { allergyID: allergyData.allergyID };
  return client.put(patientAllergyDelete, payload);
};

const updatePatientVital = async (patientID, vitalData) => {
  const payload = {
    PatientID: patientID,
    Temperature: vitalData.temperature,
    SystolicBP: vitalData.systolicBP,
    DiastolicBP: vitalData.diastolicBP,
    HeartRate: vitalData.heartRate,
    SpO2: vitalData.spO2,
    BloodSugarLevel: vitalData.bloodSugarLevel,
    Height: vitalData.height,
    Weight: vitalData.weight,
    VitalRemarks: vitalData.vitalRemarks,
    AfterMeal: vitalData.afterMeal,
  };
  return client.put(patientVitalUpdate, payload);
};

const deletePatientVital = async (vitalID) => client.put(patientVitalDelete, { vitalID });

const updateMedication = async (patientID, medicationData) => {
  const payload = {
    patientID,
    medicationID: medicationData.medicationID,
    prescriptionName: medicationData.prescriptionName,
    dosage: medicationData.dosage,
    administerTime: medicationData.administerTime,
    instruction: medicationData.instruction,
    startDateTime: medicationData.startDateTime,
    endDateTime: medicationData.endDateTime,
    prescriptionRemarks: medicationData.prescriptionRemarks,
  };
  return client.put(patientMedicationUpdate, payload);
};

const updateProblemLog = async (patientID, userID, logData) => {
  const payload = {
    userID,
    patientID,
    problemLogID: logData.problemLogID,
    problemLogListID: logData.problemLogListID,
    problemLogRemarks: logData.problemLogRemarks,
  };
  return client.put(patientProblemLogUpdate, payload);
};

const updatePrescription = async (patientID, prescriptionData) => {
  const payload = {
    patientID,
    prescriptionID: prescriptionData.prescriptionID,
    prescriptionListID: prescriptionData.prescriptionListID,
    dosage: prescriptionData.dosage,
    frequencyPerDay: prescriptionData.frequencyPerDay,
    instruction: prescriptionData.instruction,
    startDate: prescriptionData.startDate,
    endDate: prescriptionData.endDate,
    afterMeal: prescriptionData.afterMeal,
    prescriptionRemarks: prescriptionData.prescriptionRemarks,
    isChronic: prescriptionData.isChronic,
  };
  return client.put(patientPrescriptionUpdate, payload);
};

const updateMobility = async (patientID, mobilityData) => {
  const payload = {
    patientID,
    mobilityId: mobilityData.mobilityId,
    mobilityListId: mobilityData.mobilityListId,
    mobilityListDesc: mobilityData.mobilityListDesc,
    mobilityRemark: mobilityData.mobilityRemark,
    isRecovered: mobilityData.isRecovered,
  };
  return client.put(patientMobilityUpdate, payload);
};

const updatePatientPhoto = async (patientID, photoData) => {
  const photoFormData = new FormData();

  // Append the image file if it exists.
  if (photoData.Photo) {
    if (typeof photoData.Photo === 'object' && photoData.Photo.uri) {
      photoFormData.append('Photo', {
        uri: photoData.Photo.uri,
        name: photoData.Photo.name,
        type: photoData.Photo.type,
      });
    } else if (typeof photoData.Photo === 'string') {
      // No new photo; send empty so that the backend retains the existing image.
      photoFormData.append('Photo', '');
    }
  } else {
    photoFormData.append('Photo', '');
  }

  // Append holiday experience fields conditionally.
  if (photoData.IsHoliday) {
    const holidayExpID =
      photoData.HolidayExperienceUpdateDTO?.HolidayExpID || '';
    const countryListID =
      photoData.CountryListID ||
      photoData.HolidayExperienceUpdateDTO?.CountryListID ||
      '';

    let startDate =
      photoData.StartDate ||
      photoData.HolidayExperienceUpdateDTO?.StartDate ||
      '';
    if (startDate instanceof Date) startDate = startDate.toISOString();

    let endDate =
      photoData.EndDate || photoData.HolidayExperienceUpdateDTO?.EndDate || '';
    if (endDate instanceof Date) endDate = endDate.toISOString();

    photoFormData.append('HolidayExperienceUpdateDTO.HolidayExpID', holidayExpID);
    photoFormData.append('HolidayExperienceUpdateDTO.CountryListID', countryListID);
    photoFormData.append('HolidayExperienceUpdateDTO.StartDate', startDate || '');
    photoFormData.append('HolidayExperienceUpdateDTO.EndDate', endDate || '');
  } else {
    photoFormData.append(
      'HolidayExperienceUpdateDTO',
      JSON.stringify({
        HolidayExpID: null,
        CountryListID: null,
        StartDate: null,
        EndDate: null,
      }),
    );
  }

  // Remaining fields
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

// ************************* DELETE REQUESTS *************************
const deleteMedication = async (medicationData) => {
  const payload = { medicationID: medicationData.medicationID };
  return client.put(patientMedicationDelete, payload);
};

const deleteMedicalHistory = async (medHistoryData) => {
  const payload = { medicalHistoryID: medHistoryData.medicalHistoryID };
  return client.put(patientMedicalHistoryDelete, payload);
};

const deleteProblemLog = async (logData) => {
  const payload = { problemLogID: logData.problemLogID };
  return client.put(patientProblemLogDelete, payload);
};

const deletePrescription = async (prescriptionData) => {
  const payload = { prescriptionID: prescriptionData.prescriptionID };
  return client.put(patientPrescriptionDelete, payload);
};

const deleteMobility = async (mobilityData) => {
  const payload = { mobilityId: mobilityData.mobilityId };
  return client.put(patientMobilityDelete, payload);
};

const deletePatientPhoto = async (photoData) => {
  const payload = { patientPhotoID: photoData.patientPhotoID };
  return client.put(patientPhotoDelete, payload);
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
  getPatient,
  getPatientList,
  getPatientListByLoggedInCaregiver,
  getPatientStatusCountList,
  getPatientAllergy,
  getPatientVitalList,
  getPatientPrescriptionList,
  getPatientProblemLog,
  getPatientMedicalHistory,
  getPatientMedication,
  getPatientRoutine,
  getPatientMobility,
  getPatientPhoto,
  getPatientPhotoByCategory,

  addPatient,
  AddPatientAllergy,
  AddPatientVital,
  addPatientProblemLog,
  AddPatientMedicalHistory,
  addPatientMedication,
  addPatientMedicalHistory,
  addPatientPrescription,
  addPatientMobility,
  addPatientPhoto,

  updatePatient,
  updatePatientAllergy,
  deletePatientAllergy,
  updatePatientVital,
  deletePatientVital,
  updateMedication,
  deleteMedication,
  deleteMedicalHistory,
  deleteProblemLog,
  updateProblemLog,
  updatePrescription,
  deletePrescription,
  updateMobility,
  deleteMobility,
  updatePatientPhoto,
  deletePatientPhoto,

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
  

};
