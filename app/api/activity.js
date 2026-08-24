/*eslint eslint-comments/no-unlimited-disable: error */
import client, { ACTIVITY_V1_BASE } from 'app/api/client';

/*
 * List all end points here
 */
const centreActivityPreferences = '/centre_activity_preferences';
const centreActivities = '/centre_activities';
const centreActivityRecommendations = '/centre_activity_recommendations';
const centreActivityExclusions = '/centre_activity_exclusions';
const activities = '/activities';
const routines = '/routines';

const withActivityV1Base = (cfg = {}) => ({
  baseURL: ACTIVITY_V1_BASE,
  timeout: 15000,
  ...cfg,
});

const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const isDeletedRow = (row = {}) =>
  Boolean(row.is_deleted ?? row.isDeleted ?? row.IsDeleted);

const normalizePreference = (pref = {}) => {
  const centreActivityID =
    pref.CentreActivityID ?? pref.centreActivityID ?? pref.centre_activity_id;
  return {
    ...pref,
    CentreActivityPreferenceID:
      pref.CentreActivityPreferenceID ??
      pref.centreActivityPreferenceID ??
      pref.id,
    centreActivityPreferenceID:
      pref.centreActivityPreferenceID ??
      pref.CentreActivityPreferenceID ??
      pref.id,
    CentreActivityID: centreActivityID,
    centreActivityID,
    PatientID: pref.PatientID ?? pref.patientID ?? pref.patient_id,
    patientID: pref.patientID ?? pref.PatientID ?? pref.patient_id,
    activityTitle:
      pref.activityTitle ??
      pref.ActivityTitle ??
      pref.activity_title ??
      pref.centre_activity_title ??
      pref.title ??
      pref.activity?.title ??
      '',
    isLike: pref.isLike ?? pref.IsLike ?? pref.is_like ?? 0,
  };
};

const normalizeCentreActivity = (activity = {}) => {
  const centreActivityID =
    activity.CentreActivityID ?? activity.centreActivityID ?? activity.id;
  const activityID =
    activity.activity_id ?? activity.activityID ?? activity.ActivityID;
  return {
    ...activity,
    CentreActivityID: centreActivityID,
    centreActivityID,
    activityID,
    activity_id: activityID,
    activityTitle:
      activity.activityTitle ??
      activity.ActivityTitle ??
      activity.activity_title ??
      activity.title ??
      activity.activity?.title ??
      '',
    isDeleted: isDeletedRow(activity),
  };
};

const toMobileListResponse = (res, normalizer) => ({
  ...res,
  data: {
    ...(res?.data && !Array.isArray(res.data) ? res.data : {}),
    data: unwrapArray(res?.data).map(normalizer),
  },
});

/*
 * List all functions here
 * Refer to this api doc: https://github.com/infinitered/apisauce
 */

// **********************  GET REQUESTS *************************

const getActivityPreference = async (patientID) => {
  const res = await client.get(
    `${centreActivityPreferences}/patient/${patientID}`,
    {},
    withActivityV1Base(),
  );
  return toMobileListResponse(res, normalizePreference);
};

const getCentreActivities = async () => {
  const res = await client.get(`${centreActivities}/`, {}, withActivityV1Base());
  return toMobileListResponse(res, normalizeCentreActivity);
};

const getActivities = async () => {
  const res = await client.get(`${activities}/`, {}, withActivityV1Base());
  return toMobileListResponse(res, (activity = {}) => ({
    ...activity,
    id: activity.id ?? activity.activityID ?? activity.ActivityID,
    activityTitle:
      activity.title ??
      activity.activityTitle ??
      activity.ActivityTitle ??
      activity.activity_title ??
      '',
    isDeleted: isDeletedRow(activity),
  }));
};

export const isMissingActivityTitle = (title) => {
  const value = String(title ?? '').trim();
  return !value || /^untitled activity$/i.test(value) || /^activity \d*$/i.test(value);
};

