import React, { useCallback, useContext, useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import AuthContext from 'app/auth/context';
import { getPatientHistory } from 'app/api/careReads';
import { historyResult, reportedTime } from 'app/utility/careReadResults';
import { currentUserId } from 'app/utility/medicationAdminister';
import useCareRead from 'app/hooks/useCareRead';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import layout from 'app/config/layout';

export default function PatientHistoryScreen({ route }) {
  const { user } = useContext(AuthContext) || {};
  const patientId = String(
    route.params?.patientId ?? route.params?.patientID ?? '',
  );
  const permitted = ['SUPERVISOR', 'CAREGIVER', 'DOCTOR'].includes(
    String(user?.roleName || user?.role || '').toUpperCase(),
  );
  const [choice, setChoice] = useState({ patientId, page: 0 });
  const page = choice.patientId === patientId ? choice.page : 0;
  const load = useCallback(
    async () =>
      historyResult(await getPatientHistory(patientId, page), patientId, page),
    [patientId, page],
  );
  const state = useCareRead(
    JSON.stringify([currentUserId(user), permitted, patientId, page]),
    load,
    permitted,
  );
  if (!permitted) {
    return (
      <Text style={styles.message}>
        Patient history is available to care staff.
      </Text>
    );
  }
  if (state.loading) {
    return <ActivityIndicator visible />;
  }
  if (state.error) {
    return (
      <View style={layout.formContent}>
        <Text accessibilityRole="alert">{state.error}</Text>
        {state.retry ? (
          <AppButton
            title="Retry history"
            color="green"
            onPress={state.reload}
          />
        ) : null}
      </View>
    );
  }
  return (
    <FlatList
      style={layout.page}
      contentContainerStyle={layout.formContent}
      testID="patient-history-list"
      data={state.data.rows}
      keyExtractor={(row, index) =>
        `${row.timestamp}-${row.entity_id}-${index}`
      }
      ListHeaderComponent={
        <View style={layout.section}>
          <Text style={styles.heading}>
            {state.data.rows[0]?.patient_full_name ||
              route.params?.patientProfile?.preferredName ||
              `Patient ${patientId}`}{' '}
            — history
          </Text>
          <Text style={styles.message}>
            Changes to this patient's records. This is separate from centre-wide
            medication records.
          </Text>
          <Text style={styles.meta}>
            Page {page + 1} of {Math.max(1, state.data.totalPages)} ·{' '}
            {state.data.totalRecords} records
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text>No history records were returned for this patient.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.summary}>
            {item.message || 'Patient record changed'}
          </Text>
          <Text style={styles.meta}>
            Recorded {reportedTime(item.timestamp)}
          </Text>
          <Text style={styles.meta}>
            By {item.user_full_name || item.user || 'Name unavailable'}
          </Text>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.paging}>
          <AppButton
            title="Previous page"
            color="grey"
            isDisabled={page === 0}
            onPress={() => setChoice({ patientId, page: page - 1 })}
          />
          <AppButton
            title="Next page"
            color="green"
            isDisabled={page + 1 >= state.data.totalPages}
            onPress={() => setChoice({ patientId, page: page + 1 })}
          />
        </View>
      }
    />
  );
}
const styles = StyleSheet.create({
  heading: { ...typography.heading2, color: colors.black, marginBottom: 12 },
  message: {
    ...typography.subheading1,
    color: colors.black,
    lineHeight: 24,
    marginBottom: 16,
  },
  meta: { ...typography.body1, color: colors.grey, lineHeight: 21 },
  summary: {
    ...typography.subheading1Medium,
    color: colors.black,
    lineHeight: 24,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 16,
    borderBottomColor: colors.grey_lighter,
    borderBottomWidth: 1,
  },
  paging: { paddingVertical: 20 },
});
