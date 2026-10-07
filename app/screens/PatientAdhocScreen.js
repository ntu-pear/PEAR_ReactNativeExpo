import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import useCentreManagement from 'app/hooks/useCentreManagement';
import { activityLabel, currentWeekDates } from 'app/utility/centreManagement';
import { activityMutationBlockReason } from 'app/utility/activityManagementPolicy';

export default function PatientAdhocScreen({ route }) {
  const patientId = route?.params?.patientID ?? route?.params?.patientId;
  const state = useCentreManagement(patientId, true);
  const [paging, setPaging] = useState({ identity: '', page: 0 });
  if (!state.permitted || !patientId) {
    return (
      <Text>
        Patient ad hoc access requires a selected patient and Supervisor access.
      </Text>
    );
  }
  const dates = currentWeekDates(),
    rows = state.data?.adhocs || [];
  const page = Math.min(
    paging.identity === state.identity ? paging.page : 0,
    Math.max(0, Math.ceil(rows.length / 50) - 1),
  );
  const changePage = (value) =>
    setPaging({ identity: state.identity, page: Math.max(0, value) });
  const centres = state.data?.centres || [];
  const label = (id) =>
    activityLabel(
      centres.find((row) => String(row.id) === String(id)) || { id },
      state.data.activities,
    );
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      testID="patient_current_week_adhoc"
    >
      <Text style={styles.heading}>Patient ad hoc requests</Text>
      <Text>
        Patient {patientId}. Singapore dates: {dates[0]} through{' '}
        {dates[dates.length - 1]}.
      </Text>
      <Text accessibilityRole="alert">
        {activityMutationBlockReason('adhoc')} Current requests are read-only. A
        saved Pending request does not prove that the scheduler applied it.
      </Text>
      {state.loading ? <ActivityIndicator /> : null}
      {state.error ? (
        <Text accessibilityRole="alert">{state.error}</Text>
      ) : null}
      <TouchableOpacity
        disabled={state.busy}
        style={styles.button}
        onPress={state.refresh}
      >
        <Text>Reload patient activities and requests</Text>
      </TouchableOpacity>
      {state.pending ? (
        <Text accessibilityRole="alert">
          An earlier management change is unconfirmed. Do not submit it again.
          Check its outcome from activity management.
        </Text>
      ) : null}
      {state.data && !rows.length ? (
        <Text>No active ad hoc requests for this patient.</Text>
      ) : null}
      {state.data ? (
        <Text>
          {rows.length} patient requests; page {page + 1}
        </Text>
      ) : null}
      {rows.slice(page * 50, (page + 1) * 50).map((row) => (
        <View key={String(row.id)} style={styles.card}>
          <Text>
            Request {row.id}: {row.status}
          </Text>
          <Text>
            {label(row.old_centre_activity_id)} to{' '}
            {label(row.new_centre_activity_id)}
          </Text>
          <Text>
            {row.start_date} to {row.end_date}
          </Text>
        </View>
      ))}
      {rows.length > 50 ? (
        <View>
          <TouchableOpacity
            disabled={page === 0}
            style={styles.button}
            onPress={() => changePage(page - 1)}
          >
            <Text>Previous requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={(page + 1) * 50 >= rows.length}
            style={styles.button}
            onPress={() => changePage(page + 1)}
          >
            <Text>Next requests</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 19, fontWeight: '600', marginVertical: 10 },
  button: {
    padding: 12,
    minHeight: 48,
    marginVertical: 4,
    backgroundColor: '#e7edf5',
    borderRadius: 6,
  },
  card: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
});
