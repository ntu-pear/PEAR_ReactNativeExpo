import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { activityEntityId } from 'app/utility/exclusionEligibility';
import { supervisorActor } from 'app/utility/centreManagement';
import { opaqueId } from 'app/utility/patientFieldPolicy';

const locks = new Set(),
  storageFences = new WeakMap(),
  acknowledgedGuards = new WeakMap();
let localAttemptSequence = 0;
export const activityPendingKey = (actor) =>
  `@pear_activity_management_pending:${actor}`;
export const activityReceiptGuardKey = (actor) =>
  `${activityPendingKey(actor)}:receipt_guard`;
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
  if (!acknowledgedGuards.has(storage)) {
    acknowledgedGuards.set(storage, new Map());
  }
  const acknowledgements = acknowledgedGuards.get(storage);
  const guardKey = (key) => `${key}:receipt_guard`;
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
  const persistMarker = (key, marker) => {
    const raw = JSON.stringify(marker);
    acknowledgements.delete(key);
    // The durable guard is never removed. Persist it before every possible
    // dispatch: an old native primary-key removal cannot erase a newer intent.
    return mutate(key, async () => {
      await storage.setItem(guardKey(key), raw);
      await storage.setItem(key, raw);
    });
  };
  const cancelBeforeDispatch = (key, marker) => {
    const raw = JSON.stringify({ ...marker, cancelledBeforeDispatch: true });
    acknowledgements.delete(key);
    return mutate(key, async () => {
      // This flag is written only on a path that cannot subsequently dispatch.
      await storage.setItem(guardKey(key), raw);
      await storage.removeItem(key);
    });
  };
  const pending = async (user) => {
    const key = activityPendingKey(supervisorActor(user));
    if (fences.has(key)) {
      await requestDeadline(fences.get(key), timeoutMs);
    }
    const [raw, guard] = await requestDeadline(
      Promise.all([storage.getItem(key), storage.getItem(guardKey(key))]),
      timeoutMs,
    );
    if (guard) {
      const marker = JSON.parse(guard);
      if (
        marker.cancelledBeforeDispatch === true ||
        acknowledgements.get(key) === guard
      ) {
        return null;
      }
      // A new JS session has no acknowledgement: confirm the exact receipt
      // read-only before another write, even if an earlier session saw success.
      return marker;
    }
    return raw ? JSON.parse(raw) : null; // Legacy markers remain protected.
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
    const key = activityPendingKey(actor),
      raw = JSON.stringify(marker);
    acknowledgements.delete(key);
    // Also promotes legacy pending markers before any destructive clear.
    await mutate(key, () => storage.setItem(guardKey(key), raw));
    if (!isCurrent()) {
      return { outcome: 'unknown' };
    }
    let abandoned = false;
    try {
      const cleared = await mutate(key, async () => {
        if (!isCurrent()) {
          return false;
        }
        await storage.removeItem(key);
        if (abandoned || !isCurrent()) {
          await storage.setItem(key, raw);
          return false;
        }
        return true;
      });
      if (!cleared || !isCurrent()) {
        if (cleared) {
          await mutate(key, () => storage.setItem(key, raw));
        }
        return { outcome: 'unknown' };
      }
      // Synchronous, in-session acknowledgement only after an in-time clear.
      // No timed-out storage completion can manufacture this acknowledgement.
      acknowledgements.set(key, raw);
      return { outcome: 'verified', record: response.data };
    } catch {
      abandoned = true;
      // The fence covers the underlying clear and queued restoration, not its
      // deadline wrapper. The already durable guard survives restoration errors
      // or a JS restart; it is never erased by the primary-key removal.
      mutate(key, () => storage.setItem(key, raw)).catch(() => undefined);
      return { outcome: 'unknown' };
    }
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
      marked = false,
      marker;
    try {
      const existing = await pending(user);
      if (!isCurrent()) {
        return { outcome: 'not_sent' };
      }
      if (existing) {
        return { outcome: 'unknown' };
      }
      if (action !== 'create') {
        if (
          expectedModifiedDate === undefined ||
          (expectedModifiedDate !== null &&
            (typeof expectedModifiedDate !== 'string' ||
              !expectedModifiedDate.trim()))
        ) {
          return {
            outcome: 'not_sent',
            message:
              'The record version is unavailable. Reload before changing it.',
          };
        }
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
          !Object.prototype.hasOwnProperty.call(fresh.data, 'modified_date') ||
          fresh.data.modified_date !== expectedModifiedDate
        ) {
          return {
            outcome: 'not_sent',
            message: 'The activity changed. Reload before saving.',
          };
        }
        if (!isCurrent()) {
          return { outcome: 'not_sent' };
        }
        if (action === 'update' && recordMatches(fresh.data, payload)) {
          return { outcome: 'verified', record: fresh.data };
        }
      }
      if (!isCurrent()) {
        return { outcome: 'not_sent' };
      }
      marker = {
        version: 1,
        // Local correlation only; this is not a server idempotency token.
        operationId: `${Date.now()}-${++localAttemptSequence}-${Math.random()
          .toString(36)
          .slice(2)}`,
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
      await persistMarker(key, marker);
      marked = true;
      if (!isCurrent()) {
        await cancelBeforeDispatch(key, marker);
        return { outcome: 'not_sent' };
      }
      const response = await requestDeadline(
        Promise.resolve().then(() => {
          if (!isCurrent()) {
            throw new Error('The activity screen changed before dispatch.');
          }
          sent = true;
          return api.write(kind, action, payload);
        }),
        timeoutMs,
      );
      if (!response?.ok) {
        // A status alone cannot prove non-commit: availability create can commit
        // and then fail its parent lookup with 404. Keep every dispatched failure
        // uncertain until an authoritative exact receipt can be reconciled.
        return { outcome: 'unknown' };
      }
      marker.receiptId = activityEntityId(response.data?.id);
      if (
        action !== 'create' &&
        String(marker.receiptId) !== String(payload.id)
      ) {
        return { outcome: 'unknown' };
      }
      await persistMarker(key, marker);
      return await verify(marker, user, isCurrent);
    } catch (error) {
      if (marked && !sent) {
        try {
          await cancelBeforeDispatch(key, marker);
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
