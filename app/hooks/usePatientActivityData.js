import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import activityApi from 'app/api/activity';
import patientApi from 'app/api/patient';
import requestDeadline from 'app/utility/requestDeadline';
import { patientFromApiResponse } from 'app/utility/patientHeader';

const empty = () => ({
  isLoading: true,
  patientData: {},
  preferences: [],
  recommendations: [],
  exclusions: [],
  errors: [],
});

export default function usePatientActivityData(patientID) {
  const [state, setState] = useState(empty);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setState(empty());
    if (!patientID) {
      setState({
        ...empty(),
        isLoading: false,
        errors: ['patient', 'activities'],
      });
      return;
    }
    const [patient, activity] = await Promise.allSettled([
      requestDeadline(
        Promise.resolve().then(() =>
          patientApi.readPatientV1(patientID, {
            require_auth: true,
            mask: true,
          }),
        ),
      ),
      requestDeadline(
        Promise.resolve().then(() =>
          activityApi.getPatientActivityAggregate(patientID),
        ),
      ),
    ]);
    if (current !== generation.current) return;
    const patientRes = patient.status === 'fulfilled' ? patient.value : null;
    const activityRes = activity.status === 'fulfilled' ? activity.value : null;
    const raw = patientRes?.data?.data ?? patientRes?.data;
    const patientOk =
      patientRes?.ok && String(raw?.id ?? raw?.patientID) === String(patientID);
    const errors = [];
    if (!patientOk) errors.push('patient');
    if (!activityRes?.ok)
      errors.push('preferences', 'recommendations', 'exclusions');
    setState({
      isLoading: false,
      patientData: patientOk ? patientFromApiResponse(patientRes) : {},
      preferences: activityRes?.ok ? activityRes.data.preferences : [],
      recommendations: activityRes?.ok ? activityRes.data.recommendations : [],
      exclusions: activityRes?.ok ? activityRes.data.exclusions : [],
      errors,
    });
  }, [patientID]);
  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        generation.current += 1;
      };
    }, [refresh]),
  );
  return { ...state, refresh };
}
