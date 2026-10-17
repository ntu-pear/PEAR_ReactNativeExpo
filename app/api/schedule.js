/* eslint eslint-comments/no-unlimited-disable: error */
import { create } from 'apisauce';
import { SCHEDULER_V1_BASE } from 'app/api/client';
import { patientScheduleParameters } from 'app/utility/patientScheduleRead';
import authStorage from 'app/auth/authStorage';

/*
 * Scheduler v1 client (self-contained)
 */
const schedulerClient = create({
  baseURL: SCHEDULER_V1_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

// Debug base URL
console.log('Using Scheduler Base:', SCHEDULER_V1_BASE);

// Attach Authorization header
schedulerClient.addAsyncRequestTransform(async (request) => {
  // An administration pins its bearer after the active screen/session check.
  if (request.headers.Authorization) return;
  const jwtToken = await authStorage.getToken('userAuthTokenV1');
  if (jwtToken) {
    request.headers.Authorization = `Bearer ${jwtToken}`;
  }
});

/*
 * Endpoints
 */
const getScheduleV1 = async () => {
  console.log(
    'Scheduler GET request:',
    SCHEDULER_V1_BASE + '/schedule/getSchedule/',
  );
  return schedulerClient.get('/schedule/getSchedule/');
};

const generateScheduleV1 = async () =>
  schedulerClient.get('/schedule/generate/');
const refreshScheduleV1 = async () =>
  schedulerClient.get('/schedule/regenerate/');
const adhocScheduleV1 = async (payload) =>
  schedulerClient.put('/schedule/adhoc/', payload);

const getMedicationScheduleV1 = async () =>
  schedulerClient.get('/MedicationSchedule/get/');

const updateMedicationScheduleV1 = async (payload, isCurrent = () => true) => {
  const token = await authStorage.getToken('userAuthTokenV1');
  if (!isCurrent()) return { ok: false, status: 409, notSent: true };
  if (!token) return { ok: false, status: 401, notSent: true };
  return schedulerClient.put('/MedicationSchedule/update/', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Patient reads never fall back to centre-wide reads or generate a schedule.
const getPatientScheduleV1 = async (patientId, date) => {
  const params = patientScheduleParameters(patientId, date);
  return schedulerClient.get(
    '/schedule/patient/' + params.patientId + '/',
    params.date ? { date: params.date } : {},
  );
};

// Wrapper for existing centre-wide Dashboard callers
const getPatientWeeklySchedule = async () => {
  console.log('[Scheduler v1] Calling getScheduleV1()...');
  return await getScheduleV1();
};

/*
 * Export API
 */
export default {
  getScheduleV1,
  generateScheduleV1,
  generateThisWeek: generateScheduleV1,
  refreshScheduleV1,
  adhocScheduleV1,
  getPatientWeeklySchedule,
  getPatientScheduleV1,
  getMedicationScheduleV1,
  updateMedicationScheduleV1,
};