export const buildActivityTitleMap = (centreActivitiesList = [], activitiesList = []) => {
  // Same join as PEAR_WebFE origin/main: centre_activity.activity_id -> activity.title.
  const catalogTitles = {};
  activitiesList.forEach((activity) => {
    if (isDeletedRow(activity)) return;
    const id = activity.id ?? activity.activityID;
    const title = activity.title ?? activity.activityTitle;
    if (id != null && !isMissingActivityTitle(title)) {
      catalogTitles[String(id)] = title;
    }
  });

  const map = {};
  centreActivitiesList.forEach((centreActivity) => {
    if (isDeletedRow(centreActivity)) return;
    const centreId =
      centreActivity.centreActivityID ??
      centreActivity.CentreActivityID ??
      centreActivity.id;
    const activityId =
      centreActivity.activity_id ??
      centreActivity.activityID ??
      centreActivity.ActivityID;
    const title = catalogTitles[String(activityId)] || '';
    if (centreId != null && title) {
      map[String(centreId)] = title;
    }
  });
  return map;
};

export const applyActivityTitles = (items = [], titleMap = {}) =>
  items.map((item) => {
    const id = item.centreActivityID ?? item.CentreActivityID;
    const mapped = titleMap[String(id)];
    if (mapped) return { ...item, activityTitle: mapped };
    if (!isMissingActivityTitle(item.activityTitle)) return item;
    return { ...item, activityTitle: item.activityTitle || '' };
  });

export const keepNamedActivities = (items = []) =>
  items.filter((item) => !isMissingActivityTitle(item.activityTitle));

export const mergeCataloguePreferences = (
  centreActivitiesList = [],
  activitiesList = [],
  preferencesList = [],
) => {
  const titleMap = buildActivityTitleMap(centreActivitiesList, activitiesList);
  const prefByCentreId = {};
  preferencesList.forEach((pref) => {
    const id = pref.centreActivityID ?? pref.CentreActivityID;
    if (id != null) prefByCentreId[String(id)] = pref;
  });

  const rows = [];
  centreActivitiesList.forEach((centreActivity) => {
    if (isDeletedRow(centreActivity)) return;
    const centreId =
      centreActivity.centreActivityID ??
      centreActivity.CentreActivityID ??
      centreActivity.id;
    const title = titleMap[String(centreId)];
    if (centreId == null || isMissingActivityTitle(title)) return;
    const pref = prefByCentreId[String(centreId)] || {};
    rows.push({
      ...pref,
      centreActivityID: centreId,
      CentreActivityID: centreId,
      activityTitle: title,
      isLike: pref.isLike ?? pref.IsLike ?? pref.is_like ?? 0,
      centreActivityPreferenceID:
        pref.centreActivityPreferenceID ?? pref.CentreActivityPreferenceID,
      CentreActivityPreferenceID:
        pref.CentreActivityPreferenceID ?? pref.centreActivityPreferenceID,
    });
  });
  return rows;
};

// **********************  POST REQUESTS *************************

const addActivityPreference = async (patientID, data) => {
  const payload = {
    patient_id: patientID,
    centre_activity_id: data.centreActivityID ?? data.CentreActivityID,
    is_like: data.isLike ?? data.IsLike ?? 0,
    created_by_id: data.createdById ?? data.CreatedById ?? 'MOBILE',
  };

  return await client.post(centreActivityPreferences, payload, withActivityV1Base());
};

// ************************* UPDATE REQUESTS *************************

const updateActivityPreference = async (data) => {
  const id =
    data.CentreActivityPreferenceID ??
    data.centreActivityPreferenceID ??
    data.id;
  const payload = {
    id,
    patient_id: data.PatientID ?? data.patientID ?? data.patient_id,
    centre_activity_id: data.CentreActivityID ?? data.centreActivityID ?? data.centre_activity_id,
    is_like: data.IsLike ?? data.isLike ?? data.is_like ?? 0,
    is_deleted: data.isDeleted ?? data.is_deleted ?? false,
    modified_by_id: data.modifiedById ?? data.ModifiedById ?? 'MOBILE',
  };

  return client.put(`${centreActivityPreferences}/${id}`, payload, withActivityV1Base());
};

const deleteActivityPreference = async (data) => {
  const id =
    data.centreActivityPreferenceID ??
    data.CentreActivityPreferenceID ??
    data.id;
  return client.delete(`${centreActivityPreferences}/${id}`, {}, withActivityV1Base());
};

