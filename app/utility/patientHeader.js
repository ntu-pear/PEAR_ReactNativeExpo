import { normalizePatientV1 } from 'app/api/patient';

export const patientFromApiResponse = (response) => {
  const raw = response?.data?.data ?? response?.data ?? {};
  return normalizePatientV1(raw);
};

export const patientProfileLines = (patient = {}) => {
  const full = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  const line1 =
    patient.preferredName ||
    patient.fullName ||
    full ||
    'Patient';
  const line2 = full && full !== line1 ? full : '';
  return { line1, line2 };
};
