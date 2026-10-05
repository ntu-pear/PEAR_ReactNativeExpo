import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import patientApi from 'app/api/patient';
import requestDeadline from 'app/utility/requestDeadline';
import { currentUserId } from 'app/utility/medicationAdminister';
import {
  responseRows,
  filterMedicationHistory,
  joinMedicationNames,
} from 'app/utility/medicationHistory';

const Control = ({ title, disabled = false, onPress, testID }) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    testID={testID}
    style={[styles.button, disabled && styles.disabled]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function ManageMedicationScreen() {
  const { user } = useContext(AuthContext);
  const permitted =
    String(user?.roleName || user?.role || '').toUpperCase() === 'SUPERVISOR';
  const actor = currentUserId(user);
  const [mode, setMode] = useState('myPatients');
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [medPage, setMedPage] = useState(0);
  const [medPages, setMedPages] = useState(0);
  const [records, setRecords] = useState([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [recordRetry, setRecordRetry] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const listRequest = useMemo(
    () => ({ mode, page, reload }),
    [mode, page, reload],
  );

  useFocusEffect(
    useCallback(() => {
      if (!permitted) return undefined;
      const { mode: requestMode, page: requestPage } = listRequest;
      let active = true;
      setLoading(true);
      setError('');
      setPatients([]);
      setSelected(null);
      (async () => {
        try {
          const params = {
            pageNo: requestPage,
            pageSize: 10,
            mask: true,
            require_auth: true,
          };
          const res = await requestDeadline(
            requestMode === 'myPatients'
              ? patientApi.listMyPatientsV1(actor, 'SUPERVISOR', params)
              : patientApi.listPatientsV1(params),
          );
          if (!active) return;
          if (!res?.ok)
            throw new Error(
              `Patients could not be loaded${
                res?.status ? ` (${res.status})` : ''
              }. Check the connection and retry.`,
            );
          const rows = responseRows(res);
          setPatients(rows);
          setPages(
            Number(res.data?.totalPages) || (rows.length ? requestPage + 1 : 0),
          );
        } catch (e) {
          if (active) setError(e.message);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [actor, permitted, listRequest]),
  );

  useEffect(() => {
    if (!selected || !permitted) {
      setRecords([]);
      return undefined;
    }
    let active = true;
    setRecordLoading(true);
    setRecordError('');
    setRecords([]);
    (async () => {
      try {
        // Expand one patient at a time; do not fan out reads across the patient list.
        // These are course records, not Scheduler-generated doses or home prescriptions.
        const [medRes, vocabRes] = await Promise.all([
          requestDeadline(
            patientApi.listPatientMedicationsV1(selected.id, {
              pageNo: medPage,
              pageSize: 100,
            }),
          ),
          requestDeadline(patientApi.getPrescriptionListV1()),
        ]);
        if (!active) return;
        if (!medRes?.ok || !vocabRes?.ok)
          throw new Error(
            'Medication records could not be loaded. Check the connection and retry.',
          );
        const rows = responseRows(medRes);
        setRecords(
          joinMedicationNames(rows, responseRows(vocabRes), selected.id),
        );
        setMedPages(
          Number(medRes.data?.totalPages) || (rows.length ? medPage + 1 : 0),
        );
      } catch (e) {
        if (active) setRecordError(e.message);
      } finally {
        if (active) setRecordLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selected, medPage, recordRetry, permitted]);

  if (!permitted)
    return (
      <Text testID="medication_access_denied" style={styles.message}>
        Medication management is available to supervisors.
      </Text>
    );
  let shown = [];
  let dateError = '';
  try {
    shown = filterMedicationHistory(records, from, to);
  } catch (e) {
    dateError = e.message;
  }
  const changeMode = (next) => {
    setSelected(null);
    setPage(0);
    setMode(next);
  };
  const choosePatient = (patient) => {
    setMedPage(0);
    setSelected({
      id: patient.id ?? patient.patientID,
      name: patient.name ?? patient.fullName ?? 'Patient',
    });
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Centre Medication Records</Text>
      <View style={styles.row}>
        <Control
          title="My Patients"
          testID="medication_my_patients"
          disabled={mode === 'myPatients'}
          onPress={() => changeMode('myPatients')}
        />
        <Control
          title="All Patients"
          testID="medication_all_patients"
          disabled={mode === 'allPatients'}
          onPress={() => changeMode('allPatients')}
        />
      </View>
      {loading && <ActivityIndicator testID="medication_patients_loading" />}
      {!!error && (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Control
            title="Retry patients"
            onPress={() => setReload((v) => v + 1)}
          />
        </View>
      )}
      {!loading && !error && patients.length === 0 && (
        <Text>No patients found.</Text>
      )}
      {patients.map((patient) => (
        <Control
          key={String(patient.id ?? patient.patientID)}
          title={patient.name ?? patient.fullName ?? 'Patient'}
          testID={`medication_patient_${patient.id ?? patient.patientID}`}
          onPress={() => choosePatient(patient)}
        />
      ))}
      <View style={styles.row}>
        <Control
          title="Previous patients"
          disabled={loading || page === 0}
          onPress={() => setPage((v) => v - 1)}
        />
        <Text>
          Page {page + 1} of {Math.max(pages, 1)}
        </Text>
        <Control
          title="Next patients"
          disabled={loading || page + 1 >= pages}
          onPress={() => setPage((v) => v + 1)}
        />
      </View>
      {selected && (
        <View testID="medication_record_panel">
          <Text style={styles.title}>{selected.name}</Text>
          <Text>
            Show courses overlapping these dates. Leave both blank to include
            all dates, including ended courses.
          </Text>
          <View style={styles.row}>
            <TextInput
              testID="medication_from"
              accessibilityLabel="From date YYYY-MM-DD"
              placeholder="From YYYY-MM-DD"
              value={from}
              onChangeText={setFrom}
              style={styles.input}
            />
            <TextInput
              testID="medication_to"
              accessibilityLabel="To date YYYY-MM-DD"
              placeholder="To YYYY-MM-DD"
              value={to}
              onChangeText={setTo}
              style={styles.input}
            />
            <Control
              title="Clear dates"
              onPress={() => {
                setFrom('');
                setTo('');
              }}
            />
          </View>
          {!!dateError && <Text style={styles.error}>{dateError}</Text>}
          {recordLoading && (
            <ActivityIndicator testID="medication_records_loading" />
          )}
          {!!recordError && (
            <View>
              <Text style={styles.error}>{recordError}</Text>
              <Control
                title="Retry records"
                onPress={() => setRecordRetry((v) => v + 1)}
              />
            </View>
          )}
          {!recordLoading &&
            !recordError &&
            !dateError &&
            shown.length === 0 && (
              <Text>No medication records in this date range.</Text>
            )}
          {!dateError &&
            shown.map((record) => (
              <View key={String(record.medicationID)} style={styles.record}>
                <Text style={styles.drug}>{record.drugName}</Text>
                <Text>
                  Administer time: {record.administerTime || 'Unavailable'}
                </Text>
                <Text>Dosage: {record.dosage || 'Unavailable'}</Text>
                <Text>Instruction: {record.instruction || 'Unavailable'}</Text>
                <Text>
                  Start:{' '}
                  {String(record.startDateTime || 'Unavailable').slice(0, 10)} ·
                  End:{' '}
                  {record.endDateTime
                    ? String(record.endDateTime).slice(0, 10)
                    : 'Ongoing'}
                </Text>
                <Text>Remarks: {record.prescriptionRemarks || 'None'}</Text>
              </View>
            ))}
          <View style={styles.row}>
            <Control
              title="Previous records"
              disabled={recordLoading || medPage === 0}
              onPress={() => setMedPage((v) => v - 1)}
            />
            <Text>
              Record page {medPage + 1} of {Math.max(medPages, 1)}
            </Text>
            <Control
              title="Next records"
              disabled={recordLoading || medPage + 1 >= medPages}
              onPress={() => setMedPage((v) => v + 1)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 14 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#28615d',
    padding: 12,
    borderRadius: 6,
    margin: 4,
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16 },
  input: {
    minWidth: 190,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 4,
    padding: 12,
    margin: 4,
  },
  error: { color: '#a31313', marginVertical: 8 },
  record: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 14 },
  drug: { fontSize: 18, fontWeight: 'bold' },
  message: { padding: 20, fontSize: 18 },
});
