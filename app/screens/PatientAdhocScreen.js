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
import { activityLabel } from 'app/utility/centreManagement';
import { activityMutationBlockReason } from 'app/utility/activityManagementPolicy';
import colors from 'app/config/colors';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
// '2026-04-30T17:46:59.137000' -> '30 Apr 2026, 17:46'; anything else is shown as given.
export const readableDateTime = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(
    String(value ?? ''),
  );
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return value ?? '';
  const day = `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  return m[4] ? `${day}, ${m[4]}:${m[5]}` : day;
};

export default function PatientAdhocScreen({ route }) {
  const patientId = route?.params?.patientID ?? route?.params?.patientId;
  const patientName = route?.params?.patientName;
  const state = useCentreManagement(patientId, true);
  const [paging, setPaging] = useState({ identity: '', page: 0 });
  if (!state.permitted || !patientId) {
    return (
      <Text>
        Patient ad hoc access requires a selected patient and Supervisor access.
      </Text>
    );
  }
  const rows = state.data?.adhocs || [];
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
      <Text style={styles.heading}>
        {patientName || `Patient ${patientId}`}
      </Text>
      <Text style={styles.meta}>Active ad hoc requests for this patient.</Text>
      <Text accessibilityRole="alert" style={styles.notice}>
        {activityMutationBlockReason('adhoc')} The requests below can be viewed
        but not changed. A pending request may not yet be in the schedule.
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
        <Text style={styles.buttonText}>Reload requests</Text>
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
        <Text style={styles.meta}>
          {rows.length} {rows.length === 1 ? 'request' : 'requests'}
          {rows.length > 50 ? `, page ${page + 1}` : ''}
        </Text>
      ) : null}
      {rows.slice(page * 50, (page + 1) * 50).map((row) => (
        <View key={String(row.id)} style={styles.card}>
          <Text style={styles.name}>
            Request {row.id}: {row.status}
          </Text>
          <Text style={styles.detail}>
            {label(row.old_centre_activity_id)} to{' '}
            {label(row.new_centre_activity_id)}
          </Text>
          <Text style={styles.detail}>
            {readableDateTime(row.start_date)} to{' '}
            {readableDateTime(row.end_date)}
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
            <Text style={styles.buttonText}>Previous requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={(page + 1) * 50 >= rows.length}
            style={styles.button}
            onPress={() => changePage(page + 1)}
          >
            <Text style={styles.buttonText}>Next requests</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    marginVertical: 4,
    backgroundColor: colors.green,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  notice: {
    backgroundColor: colors.green_lightest,
    color: colors.black,
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  meta: { color: colors.grey, marginVertical: 6 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  detail: { color: colors.black, lineHeight: 21 },
  card: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey_lighter,
    borderRadius: 8,
  },
});
