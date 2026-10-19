import client, { SCHEDULER_V1_BASE, LOGGING_V1_BASE } from 'app/api/client';
import { exactNumericPatientId } from 'app/utility/medicationAdminister';

export const getNextWeekPreview = () =>
  client.get('/schedule/preview/', {}, { baseURL: SCHEDULER_V1_BASE });

export const getPatientHistory = (patientId, page = 0) => {
  const id = exactNumericPatientId(patientId);
  if (!Number.isInteger(page) || page < 0) {
    throw new Error('Invalid history page.');
  }
  return client.get(
    `/Logs/Patient/${id}/history`,
    { pageNo: page, pageSize: 20 },
    { baseURL: LOGGING_V1_BASE },
  );
};
