import { useContext, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import api from 'app/api/centreManagement';
import activityApi from 'app/api/activity';
import scheduleApi from 'app/api/schedule';
import requestDeadline from 'app/utility/requestDeadline';
import { configuredHours, supervisorActor } from 'app/utility/centreManagement';
import { createActivityWriter } from 'app/utility/activityManagementWrite';
import { activityEntityId } from 'app/utility/exclusionEligibility';

const writer = createActivityWriter({ api });
export default function useCentreManagement(patientId, requirePatient = false) {
  const { user } = useContext(AuthContext) || {};
  const focused = useIsFocused();
  let actor = '',
    permitted = false;
  try {
    actor = supervisorActor(user);
    permitted = true;
  } catch {
    /* Role gate denies all reads and writes. */
  }
  if (requirePatient) {
    try {
      activityEntityId(patientId);
    } catch {
      permitted = false;
    }
  }
  const identity = `${permitted}:${actor}:${patientId ?? ''}:${focused}`;
  const currentIdentity = useRef({ identity, revision: 0 });
  if (currentIdentity.current.identity !== identity) {
    currentIdentity.current = {
      identity,
      revision: currentIdentity.current.revision + 1,
    };
  }
  const scopeRevision = currentIdentity.current.revision;
  const generation = useRef(0);
  const [reload, setReload] = useState(0);
  const [state, setState] = useState({
    identity: '',
    scopeRevision: -1,
    data: null,
    loading: true,
    error: '',
    pending: false,
  });
  const [busy, setBusy] = useState('');
  const busyRef = useRef(false);
  const current = () =>
    currentIdentity.current.identity === identity &&
    currentIdentity.current.revision === scopeRevision &&
    permitted &&
    focused;
  useEffect(() => {
    const attempt = ++generation.current;
    const active = () =>
      currentIdentity.current.identity === identity &&
      currentIdentity.current.revision === scopeRevision &&
      generation.current === attempt &&
      permitted &&
      focused;
    setState({
      identity,
      scopeRevision,
      data: null,
      loading: permitted && focused,
      error: '',
      pending: false,
    });
    if (!permitted || !focused) {
      return undefined;
    }
    const load = async () => {
      let savedMarker = null;
      try {
        const reads = [
          api.list('activity', { includeDeleted: true, isCurrent: active }),
          api.list('centre', { includeDeleted: true, isCurrent: active }),
          api.list('availability', { includeDeleted: true, isCurrent: active }),
          requestDeadline(api.workingHours()),
          writer.pending(user).then((marker) => {
            savedMarker = marker;
            return marker;
          }),
        ];
        if (patientId != null) {
          reads.push(
            api.list('adhoc', { patientId, isCurrent: active }),
            requestDeadline(activityApi.getPatientActivityAggregate(patientId)),
            requestDeadline(scheduleApi.getScheduleV1()),
          );
        }
        const [
          activities,
          centres,
          availabilities,
          hoursResponse,
          marker,
          adhocs,
          rules,
          schedule,
        ] = await Promise.all(reads);
        const hours = configuredHours(hoursResponse);
        if (
          patientId != null &&
          (!rules?.ok ||
            String(activityEntityId(rules.data?.patientID)) !==
              String(patientId) ||
            !['preferences', 'recommendations', 'exclusions'].every((key) =>
              Array.isArray(rules.data?.eligibility?.[key]),
            ) ||
            !schedule?.ok ||
            !Array.isArray(schedule.data?.Data) ||
            (schedule.data?.Status != null &&
              String(schedule.data.Status) !== '200') ||
            adhocs.some(
              (r) =>
                String(activityEntityId(r.patient_id)) !== String(patientId),
            ))
        ) {
          throw new Error(
            'Patient activity rules or existing schedule could not be loaded. Retry.',
          );
        }
        if (active()) {
          setState({
            identity,
            scopeRevision,
            data: {
              activities,
              centres,
              availabilities,
              hours,
              adhocs: adhocs || [],
              rules: rules?.data?.eligibility,
              schedule: schedule?.data?.Data,
            },
            loading: false,
            pending: !!marker,
            error: '',
          });
        }
      } catch (error) {
        if (active()) {
          setState({
            identity,
            scopeRevision,
            data: null,
            loading: false,
            pending: !!savedMarker,
            error:
              error.message || 'Activity information is unavailable. Retry.',
          });
        }
      }
    };
    load();
    return () => {
      generation.current += 1;
    };
  }, [identity, reload, focused, patientId, permitted, user, scopeRevision]);
  const mutate = async (args) => {
    if (busyRef.current || !current()) {
      return { outcome: 'not_sent' };
    }
    busyRef.current = true;
    setBusy(identity);
    try {
      const result = args
        ? await writer.run({ ...args, user, isCurrent: current })
        : await writer.reconcile({ user, isCurrent: current });
      if (current()) {
        setReload((n) => n + 1);
      }
      return result;
    } finally {
      busyRef.current = false;
      setBusy('');
    }
  };
  const view =
    state.identity === identity && state.scopeRevision === scopeRevision
      ? state
      : { data: null, loading: true, error: '', pending: false };
  return {
    ...view,
    user,
    permitted,
    busy: busy === identity || busyRef.current,
    identity: `${identity}:${scopeRevision}`,
    current,
    save: mutate,
    reconcile: () => mutate(null),
    refresh: () => {
      if (!busyRef.current) {
        setReload((n) => n + 1);
      }
    },
  };
}
