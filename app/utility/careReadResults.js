import { centreDay } from 'app/utility/centreClock';
import { patientScheduleResult } from 'app/utility/patientScheduleRead';

export const shiftDay = (day, days) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
export const weekMonday = (day) => {
  const date = new Date(`${day}T12:00:00Z`);
  return shiftDay(day, -((date.getUTCDay() + 6) % 7));
};
export const requireRead = (response, noun) => {
  if (response?.ok && response.status === 200) {
    return;
  }
  const status = response?.status;
  const error = new Error(
    status === 401
      ? 'Your session has expired. Sign in again.'
      : status === 403
      ? `You do not have permission to view ${noun}.`
      : `The ${noun} could not be loaded. Please try again.`,
  );
  error.retry = status !== 401 && status !== 403;
  throw error;
};
export const previewResult = (response, now = new Date()) => {
  requireRead(response, 'next-week preview');
  const body = response.data;
  const start = shiftDay(weekMonday(centreDay(now)), 7);
  const end = shiftDay(start, 6);
  if (
    String(body?.Status) !== '200' ||
    body.Preview !== true ||
    !Array.isArray(body.Data)
  ) {
    throw new Error('The next-week preview response could not be verified.');
  }
  const seen = new Set();
  const patients = body.Data.map((row) => {
    if (
      String(row.StartDate).slice(0, 10) !== start ||
      String(row.EndDate).slice(0, 10) !== end ||
      seen.has(String(row.PatientID))
    ) {
      throw new Error(
        'The preview dates or patient identity could not be verified.',
      );
    }
    seen.add(String(row.PatientID));
    const result = patientScheduleResult(
      { ok: true, status: 200, data: { Status: '200', Data: [row] } },
      row.PatientID,
    );
    if (result.error) {
      throw new Error('The preview schedule could not be verified.');
    }
    return {
      id: String(row.PatientID),
      name: result.patientName,
      days: result.weekly,
    };
  });
  return {
    patients,
    start,
    end,
    builtAt: typeof body.BuiltAt === 'string' ? body.BuiltAt : '',
  };
};
export const historyResult = (response, patientId, page) => {
  requireRead(response, 'patient history');
  const body = response.data;
  if (
    !Array.isArray(body?.data) ||
    Number(body.pageNo) !== page ||
    !Number.isInteger(Number(body.totalPages)) ||
    Number(body.totalPages) < 0 ||
    body.data.some((row) => String(row.patient_id) !== String(patientId))
  ) {
    throw new Error(
      'The history response did not match this patient and page.',
    );
  }
  return {
    rows: body.data,
    totalPages: Number(body.totalPages),
    totalRecords: Number(body.totalRecords) || 0,
  };
};

// Preserve a supplied UTC/offset suffix; never invent a zone for a naive timestamp.
export const reportedTime = (value) =>
  typeof value === 'string'
    ? value.replace('T', ' ').replace(/\.\d+(?=Z|[+-]\d\d:\d\d|$)/, '')
    : '-';
