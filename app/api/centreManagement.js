import client, { ACTIVITY_V1_BASE } from 'app/api/client';
import requestDeadline from 'app/utility/requestDeadline';
import { readAllPages } from 'app/utility/pagedRead';
import { activityEntityId } from 'app/utility/exclusionEligibility';

const paths = {
  activity: '/activities',
  centre: '/centre_activities',
  availability: '/centre_activity_availabilities',
  adhoc: '/adhocs',
};
const config = (write = false) => ({
  baseURL: ACTIVITY_V1_BASE,
  timeout: 15000,
  pearNoAuthReplay: write,
});
const pathFor = (kind) => {
  if (!paths[kind]) {
    throw new Error('Unknown activity operation.');
  }
  return paths[kind];
};
export const strictActivityRows = (response) => {
  if (!response?.ok || !Array.isArray(response.data)) {
    throw new Error('The activity list could not be loaded. Retry.');
  }
  const ids = new Set();
  if (response.data.length > 10000) {
    throw new Error('The activity list exceeds the supported limit.');
  }
  response.data.forEach((row) => {
    const id = String(activityEntityId(row.id));
    if (ids.has(id) || typeof row.is_deleted !== 'boolean') {
      throw new Error('The activity list contains invalid records.');
    }
    ids.add(id);
  });
  return response.data;
};
const list = async (
  kind,
  { includeDeleted = false, isCurrent = () => true, patientId } = {},
) => {
  const path = pathFor(kind);
  if (kind === 'availability' || (kind === 'adhoc' && patientId != null)) {
    const target =
      patientId == null
        ? path + '/'
        : `${path}/patient/${activityEntityId(patientId)}`;
    const response = await requestDeadline(
      client.get(target, { include_deleted: includeDeleted }, config()),
    );
    // The deployed patient-specific API documents this exact empty result.
    if (
      kind === 'adhoc' &&
      response?.status === 404 &&
      response.data?.detail === 'No Adhoc records for this patient'
    ) {
      return [];
    }
    if (!isCurrent()) {
      throw new Error('Activity selection changed.');
    }
    return strictActivityRows(response);
  }
  return readAllPages(
    async ({ pageNo, pageSize }) => {
      if (!isCurrent()) {
        throw new Error('Activity selection changed.');
      }
      const response = await client.get(
        path + '/',
        {
          skip: pageNo * pageSize,
          limit: pageSize,
          include_deleted: includeDeleted,
        },
        config(),
      );
      if (response?.ok) {
        strictActivityRows(response);
      }
      return response;
    },
    { maxPages: 100 },
  );
};
const get = (kind, id) =>
  client.get(
    `${pathFor(kind)}/${activityEntityId(id)}`,
    { include_deleted: true },
    config(),
  );
const write = (kind, action, payload) => {
  const path = pathFor(kind);
  if (action === 'create') {
    return client.post(path + '/', payload, config(true));
  }
  if (action === 'update') {
    return client.put(
      kind === 'activity'
        ? `${path}/${activityEntityId(payload.id)}`
        : path + '/',
      payload,
      config(true),
    );
  }
  if (action === 'delete') {
    return client.delete(
      `${path}/${activityEntityId(payload.id)}`,
      {},
      config(true),
    );
  }
  throw new Error('Unknown activity action.');
};
const workingHours = () =>
  client.get('/care_centres/1/working_hours', {}, config());
// Current Activity staging validates every availability against care centre 1.
// Centre administration is Admin-only; this Supervisor adapter never changes hours.
export default { list, get, write, workingHours };
