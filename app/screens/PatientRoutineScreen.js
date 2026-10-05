import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import activityApi from 'app/api/activity';
import patientApi from 'app/api/patient';
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import requestDeadline from 'app/utility/requestDeadline';
import {
  patientFromApiResponse,
  patientProfileLines,
} from 'app/utility/patientHeader';
import { noDataMessage } from 'app/utility/miscFunctions';
import routes from 'app/navigation/routes';

export default function PatientRoutineScreen({ route }) {
  const params = route?.params || {};
  const patientId =
    params.patientId ??
    params.patientID ??
    params.patientProfile?.patientID ??
    params.patientProfile?.id;
  const navigation = useNavigation();
  const [patient, setPatient] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) {
      return;
    }
    let active = true;
    setLoading(true);
    setRows([]);
    setPatient({});
    setError('');
    const load = async () => {
      try {
        if (patientId == null || patientId === '') {
          throw new Error('A patient must be selected.');
        }
        const results = await Promise.allSettled([
          requestDeadline(
            Promise.resolve().then(() =>
              activityApi.getPatientRoutine(patientId),
            ),
          ),
          requestDeadline(
            Promise.resolve().then(() => patientApi.readPatientV1(patientId)),
          ),
        ]);
        if (!active) {
          return;
        }
        const [routineRes, patientRes] = results.map((r) =>
          r.status === 'fulfilled' ? r.value : null,
        );
        const next = patientRes?.ok ? patientFromApiResponse(patientRes) : null;
        const matched =
          next && String(next.patientID ?? next.id) === String(patientId);
        if (matched) {
          setPatient(next);
        }
        if (routineRes?.ok && Array.isArray(routineRes.data?.data)) {
          setRows(routineRes.data.data);
        }
        if (
          !matched ||
          !routineRes?.ok ||
          !Array.isArray(routineRes.data?.data)
        ) {
          throw new Error(
            'Routine or patient information could not be loaded. Check the VPN connection and retry.',
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [patientId, focused, reload]);
  const lines = patientProfileLines(patient);
  return (
    <View style={styles.container} testID={`routine_screen_${patientId}`}>
      <ActivityIndicator visible={loading} />
      {Object.keys(patient).length ? (
        <ProfileNameButton
          testID={`routine_screen_${patientId}_profileNameButton`}
          isPatient
          isVertical={false}
          profilePicture={patient.profilePicture}
          profileLineOne={lines.line1}
          profileLineTwo={lines.line2}
          handleOnPress={() =>
            navigation.navigate(routes.PATIENT_PROFILE, { patientId })
          }
        />
      ) : null}
      {error ? (
        <View>
          <Text accessibilityRole="alert" testID="routine_read_error">
            {error}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setReload((n) => n + 1)}
          >
            <Text>Retry routine</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!loading ? (
        <DynamicTable
          headerData={['Activity', 'Days', 'Start', 'End']}
          rowData={rows.map((row) => [
            row.activityName || 'Activity name unavailable',
            row.days || '',
            row.startTime || '',
            row.endTime || '',
          ])}
          widthData={[220, 220, 110, 110]}
          screenName="patient routine"
          noDataMessage={
            error
              ? null
              : noDataMessage(
                  200,
                  false,
                  false,
                  'No routines recorded for this patient.',
                  false,
                )
          }
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
});
