import { calendarDate } from 'app/utility/centreManagement';
import { centreDay } from 'app/utility/centreClock';
import { currentUserId } from 'app/utility/medicationAdminister';
import requestDeadline from 'app/utility/requestDeadline';

export const newTemplate = () => ({
  name: '',
  title: '',
  description: '',
  care_centre_id: null,
  is_compulsory: false,
  is_fixed: false,
  is_group: false,
  start_date: centreDay(),
  end_date: '2999-01-01',
  min_duration: 60,
  max_duration: 60,
  min_people_req: 1,
  fixed_time_slots: '',
});

export const templatePayload = (draft, user) => {
  if (
    String(user?.roleName || user?.role || '').toUpperCase() !== 'SUPERVISOR' ||
    !currentUserId(user)
  ) {
    throw new Error('Template management requires Supervisor access.');
  }
  const text = (key) => String(draft[key] ?? '').trim();
  if (
    !text('name') ||
    !text('title') ||
    text('name').length > 200 ||
    text('title').length > 200
  ) {
    throw new Error(
      'Enter a template name and activity title, up to 200 characters each.',
    );
  }
  const integer = (key) => {
    const value = Number(draft[key]);
    if (String(draft[key]).trim() === '' || !Number.isInteger(value)) {
      throw new Error('Use whole numbers for durations and minimum people.');
    }
    return value;
  };
  const payload = {
    name: text('name'),
    title: text('title'),
    description: text('description') || null,
    care_centre_id: draft.care_centre_id ?? null,
    is_compulsory: !!draft.is_compulsory,
    is_fixed: !!draft.is_fixed,
    is_group: !!draft.is_group,
    start_date: calendarDate(text('start_date')),
    end_date: calendarDate(text('end_date')),
    min_duration: integer('min_duration'),
    max_duration: integer('max_duration'),
    min_people_req: integer('min_people_req'),
    fixed_time_slots: text('fixed_time_slots') || null,
  };
  if (payload.min_people_req < 1) {
    throw new Error('Minimum people must be at least 1.');
  }
  return draft.id
    ? {
        ...payload,
        id: Number(draft.id),
        is_deleted: false,
        modified_by_id: String(currentUserId(user)),
      }
    : { ...payload, created_by_id: String(currentUserId(user)) };
};
export const templateMatches = (payload, record) =>
  record &&
  Object.entries(payload)
    .filter(([key]) => !['created_by_id', 'modified_by_id'].includes(key))
    .every(([key, value]) => (record[key] ?? null) === (value ?? null));

export const writeTemplate = async ({
  api,
  payload,
  remove = false,
  isCurrent = () => true,
}) => {
  if (!isCurrent()) {
    return { outcome: 'stale' };
  }
  let acceptedId = payload.id;
  try {
    if (payload.id) {
      const fresh = await requestDeadline(api.get(payload.id));
      if (!isCurrent()) {
        return { outcome: 'stale' };
      }
      if (!fresh?.ok || String(fresh.data?.id) !== String(payload.id)) {
        return {
          outcome: 'rejected',
          message:
            'The template could not be reloaded. Return to the list before editing.',
        };
      }
      if (
        Object.prototype.hasOwnProperty.call(payload, 'expectedModified') &&
        (fresh.data.modified_date ?? null) !==
          (payload.expectedModified ?? null)
      ) {
        return {
          outcome: 'rejected',
          message:
            'This template changed while you were editing. Reopen it from the list.',
        };
      }
    }
    const { expectedModified, ...body } = payload;
    const response = await requestDeadline(
      remove
        ? api.remove(body.id)
        : body.id
        ? api.update(body)
        : api.create(body),
    );
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    if (!response?.ok) {
      return {
        outcome:
          response?.status >= 400 && response.status < 500
            ? 'rejected'
            : 'uncertain',
        id: acceptedId,
        message:
          typeof response?.data?.detail === 'string'
            ? response.data.detail
            : 'The change could not be confirmed. Check its outcome before making another change.',
      };
    }
    const returnedId = response.data?.id;
    if (payload.id && String(returnedId) !== String(payload.id)) {
      throw new Error('Wrong template identity');
    }
    acceptedId = returnedId;
    if (!Number.isInteger(Number(acceptedId)) || Number(acceptedId) < 1) {
      throw new Error('No template identity');
    }
    const read = await requestDeadline(api.get(acceptedId, remove));
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    const verifyPayload = remove
      ? { id: Number(acceptedId), is_deleted: true }
      : { ...body, id: Number(acceptedId), is_deleted: false };
    if (!read?.ok || !templateMatches(verifyPayload, read.data)) {
      throw new Error('Readback mismatch');
    }
    return { outcome: 'verified', id: acceptedId, record: read.data };
  } catch {
    return {
      outcome: isCurrent() ? 'uncertain' : 'stale',
      id: acceptedId,
      message:
        'The change could not be confirmed. Check its outcome before making another change.',
    };
  }
};
