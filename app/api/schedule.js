/* eslint eslint-comments/no-unlimited-disable: error */
import { create } from 'apisauce';
import { SCHEDULER_V1_BASE } from 'app/api/client';
import { Buffer } from 'buffer';
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
console.log('🧭 Using Scheduler Base:', SCHEDULER_V1_BASE);

// Attach Authorization header (JWT token only)
schedulerClient.addAsyncRequestTransform(async (request) => {
  const jwtToken = await authStorage.getToken('userAuthTokenV1');
  if (jwtToken) {
    request.headers.Authorization = `Bearer ${jwtToken}`;
    console.log('🔑 Using JWT token for Scheduler');
  }
});


/*
 * Endpoints
 */
const getScheduleV1 = async () => {
  console.log('🚀 Scheduler GET request:', SCHEDULER_V1_BASE + '/schedule/getSchedule/');
  return schedulerClient.get('/schedule/getSchedule/');
};

const generateScheduleV1 = async () => schedulerClient.get('/schedule/generate/');
const refreshScheduleV1 = async () => schedulerClient.get('/schedule/regenerate/');
const adhocScheduleV1 = async (payload) => schedulerClient.put('/schedule/adhoc/', payload);

// ✅ Wrapper for unified frontend call
const getPatientWeeklySchedule = async () => {
  console.log('🧭 [Scheduler v1] Calling getScheduleV1()...');
  return await getScheduleV1();
};

/*
 * Export API
 */
export default {
  getScheduleV1,
  generateScheduleV1,
  refreshScheduleV1,
  adhocScheduleV1,
  getPatientWeeklySchedule,
};