const convertDayOfWeek = (day) => {
  const bitmask = Number(day);
  const days = [
    { label: 'Monday', bit: 1 },
    { label: 'Tuesday', bit: 2 },
    { label: 'Wednesday', bit: 4 },
    { label: 'Thursday', bit: 8 },
    { label: 'Friday', bit: 16 },
    { label: 'Saturday', bit: 32 },
    { label: 'Sunday', bit: 64 },
  ];

  if (!Number.isFinite(bitmask)) return String(day ?? '');
  return days
    .filter((d) => (bitmask & d.bit) !== 0)
    .map((d) => d.label)
    .join(', ');
};

const normalizeRoutine = (routine = {}) => ({
  id: routine.id,
  activityID: routine.activity_id ?? routine.activityID,
  activityName: routine.name ?? routine.activityName ?? routine.activity?.title ?? '',
  days: convertDayOfWeek(routine.day_of_week ?? routine.dayOfWeek),
  startTime: routine.start_time ?? routine.startTime ?? '',
  endTime: routine.end_time ?? routine.endTime ?? '',
  startDate: routine.start_date ?? routine.startDate ?? '',
  endDate: routine.end_date ?? routine.endDate ?? '',
});

const getPatientRoutine = async (patientID, includeDeleted = false) => {
  const params = includeDeleted ? { include_deleted: true } : {};
  const res = await client.get(
    `${routines}/patient/${patientID}`,
    params,
    withActivityV1Base(),
  );
  return toMobileListResponse(res, normalizeRoutine);
};

const recommendationLabel = (value) => {
  const n = Number(value);
  if (n === 1) return 'Recommended';
  if (n === -1) return 'Not Recommended';
  return 'Neutral';
};

const normalizeRecommendation = (rec = {}) => {
  const doctorRecommendation =
    rec.doctor_recommendation ?? rec.doctorRecommendation ?? rec.DoctorRecommendation ?? 0;
  return {
    ...rec,
    id: rec.id ?? rec.centreActivityRecommendationID ?? rec.CentreActivityRecommendationID,
    centreActivityID:
      rec.centre_activity_id ?? rec.centreActivityID ?? rec.CentreActivityID,
    patientID: rec.patient_id ?? rec.patientID ?? rec.PatientID,
    doctorID: rec.doctor_id ?? rec.doctorID ?? rec.DoctorID,
    doctorRecommendation,
    doctorRecommendationLabel: recommendationLabel(doctorRecommendation),
    doctorRemarks:
      rec.doctor_remarks ?? rec.doctorRemarks ?? rec.DoctorRemarks ?? '',
    activityTitle:
      rec.activityTitle ??
      rec.activity_title ??
      rec.centre_activity_title ??
      rec.title ??
      '',
    isDeleted: isDeletedRow(rec),
  };
};

const normalizeExclusion = (exclusion = {}) => ({
  ...exclusion,
  id: exclusion.id ?? exclusion.centreActivityExclusionID ?? exclusion.CentreActivityExclusionID,
  centreActivityID:
    exclusion.centre_activity_id ??
    exclusion.centreActivityID ??
    exclusion.CentreActivityID,
  patientID: exclusion.patient_id ?? exclusion.patientID ?? exclusion.PatientID,
  exclusionRemarks:
    exclusion.exclusion_remarks ??
    exclusion.exclusionRemarks ??
    exclusion.ExclusionRemarks ??
    '',
  startDate: exclusion.start_date ?? exclusion.startDate ?? exclusion.StartDate ?? '',
  endDate: exclusion.end_date ?? exclusion.endDate ?? exclusion.EndDate ?? '',
  activityTitle:
    exclusion.activityTitle ??
    exclusion.activity_title ??
    exclusion.centre_activity_title ??
    exclusion.title ??
    '',
  isDeleted: isDeletedRow(exclusion),
});

const isEmptyRecommendationsNotFound = (res) => {
  if (res?.ok || res?.status !== 404) return false;
  const detail = res?.data?.detail;
  const text = typeof detail === 'string' ? detail : JSON.stringify(detail ?? '');
  return /no centre activity recommendations found/i.test(text);
};

