import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import scheduleApi from 'app/api/schedule';
import requestDeadline from 'app/utility/requestDeadline';
import {
  canRecordMedication,
  currentUserId,
  todayAdministerDate,
} from 'app/utility/medicationAdminister';
import {
  medicationDoseKey,
  medicationDoseRows,
  medicationDoseStatus,
  medicationDoseMatches,
  medicationReadMessage,
} from 'app/utility/medicationDoseRead';
import { confirmAndLogMedicationAdministration } from 'app/utility/confirmMedicationAdministration';

const Control = ({ title, testID, disabled, onPress }) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled: !!disabled }}
    disabled={disabled}
    onPress={onPress}
    testID={testID}
    style={[styles.button, disabled && styles.disabled]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
const clock = (time) => `${time.slice(0, 2)}:${time.slice(2)}`;

export default function MedicationScheduleScreen() {
  const { user } = useContext(AuthContext);
  const permitted = canRecordMedication(user);
  const owner = JSON.stringify([
    currentUserId(user),
    user?.roleName || user?.role,
  ]);
  const currentOwner = useRef(owner);
  currentOwner.current = owner;
  const focused = useIsFocused();
  const generation = useRef(0);
  const [reload, setReload] = useState(0);
  const [snapshot, setSnapshot] = useState({
    owner: null,
    rows: [],
    loading: true,
  });
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  const day = todayAdministerDate(new Date(now));
  const [search, setSearch] = useState({ owner, value: '' });
  const query = search.owner === owner ? search.value : '';
  // Re-evaluate visible status and the centre day without polling the data API.
  useEffect(() => {
    if (!focused || !permitted) return;
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 15000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [focused, permitted]);
  useFocusEffect(
    useCallback(() => {
      const version = ++generation.current;
      let active = true;
      if (permitted && day === todayAdministerDate()) {
        setSnapshot({ owner, reload, day, rows: [], loading: true });
        (async () => {
          let next;
          try {
            // This endpoint generates today's slots; do not add patient/header fan-out.
            const response = await requestDeadline(
              scheduleApi.getMedicationScheduleV1(),
            );
            if (!response?.ok)
              next = {
                rows: [],
                error: medicationReadMessage(response?.status),
                status: response?.status,
              };
            else next = { rows: medicationDoseRows(response.data) };
          } catch {
            next = { rows: [], error: medicationReadMessage() };
          }
          if (
            active &&
            version === generation.current &&
            owner === currentOwner.current
          ) {
            if (day !== todayAdministerDate()) {
              setNow(Date.now());
              return;
            }
            setSnapshot({ ...next, owner, reload, day, loading: false });
          }
        })();
      }
      return () => {
        active = false;
        generation.current += 1;
      };
    }, [owner, permitted, reload, day]),
  );

  if (!permitted)
    return (
      <Text testID="dose_access_denied" style={styles.message}>
        Today’s medication is available to caregivers and supervisors.
      </Text>
    );
  if (
    !focused ||
    snapshot.owner !== owner ||
    snapshot.reload !== reload ||
    snapshot.day !== day ||
    snapshot.loading
  )
    return <ActivityIndicator testID="dose_loading" style={styles.message} />;

  const administer = async (row) => {
    if (busy) return;
    const version = generation.current;
    const isCurrent = () =>
      currentOwner.current === owner &&
      generation.current === version &&
      todayAdministerDate() === day;
    setBusy(true);
    try {
      await confirmAndLogMedicationAdministration({
        user,
        isCurrent,
        patientID: row.PatientID,
        patientName: `Patient ${row.PatientID}`,
        medName: row.PrescriptionName,
        medDosage: 'Not supplied by the schedule',
        medTime: row.AdministerTime,
        administrationDate: row.AdministerDate,
        formatTime: clock,
        onRecorded: () => setReload((value) => value + 1),
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <FlatList
      testID="dose_list"
      style={styles.container}
      contentContainerStyle={styles.content}
      data={snapshot.rows.filter((row) => medicationDoseMatches(row, query))}
      extraData={now}
      keyboardShouldPersistTaps="handled"
      keyExtractor={medicationDoseKey}
      initialNumToRender={15}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Today’s Medication</Text>
          <Text>
            {String(user?.roleName || user?.role).toUpperCase() === 'SUPERVISOR'
              ? 'All patients'
              : 'Allocated patients'}{' '}
            · Singapore date {day}
          </Text>
          <Text style={styles.note}>
            Centre doses for today. Prescriptions and medication courses are
            separate records.
          </Text>
          <TextInput
            testID="dose_search"
            accessibilityLabel="Search medication, patient ID, assigned caregiver or administered by"
            placeholder="Search medication or patient/staff ID"
            value={query}
            onChangeText={(value) => setSearch({ owner, value })}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.search}
          />
          <Control
            title="Refresh doses"
            testID="dose_refresh"
            disabled={busy}
            onPress={() => setReload((value) => value + 1)}
          />
          {!!snapshot.error && (
            <Text testID="dose_error" style={styles.error}>
              {snapshot.error}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        !snapshot.error ? (
          <Text testID="dose_empty" style={styles.message}>
            {snapshot.rows.length
              ? 'No medication doses match your search.'
              : 'No medication doses are scheduled for today.'}
          </Text>
        ) : null
      }
      renderItem={({ item: row, index }) => (
        <View style={styles.card} testID={`dose_row_${index}`}>
          <Text style={styles.medication}>{row.PrescriptionName}</Text>
          <Text>Patient {row.PatientID}</Text>
          <Text>
            {row.AdministerDate} · {clock(row.AdministerTime)} (Singapore)
          </Text>
          <Text>Assigned caregiver: {row.AssignedTo || 'Unassigned'}</Text>
          <Text style={styles[medicationDoseStatus(row, new Date(now))]}>
            {String(row.Status) === '1'
              ? '✓ Administered'
              : medicationDoseStatus(row, new Date(now)) === 'late'
              ? '! Not administered (late)'
              : '◷ Not administered'}
          </Text>
          {String(row.Status) === '1' ? (
            <View>
              <Text>
                Administered by: {row.AdministeredBy || 'Not provided'}
              </Text>
              <Text>
                Actual administration:{' '}
                {row.ActualAdministerTime || 'Not provided'}
              </Text>
            </View>
          ) : (
            <Control
              title="Administer"
              testID={`dose_administer_${index}`}
              disabled={busy || row.AdministerDate !== day}
              onPress={() => administer(row)}
            />
          )}
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16324f',
    marginBottom: 8,
  },
  note: { color: '#475569', marginVertical: 10 },
  search: {
    backgroundColor: '#fff',
    borderColor: '#64748b',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    color: '#16324f',
  },
  administered: { color: '#167045', fontWeight: '600' },
  pending: { color: '#855500', fontWeight: '600' },
  late: { color: '#a51b24', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    gap: 6,
  },
  medication: { fontSize: 18, fontWeight: '600', color: '#16324f' },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#176b8c',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginVertical: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.45 },
  message: { margin: 20 },
  error: { color: '#a51b24', marginVertical: 12 },
});
