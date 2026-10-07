import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { activityEntityId } from 'app/utility/exclusionEligibility';
import { supervisorActor } from 'app/utility/centreManagement';
import { opaqueId } from 'app/utility/patientFieldPolicy';

const locks = new Set(),
  storageFences = new WeakMap();
export const activityPendingKey = (actor) =>
  `@pear_activity_management_pending:${actor}`;
const sameValue = (key, actual, expected) => {
  if (/^(?:start_date|end_date)$/.test(key) && String(expected).includes('T')) {
    return Date.parse(actual) === Date.parse(expected);
  }
  if (/^(?:id|.*_id)$/.test(key)) {
    return String(opaqueId(actual)) === String(opaqueId(expected));
  }
  return (actual ?? null) === (expected ?? null);
};
export const recordMatches = (record, payload) =>
  Object.entries(payload).every(([key, value]) =>
    sameValue(key, record?.[key], value),
  );
export const createActivityWriter = ({
  api,
  storage = AsyncStorage,
  timeoutMs = 30000,
}) => {
  if (!storageFences.has(storage)) {
    storageFences.set(storage, new Map());
  }
  const fences = storageFences.get(storage);
  const mutate = (key, action) => {
    const pending = Promise.resolve(fences.get(key))
      .catch(() => undefined)
      .then(action);
    fences.set(key, pending);
    const release = () => {
      if (fences.get(key) === pending) {
        fences.delete(key);
      }
    };
    pending.then(release, release);
    return requestDeadline(pending, timeoutMs);
  };
  const pending = async (user) => {
    const key = activityPendingKey(supervisorActor(user));
    if (fences.has(key)) {
      await requestDeadline(fences.get(key), timeoutMs);
    }
    const raw = await requestDeadline(storage.getItem(key), timeoutMs);
    return raw ? JSON.parse(raw) : null;
  };
  const verify = async (marker, user, isCurrent) => {
    const actor = supervisorActor(user);
    if (
      !isCurrent() ||
      marker.version !== 1 ||
      marker.actor !== actor ||
      !marker.receiptId
    ) {
      return { outcome: 'unknown' };
    }
    const response = await requestDeadline(
      api.get(marker.kind, marker.receiptId),
      timeoutMs,
    );
    if (
      !response?.ok ||
      String(activityEntityId(response.data?.id)) !==
        String(marker.receiptId) ||
      !recordMatches(response.data, marker.expected) ||
      !isCurrent()
    ) {
      return { outcome: 'unknown' };
    }
    await mutate(activityPendingKey(actor), () =>
      storage.removeItem(activityPendingKey(actor)),
    );
    return { outcome: 'verified', record: response.data };
  };
  const reconcile = async ({ user, isCurrent = () => true }) => {
    const key = activityPendingKey(supervisorActor(user));
    if (locks.has(key) || !isCurrent()) {
      return { outcome: 'unknown' };
    }
    locks.add(key);
    try {
      const marker = await pending(user);
      return marker
        ? await verify(marker, user, isCurrent)
        : { outcome: 'no_pending' };
    } catch {
      return { outcome: 'unknown' };
    } finally {
      locks.delete(key);
    }
  };
  const run = async ({
    kind,
    action,
    payload,
    user,
    expectedModifiedDate,
    expectedPatientId,
    isCurrent = () => true,
  }) => {
    const actor = supervisorActor(user),
      key = activityPendingKey(actor);
    if (!isCurrent()) {
      return { outcome: 'not_sent' };
    }
    if (locks.has(key)) {
      return { outcome: 'unknown' };
    }
    locks.add(key);
    let sent = false,
      marked = false;
    try {
      if (await pending(user)) {
        return { outcome: 'unknown' };
      }
      if (action !== 'create') {
        const fresh = await requestDeadline(
          api.get(kind, payload.id),
          timeoutMs,
        );
        if (
          !fresh?.ok ||
          typeof fresh.data?.is_deleted !== 'boolean' ||
          fresh.data.is_deleted ||
          String(activityEntityId(fresh.data?.id)) !== String(payload.id) ||
          (kind === 'adhoc' &&
            String(activityEntityId(fresh.data?.patient_id)) !==
              String(activityEntityId(expectedPatientId))) ||
          (expectedModifiedDate != null &&
            fresh.data.modified_date !== expectedModifiedDate)
        ) {
          return {
            outcome: 'not_sent',
            message: 'The activity changed. Reload before saving.',
          };
        }
        if (action === 'update' && recordMatches(fresh.data, payload)) {
          return { outcome: 'verified', record: fresh.data };
        }
      }
      if (!isCurrent()) {
        return { outcome: 'not_sent' };
      }
      const marker = {
        version: 1,
        actor,
        kind,
        action,
        receiptId: action === 'create' ? null : activityEntityId(payload.id),
        expected:
          action === 'delete'
            ? {
                id: payload.id,
                is_deleted: true,
                ...(kind === 'adhoc'
                  ? { patient_id: activityEntityId(expectedPatientId) }
                  : {}),
              }
            : payload,
      };
      await mutate(key, () => storage.setItem(key, JSON.stringify(marker)));
      marked = true;
      if (!isCurrent()) {
        await mutate(key, () => storage.removeItem(key));
        return { outcome: 'not_sent' };
      }
      sent = true;
      const response = await requestDeadline(
        Promise.resolve().then(() => api.write(kind, action, payload)),
        timeoutMs,
      );
      if (!response?.ok) {
        if ([400, 401, 403, 404, 409, 422].includes(response?.status)) {
          await mutate(key, () => storage.removeItem(key));
          return {
            outcome: 'rejected',
            message:
              'The service rejected the change. Reload and review the fields.',
          };
        }
        return { outcome: 'unknown' };
      }
      marker.receiptId = activityEntityId(response.data?.id);
      if (
        action !== 'create' &&
        String(marker.receiptId) !== String(payload.id)
      ) {
        return { outcome: 'unknown' };
      }
      await mutate(key, () => storage.setItem(key, JSON.stringify(marker)));
      return await verify(marker, user, isCurrent);
    } catch (error) {
      if (marked && !sent) {
        try {
          await mutate(key, () => storage.removeItem(key));
        } catch {
          return { outcome: 'unknown' };
        }
      }
      return {
        outcome: sent ? 'unknown' : 'not_sent',
        message: sent ? undefined : error.message,
      };
    } finally {
      locks.delete(key);
    }
  };
  return { pending, run, reconcile };
};
