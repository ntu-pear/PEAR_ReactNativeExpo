/* eslint eslint-comments/no-unlimited-disable: error */
import scheduleApi from 'app/api/schedule';

/*
 * Dashboard API — wrapper around Scheduler v1
 * The Dashboard screen displays weekly/daily patient schedules.
 * This simply delegates calls to Scheduler Service v1 endpoints.
 */

// ------------------- GET REQUESTS -------------------

// Fetch the weekly schedule for all patients (used in Dashboard & Patient Schedule)
const getDashboardSchedule = async () => {
  console.log('🧭 [Dashboard API] Fetching weekly patient schedule via Scheduler Service...');
  const response = await scheduleApi.getPatientWeeklySchedule();

  // Safely handle different response structures
  const scheduleData = response.data?.data ?? response.data ?? [];

  console.log(
    '📦 [Dashboard API] Response status:',
    response.status,
    '| Schedule entries:',
    Array.isArray(scheduleData) ? scheduleData.length : 'not an array'
  );

  return {
    ok: response.ok,
    status: response.status,
    data: scheduleData,
  };
};

// ------------------- POST / UPDATE (future) -------------------
// You can extend here if dashboard analytics or filters are handled server-side later.

// ------------------- EXPORT -------------------
export default {
  getDashboardSchedule,
};
