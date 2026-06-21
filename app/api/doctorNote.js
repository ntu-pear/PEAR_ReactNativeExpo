/*eslint eslint-comments/no-unlimited-disable: error */
import client, { PATIENT_V1_BASE } from 'app/api/client';

/*
 * List all end points here
 */
const endpoint = '/DoctorNote';

const withPatientV1Base = (cfg = {}) => ({
  baseURL: PATIENT_V1_BASE,
  timeout: 15000,
  ...cfg,
});

const normalizeDoctorNote = (note = {}) => ({
  doctorNoteId: note.doctorNoteId ?? note.id ?? note.DoctorNoteID ?? note.doctor_note_id,
  doctorName: note.doctorName ?? note.DoctorName ?? note.doctor_name ?? '-',
  doctorRemarks: note.doctorRemarks ?? note.DoctorRemarks ?? note.remarks ?? note.notes ?? '',
  date: note.date ?? note.createdDate ?? note.CreatedDate ?? note.created_date ?? note.modifiedDate ?? new Date().toISOString(),
  ...note,
});

const toMobileListResponse = (res) => {
  const body = res?.data ?? {};
  const raw = Array.isArray(body)
    ? body
    : Array.isArray(body.data)
      ? body.data
      : Array.isArray(body.results)
        ? body.results
        : [];

  return {
    ...res,
    data: {
      ...body,
      data: raw.map(normalizeDoctorNote),
    },
  };
};

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS ************************

// params: patientID
// purpose: receive doctor's note for specific patient
const getDoctorNote = async (patientID) => {
  const primary = await client.get(
    `${endpoint}/GetDoctorNotesByPatient`,
    { patient_id: patientID, pageNo: 0, pageSize: 100 },
    withPatientV1Base(),
  );

  if (primary.ok || (primary.status && primary.status !== 404)) {
    return toMobileListResponse(primary);
  }

  const fallback = await client.get(endpoint, { patientID }, withPatientV1Base());
  return toMobileListResponse(fallback);
};

// **********************  POST REQUESTS *************************

// ************************* UPDATE REQUESTS *************************

/*
 * Expose your end points here
 */
export default {
  getDoctorNote,
};