const emptyRecommendationList = (res) =>
  toMobileListResponse({ ...res, ok: true, status: 200, data: [] }, normalizeRecommendation);

const getActivityRecommendations = async (patientID) => {
  // Prefer patient-scoped path; fall back to list + filter (web main pattern).
  const scoped = await client.get(
    `${centreActivityRecommendations}/patient/${patientID}`,
    {},
    withActivityV1Base(),
  );

  if (scoped.ok) {
    const normalized = toMobileListResponse(scoped, normalizeRecommendation);
    normalized.data.data = normalized.data.data.filter(
      (item) =>
        !item.isDeleted &&
        String(item.patientID ?? item.patient_id ?? patientID) === String(patientID),
    );
    return normalized;
  }

  if (isEmptyRecommendationsNotFound(scoped)) {
    return emptyRecommendationList(scoped);
  }

  const all = await client.get(`${centreActivityRecommendations}/`, {}, withActivityV1Base());
  if (all.ok) {
    const normalized = toMobileListResponse(all, normalizeRecommendation);
    normalized.data.data = normalized.data.data.filter(
      (item) =>
        !item.isDeleted &&
        String(item.patientID ?? item.patient_id) === String(patientID),
    );
    return normalized;
  }

  if (isEmptyRecommendationsNotFound(all)) {
    return emptyRecommendationList(all);
  }
  return all;
};

const getActivityExclusions = async (patientID) => {
  // Prefer patient-scoped path when available; fall back to list + filter (web main pattern).
  const scoped = await client.get(
    `${centreActivityExclusions}/patient/${patientID}`,
    {},
    withActivityV1Base(),
  );

  if (scoped.ok) {
    const normalized = toMobileListResponse(scoped, normalizeExclusion);
    normalized.data.data = normalized.data.data.filter(
      (item) =>
        !item.isDeleted &&
        String(item.patientID) === String(patientID),
    );
    return normalized;
  }

  const all = await client.get(`${centreActivityExclusions}/`, {}, withActivityV1Base());
  if (!all.ok) return all;
  const normalized = toMobileListResponse(all, normalizeExclusion);
  normalized.data.data = normalized.data.data.filter(
    (item) =>
      !item.isDeleted &&
      String(item.patientID) === String(patientID),
  );
  return normalized;
};

const createActivityExclusion = async (data) => {
  const endDate = data.endDate ?? data.end_date;
  const payload = {
    centre_activity_id: Number(data.centreActivityID ?? data.CentreActivityID),
    patient_id: Number(data.patientID ?? data.PatientID),
    exclusion_remarks: data.exclusionRemarks ?? data.exclusion_remarks ?? null,
    start_date: data.startDate ?? data.start_date,
    end_date: endDate === '' || endDate === undefined ? null : endDate,
  };
  return client.post(`${centreActivityExclusions}/`, payload, withActivityV1Base());
};

const updateActivityExclusion = async (data) => {
  const id = data.id ?? data.centreActivityExclusionID;
  const endDate = data.endDate ?? data.end_date;
  const payload = {
    id,
    centre_activity_id: Number(data.centreActivityID ?? data.CentreActivityID),
    patient_id: Number(data.patientID ?? data.PatientID),
    exclusion_remarks: data.exclusionRemarks ?? data.exclusion_remarks ?? null,
    start_date: data.startDate ?? data.start_date,
    end_date: endDate === '' || endDate === undefined ? null : endDate,
    is_deleted: data.isDeleted ?? data.is_deleted ?? false,
    modified_by_id: data.modifiedById ?? data.ModifiedById ?? 'MOBILE',
  };
  return client.put(`${centreActivityExclusions}/`, payload, withActivityV1Base());
};

/*
 * Expose your end points here
 */
export default {
  getActivityPreference,
  getCentreActivities,
  getActivities,
  addActivityPreference,
  updateActivityPreference,
  deleteActivityPreference,
  getPatientRoutine,
  getActivityRecommendations,
  getActivityExclusions,
  createActivityExclusion,
  updateActivityExclusion,
};
