// Scoped metadata only: no headers, credentials, query/record values or bodies.
const bases = new Set([
  'http://10.96.188.186:5681/api/v1',
  'http://10.96.188.186/api/v1',
  'http://10.96.188.185/api/v1',
  'http://10.96.188.180/api/v1',
]);
const fields = new Set([
  'activities',
  'centre_activities',
  'preferences',
  'recommendations',
  'exclusions',
  'patients',
  'data',
  'results',
  'items',
  'detail',
  'message',
  'id',
  'patient_id',
  'patientID',
  'PatientID',
  'name',
  'title',
  'activity_id',
  'activityID',
  'centre_activity_id',
  'day_of_week',
  'start_time',
  'end_time',
  'start_date',
  'end_date',
  'is_deleted',
]);
const kind = (value) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
const shape = (value, depth = 0) => {
  const result = { type: kind(value) };
  if (Array.isArray(value)) {
    if (value.length && depth < 2) {
      result.item_shape = shape(value[0], depth + 1);
    }
  } else if (value && typeof value === 'object' && depth < 3) {
    result.fields = {};
    Object.keys(value)
      .filter((key) => fields.has(key))
      .forEach((key) => {
        result.fields[key] = shape(value[key], depth + 1);
      });
  }
  return result;
};
const detailClass = (value) => {
  if (Array.isArray(value)) {
    return 'VALIDATION_ERROR';
  }
  if (typeof value !== 'string') {
    return 'NO_STRUCTURED_DETAIL';
  }
  if (value === 'No Routine records for this patient') {
    return 'NO_ROUTINE_RECORDS';
  }
  if (/^Patient \d+ not found$/i.test(value)) {
    return 'PATIENT_NOT_FOUND';
  }
  if (/^Patient not found or not accessible$/i.test(value)) {
    return 'PATIENT_NOT_FOUND_OR_INACCESSIBLE';
  }
  if (/^(You do not have permission|Forbidden)/i.test(value)) {
    return 'PERMISSION_DENIED';
  }
  if (
    /^(Not authenticated|Invalid token|Invalid authentication|Could not validate credentials)/i.test(
      value,
    )
  ) {
    return 'AUTHENTICATION_ERROR';
  }
  return 'OTHER_DETAIL_REDACTED';
};
export function observeActivityRead(response, requestConfig, exceptionCode) {
  try {
    const config = requestConfig || response?.config;
    if (
      !config ||
      String(config.method || '').toUpperCase() !== 'GET' ||
      typeof config.url !== 'string'
    ) {
      return null;
    }
    const path = config.url.split(/[?#]/, 1)[0];
    const match = path.match(
      /^(?:\/api\/v1)?\/(routines|aggregated\/activity-preference-table)\/patient\/(\d+)\/?$/,
    );
    if (!match) {
      return null;
    }
    const status =
      Number.isInteger(response?.status) &&
      response.status >= 100 &&
      response.status <= 599
        ? response.status
        : null;
    const actualBase =
      typeof config.baseURL === 'string'
        ? config.baseURL.replace(/\/$/, '')
        : '';
    const transportClasses = {
      ECONNABORTED: 'TIMEOUT_ERROR',
      ETIMEDOUT: 'TIMEOUT_ERROR',
      ERR_NETWORK: 'NETWORK_ERROR',
      ERR_CANCELED: 'CANCELED',
    };
    const result = {
      route_template: `GET ${
        bases.has(actualBase) ? actualBase : 'UNRECOGNISED_BASE_REDACTED'
      }/${match[1]}/patient/{patient_id}`,
      http_status: status,
      error_class:
        status === null
          ? transportClasses[exceptionCode] || 'NO_RESPONSE'
          : status >= 200 && status < 300
          ? 'NONE'
          : detailClass(response?.data?.detail),
      response_shape: shape(response?.data),
    };
    // eslint-disable-next-line no-console
    console.log('[PEAR_READ_DIAG]', JSON.stringify(result));
    return result;
  } catch {
    return null; // Never change requests, refresh handling or application state.
  }
}
