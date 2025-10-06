/* eslint eslint-comments/no-unlimited-disable: error */
import { create } from 'apisauce';
import { SCHEDULER_V1_BASE } from 'app/api/client';
import { Buffer } from 'buffer';   // ✅ must be imported before usage
import authStorage from 'app/auth/authStorage';

/*
 * Scheduler v1 client
 */
const schedulerClient = create({
  baseURL: SCHEDULER_V1_BASE, 
  timeout: 15000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

// ✅ Debug base URL to confirm correct server
console.log('🧭 Using Scheduler Base:', SCHEDULER_V1_BASE);

// ✅ Attach Authorization header
schedulerClient.addAsyncRequestTransform(async (request) => {
  // Try JWT first (normal production path)
  const jwtToken = await authStorage.getToken('userAuthTokenV1');
  if (jwtToken) {
    request.headers.Authorization = `Bearer ${jwtToken}`;
    console.log('🔑 Using JWT token for Scheduler');
  } else {
    // TEMP fallback for Scheduler auth testing (Basic auth)
    const credentials = Buffer.from('jess@gmail.com:Supervisor!23').toString('base64');
    request.headers.Authorization = `Basic ${credentials}`;
    console.log('🧩 Using Basic Auth fallback for Scheduler');
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
const refreshScheduleV1 = async () => schedulerClient.get('/schedule/refresh/');
const adhocScheduleV1 = async (payload) => schedulerClient.put('/schedule/adhoc/', payload);

/*
 * Export API
 */
export default {
  getScheduleV1,
  generateScheduleV1,
  refreshScheduleV1,
  adhocScheduleV1,
};
