import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { activityEntityId } from 'app/utility/exclusionEligibility';
import { supervisorActor } from 'app/utility/centreManagement';
import { opaqueId } from 'app/utility/patientFieldPolicy';
import { activityMutationBlockReason } from 'app/utility/activityManagementPolicy';

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

// Writes are deliberately disabled. Existing confirmation evidence is read-only:
// no removeItem/setItem, mutable acknowledgement or recovery queue remains.
export const createActivityWriter = ({
  api,
  storage = AsyncStorage,
  timeoutMs = 30000,
}) => {
  const pending = async (user) => {
    const actor = supervisorActor(user);
    const [raw, guard] = await requestDeadline(
      Promise.all([
        storage.getItem(activityPendingKey(actor)),
        storage.getItem(activityReceiptGuardKey(actor)),
      ]),
      timeoutMs,
    );
    const primary = raw ? JSON.parse(raw) : null,
      receipt = guard ? JSON.parse(guard) : null;
    if (
      primary &&
      receipt &&
      (primary.operationId !== receipt.operationId ||
        primary.actor !== receipt.actor ||
        primary.kind !== receipt.kind ||
        primary.action !== receipt.action ||
        JSON.stringify(primary.expected) !== JSON.stringify(receipt.expected))
    ) {
      return { ...receipt, conflictingIntent: true };
    }
    return receipt || primary;
  };
  const run = async ({ kind } = {}) => ({
    outcome: 'not_sent',
    message:
      activityMutationBlockReason(kind) ||
      'Activity changes are unavailable while safe request reconciliation is reviewed.',
  });
  const reconcile = async ({ user, isCurrent = () => true }) => {
    try {
      const actor = supervisorActor(user);
      if (!isCurrent()) {
        return { outcome: 'unknown' };
      }
      const marker = await pending(user);
      if (!isCurrent()) {
        return { outcome: 'unknown' };
      }
      if (!marker) {
        return { outcome: 'no_pending' };
      }
      if (
        marker.conflictingIntent ||
        marker.version !== 1 ||
        marker.actor !== actor ||
        !marker.receiptId ||
        !marker.expected ||
        typeof marker.expected !== 'object' ||
        Array.isArray(marker.expected)
      ) {
        return { outcome: 'unknown' };
      }
      const response = await requestDeadline(
        api.get(marker.kind, activityEntityId(marker.receiptId)),
        timeoutMs,
      );
      if (
        !isCurrent() ||
        !response?.ok ||
        String(activityEntityId(response.data?.id)) !==
          String(marker.receiptId) ||
        !recordMatches(response.data, marker.expected)
      ) {
        return { outcome: 'unknown' };
      }
      // Observation cannot clear evidence or enable another mutation.
      return { outcome: 'observed', record: response.data };
    } catch {
      return { outcome: 'unknown' };
    }
  };
  return { pending, run, reconcile };
};
