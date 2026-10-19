import React, { useCallback, useContext, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AuthContext from 'app/auth/context';
import { getNextWeekPreview } from 'app/api/careReads';
import { previewResult, reportedTime } from 'app/utility/careReadResults';
import { currentUserId } from 'app/utility/medicationAdminister';
import useCareRead from 'app/hooks/useCareRead';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import layout from 'app/config/layout';

export default function NextWeekPreviewScreen() {
  const { user } = useContext(AuthContext) || {};
  const permitted =
    String(user?.roleName || user?.role || '').toUpperCase() === 'SUPERVISOR';
  const [expanded, setExpanded] = useState(null);
  const load = useCallback(
    async () => previewResult(await getNextWeekPreview()),
    [],
  );
  const state = useCareRead(
    JSON.stringify([currentUserId(user), permitted]),
    load,
    permitted,
  );
  if (!permitted) {
    return (
      <Text style={styles.message}>
        Next-week preview requires Supervisor access.
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
            title="Retry preview"
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
      testID="next-week-preview-list"
      data={state.data.patients}
      keyExtractor={(row) => row.id}
      ListHeaderComponent={
        <View style={layout.section}>
          <Text style={styles.heading}>
            Next week: {state.data.start} to {state.data.end}
          </Text>
          <Text style={styles.message}>
            Read-only preview. This week is unchanged, and next week can still
            change before it is saved.
          </Text>
          {state.data.builtAt ? (
            <Text style={styles.meta}>
              Built {reportedTime(state.data.builtAt)}
            </Text>
          ) : null}
          <AppButton
            title="Refresh preview"
            color="green"
            onPress={state.reload}
          />
        </View>
      }
      ListEmptyComponent={
        <Text>No patient schedules are available in this preview.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.patient}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === item.id }}
            testID={`preview-patient-${item.id}`}
            style={styles.patientButton}
            onPress={() =>
              setExpanded((old) => (old === item.id ? null : item.id))
            }
          >
            <Text style={styles.patientName}>{item.name}</Text>
            <Text style={styles.meta}>
              {expanded === item.id ? 'Hide week' : 'View week'}
            </Text>
          </TouchableOpacity>
          {expanded === item.id
            ? item.days.map((day) => (
                <View key={day.date.toISOString()} style={styles.day}>
                  <Text style={styles.dayName}>
                    {day.date.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                  {day.activities.length ? (
                    day.activities.map((activity, index) => (
                      <View key={index}>
                        <Text style={styles.slot}>
                          {activity.startTime.toTimeString().slice(0, 5)}–
                          {activity.endTime.toTimeString().slice(0, 5)}{' '}
                          {activity.activityTitle}
                        </Text>
                        {activity.medications.map((med, index) => (
                          <Text key={index} style={styles.slot}>
                            Medication: {med.medName} {med.medDosage} ·{' '}
                            {med.medTime}
                            {med.medNote ? ` - ${med.medNote}` : ''}
                          </Text>
                        ))}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.slot}>No activities planned.</Text>
                  )}
                </View>
              ))
            : null}
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  heading: { ...typography.heading2, color: colors.black, marginBottom: 12 },
  message: {
    ...typography.subheading1,
    lineHeight: 24,
    marginBottom: 16,
    color: colors.black,
  },
  meta: { ...typography.body1, color: colors.grey, lineHeight: 20 },
  patient: {
    borderBottomWidth: 1,
    borderColor: colors.grey_lighter,
    marginBottom: 12,
    paddingBottom: 12,
  },
  patientButton: { minHeight: 56, paddingVertical: 12 },
  patientName: {
    ...typography.subheading1SemiBold,
    color: colors.green,
    marginBottom: 4,
  },
  day: { marginTop: 16 },
  dayName: {
    ...typography.body1SemiBold,
    color: colors.black,
    marginBottom: 8,
  },
  slot: {
    ...typography.body1,
    lineHeight: 22,
    color: colors.black,
    marginBottom: 6,
  },
});
