import AsyncStorage from '@react-native-async-storage/async-storage';
import requestDeadline from 'app/utility/requestDeadline';
import { medicationCourseId } from 'app/utility/medicationCourse';
import { currentUserId } from 'app/utility/medicationAdminister';
import {
  buildPrimaryGuardianUpdate,
  canSelectPrimaryGuardian,
  guardianRecords,
} from 'app/utility/guardianEditing';

const activeWrites = new Set();
// Deadlines stop waiting; they do not cancel native storage work. Keep the
// underlying mutation fenced across writer instances until it actually settles.
const storageFences = new WeakMap();
export const primaryGuardianAttemptKey = (patientId) =>
  `@pear_primary_guardian_pending:${String(medicationCourseId(patientId))}`;
const same = (a, b) => (a == null && b == null) || String(a) === String(b);

export const createPrimaryGuardianWriter = ({
  api,
  storage = AsyncStorage,
  timeoutMs = 30000,
}) => {
  if (!storageFences.has(storage)) {
    storageFences.set(storage, new Map());
  }
  const fences = storageFences.get(storage);
  const waitForStorage = async (key) => {
    const pending = fences.get(key);
    if (pending) {
      await requestDeadline(
        pending.catch(() => undefined),
        timeoutMs,
      );
    }
  };
  const mutateStorage = (key, action) => {
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
  const read = async (patientId) => {
    const [guardianResponse, allocationResponse] = await Promise.all([
      requestDeadline(api.getPatientGuardian(patientId, false), timeoutMs),
      requestDeadline(api.getPatientAllocation(patientId), timeoutMs),
    ]);
    const guardians = guardianRecords(guardianResponse, patientId);
    if (!allocationResponse?.ok) {
      throw new Error('The current allocation is unavailable.');
    }
    return { guardians, allocation: allocationResponse.data };
  };
  const reconcileUnlocked = async ({
    patientId,
    user,
    isCurrent = () => true,
  }) => {
    if (!canSelectPrimaryGuardian(user) || !isCurrent()) {
      return { outcome: 'not_sent' };
    }
    let key;
    try {
      key = primaryGuardianAttemptKey(patientId);
    } catch (error) {
      return { outcome: 'not_sent', message: error.message };
    }
    try {
      await waitForStorage(key);
      const marker = JSON.parse(
        (await requestDeadline(storage.getItem(key), timeoutMs)) || 'null',
      );
      if (!marker) {
        return { outcome: 'no_pending_intent' };
      }
      medicationCourseId(marker.allocationId);
      medicationCourseId(marker.guardianId);
      if (marker.guardian2Id != null) {
        medicationCourseId(marker.guardian2Id);
      }
      const { guardians, allocation } = await read(patientId);
      const payload = buildPrimaryGuardianUpdate({
        allocation,
        guardians,
        guardianId: marker.guardianId,
        patientId,
        user,
      });
      if (
        !isCurrent() ||
        marker.version !== 1 ||
        !same(allocation.id, marker.allocationId) ||
        !same(allocation.guardianId, marker.guardianId) ||
        !same(allocation.guardian2Id, marker.guardian2Id) ||
        !same(payload.guardian2Id, marker.guardian2Id) ||
        !same(allocation.ModifiedById, marker.actorId)
      ) {
        return { outcome: 'unknown' };
      }
      await mutateStorage(key, () => storage.removeItem(key));
      return { outcome: 'verified', allocation };
    } catch (error) {
      // A negative/unavailable read never proves a timed-out request cannot
      // commit later. Keep the marker and never send a replacement write.
      return { outcome: 'unknown' };
    }
  };
  const reconcile = async (args) => {
    if (
      !canSelectPrimaryGuardian(args.user) ||
      (args.isCurrent && !args.isCurrent())
    ) {
      return { outcome: 'not_sent' };
    }
    let key;
    try {
      key = primaryGuardianAttemptKey(args.patientId);
    } catch (error) {
      return { outcome: 'not_sent', message: error.message };
    }
    if (activeWrites.has(key)) {
      return { outcome: 'unknown' };
    }
    activeWrites.add(key);
    try {
      return await reconcileUnlocked(args);
    } finally {
      activeWrites.delete(key);
    }
  };
  const switchPrimary = async ({
    patientId,
    guardianId,
    expectedAllocationId,
    user,
    isCurrent = () => true,
  }) => {
    if (!canSelectPrimaryGuardian(user) || !isCurrent()) {
      return { outcome: 'not_sent' };
    }
    let key;
    try {
      key = primaryGuardianAttemptKey(patientId);
    } catch (error) {
      return { outcome: 'not_sent', message: error.message };
    }
    if (activeWrites.has(key)) {
      return { outcome: 'unknown' };
    }
    activeWrites.add(key);
    let sent = false;
    let markerWritten = false;
    try {
      await waitForStorage(key);
      if (await requestDeadline(storage.getItem(key), timeoutMs)) {
        return { outcome: 'unknown' };
      }
      const { guardians, allocation } = await read(patientId);
      if (
        !same(
          medicationCourseId(allocation.id),
          medicationCourseId(expectedAllocationId),
        )
      ) {
        throw new Error(
          'The patient allocation changed. Reload before selecting a primary guardian.',
        );
      }
      const payload = buildPrimaryGuardianUpdate({
        allocation,
        guardians,
        guardianId,
        patientId,
        user,
      });
      if (!isCurrent()) {
        return { outcome: 'not_sent' };
      }
      if (same(allocation.guardianId, payload.guardianId)) {
        return { outcome: 'unchanged', allocation };
      }
      const marker = {
        version: 1,
        allocationId: medicationCourseId(allocation.id),
        guardianId: payload.guardianId,
        guardian2Id: payload.guardian2Id,
        actorId: String(currentUserId(user)),
      };
      markerWritten = true;
      await mutateStorage(key, () =>
        storage.setItem(key, JSON.stringify(marker)),
      );
      if (!isCurrent()) {
        await mutateStorage(key, () => storage.removeItem(key));
        return { outcome: 'not_sent' };
      }
      sent = true;
      try {
        await requestDeadline(
          Promise.resolve().then(() =>
            api.updatePrimaryAllocation(allocation.id, payload),
          ),
          timeoutMs,
        );
      } catch (error) {
        /* preserve intent and inspect only authoritative reads */
      }
      const result = await reconcileUnlocked({ patientId, user, isCurrent });
      return result.outcome === 'no_pending_intent'
        ? { outcome: 'unknown' }
        : result;
    } catch (error) {
      return sent || markerWritten || fences.has(key)
        ? { outcome: 'unknown' }
        : { outcome: 'not_sent', message: error.message };
    } finally {
      activeWrites.delete(key);
    }
  };
  return { switchPrimary, reconcile };
};
