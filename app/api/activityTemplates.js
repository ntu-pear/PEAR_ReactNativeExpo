import client, { ACTIVITY_V1_BASE } from 'app/api/client';

const options = { baseURL: ACTIVITY_V1_BASE };
const id = (value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error('Invalid template identity.');
  }
  return number;
};
export default {
  list: (page = 0) =>
    client.get(
      '/activity_templates/',
      { skip: Math.max(0, page) * 20, limit: 20, include_deleted: false },
      options,
    ),
  get: (value, includeDeleted = false) =>
    client.get(
      `/activity_templates/${id(value)}`,
      { include_deleted: includeDeleted },
      options,
    ),
  create: (payload) => client.post('/activity_templates/', payload, options),
  update: (payload) => {
    id(payload.id);
    return client.put('/activity_templates/', payload, options);
  },
  remove: (value) =>
    client.delete(`/activity_templates/${id(value)}`, {}, options),
};
