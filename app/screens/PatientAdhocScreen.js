import React, { useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import useCentreManagement from 'app/hooks/useCentreManagement';
import { ManagementField } from 'app/components/ActivityManagementForm';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import {
  activityLabel,
  buildActivityPayload,
  currentWeekDates,
  patientScheduledCentreIds,
} from 'app/utility/centreManagement';
import { centreDay } from 'app/utility/centreClock';
import { exclusionBlockedIds } from 'app/utility/exclusionEligibility';

const dateTimeFields = (value) => {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) {
    throw new Error('The saved ad hoc date is invalid. Reload.');
  }
  return {
    date: centreDay(instant),
    time: new Date(instant.getTime() + 8 * 3600000).toISOString().slice(11, 16),
  };
};
export default function PatientAdhocScreen({ route }) {
  const patientId = route?.params?.patientID ?? route?.params?.patientId;
  const state = useCentreManagement(patientId, true);
  const [editor, setEditor] = useState(null);
  const [message, setMessage] = useState('');
  const [paging, setPaging] = useState({ identity: '', page: 0 });
  const generation = useRef(0);
  const visible = editor?.identity === state.identity ? editor : null;
  const dates = currentWeekDates();
  const close = () => {
    generation.current += 1;
    setEditor(null);
    setMessage('');
  };
  const open = (row) => {
    try {
      generation.current += 1;
      setMessage('');
      const start = row
        ? dateTimeFields(row.start_date)
        : { date: dates[0], time: '09:00' };
      const end = row
        ? dateTimeFields(row.end_date)
        : { date: dates[0], time: '10:00' };
      setEditor({
        identity: state.identity,
        draft: {
          ...row,
          old_centre_activity_id: row?.old_centre_activity_id || '',
          new_centre_activity_id: row?.new_centre_activity_id || '',
          start_date: start.date,
          start_time: start.time,
          end_date: end.date,
          end_time: end.time,
        },
      });
    } catch (error) {
      setMessage(error.message);
    }
  };
  let scheduled = { ids: [], ambiguousTitles: [] },
    selectionError = '';
  if (visible && state.data) {
    try {
      scheduled = patientScheduledCentreIds({
        rows: state.data.schedule,
        patientId,
        startDate: visible.draft.start_date,
        endDate: visible.draft.end_date,
        centres: state.data.centres,
        activities: state.data.activities,
      });
    } catch (error) {
      selectionError = error.message;
    }
  }
  const submit = async (action, draft, attempt) => {
    if (
      attempt !== generation.current ||
      !state.current() ||
      state.busy ||
      state.pending ||
      !patientId
    ) {
      return;
    }
    try {
      const context = { ...state.data, oldScheduledIds: scheduled.ids };
      const payload = buildActivityPayload({
        kind: 'adhoc',
        action,
        draft,
        user: state.user,
        data: context,
        patientId,
      });
      const result = await state.save({
        kind: 'adhoc',
        action,
        payload,
        expectedModifiedDate: draft.modified_date,
        expectedPatientId: patientId,
      });
      if (attempt !== generation.current || !state.current()) {
        return;
      }
      if (result.outcome === 'verified') {
        setEditor(null);
        setMessage(
          action === 'delete'
            ? 'Ad hoc request deleted.'
            : `Ad hoc request saved (${result.record.status}). Check the patient schedule after it updates.`,
        );
      } else {
        setMessage(
          result.message ||
            'The outcome is unconfirmed. Check it before another change.',
        );
      }
    } catch (error) {
      if (state.current()) {
        setMessage(error.message);
      }
    }
  };
  const confirm = (action, draft) => {
    const attempt = generation.current;
    Alert.alert(
      action === 'delete'
        ? 'Delete ad hoc request?'
        : 'Save patient ad hoc request?',
      action === 'delete'
        ? 'The request will be removed from active records. Its audit history is retained.'
        : `This affects only patient ${patientId}, from ${draft.start_date} ${draft.start_time} to ${draft.end_date} ${draft.end_time} (Singapore time).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'delete' ? 'Delete' : 'Save',
          onPress: () => submit(action, draft, attempt),
        },
      ],
    );
  };
  if (!state.permitted || !patientId) {
    return (
      <Text>
        Patient ad hoc changes require a selected patient and Supervisor access.
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
  const disabled = state.busy || state.pending || state.loading || !state.data;
  const centres = state.data?.centres.filter((r) => !r.is_deleted) || [];
  const options = (items) =>
    items.map((r) => ({
      value: String(r.id),
      label: activityLabel(r, state.data.activities),
    }));
  const blocked = state.data ? exclusionBlockedIds(state.data.rules) : [];
  const set = (key) => (value) =>
    setEditor({ ...visible, draft: { ...visible.draft, [key]: value } });
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="patient_current_week_adhoc"
    >
      <Text style={styles.heading}>Patient ad hoc changes</Text>
      <Text>
        Patient {patientId}. Singapore dates: {dates[0]} through{' '}
        {dates[dates.length - 1]}.
      </Text>
      <Text>
        Replace an existing scheduled centre activity for this patient. New
        requests are saved as Pending; other patients are unchanged.
      </Text>
      {state.loading ? <ActivityIndicator /> : null}
      {state.error ? (
        <Text accessibilityRole="alert">{state.error}</Text>
      ) : null}
      <TouchableOpacity
        disabled={state.busy}
        style={styles.button}
        onPress={() => {
          close();
          state.refresh();
        }}
      >
        <Text>Reload patient activities and requests</Text>
      </TouchableOpacity>
      {state.pending ? (
        <View>
          <Text accessibilityRole="alert">
            A change is unconfirmed. Do not submit it again.
          </Text>
          <TouchableOpacity
            disabled={state.busy}
            style={styles.button}
            onPress={async () => {
              const result = await state.reconcile();
              if (state.current()) {
                setMessage(
                  result.outcome === 'verified' ||
                    result.outcome === 'no_pending'
                    ? 'Outcome checked. Reload the request.'
                    : 'Outcome remains unconfirmed. No change was resent.',
                );
              }
            }}
          >
            <Text>Check saved outcome</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {message ? <Text accessibilityRole="alert">{message}</Text> : null}
      {visible && state.data ? (
        <View style={styles.card}>
          <ManagementField
            label="Start date (YYYY-MM-DD)"
            value={visible.draft.start_date}
            onChange={set('start_date')}
            disabled={disabled}
          />
          <ManagementField
            label="Start time (HH:mm)"
            value={visible.draft.start_time}
            onChange={set('start_time')}
            disabled={disabled}
          />
          <ManagementField
            label="End date (YYYY-MM-DD)"
            value={visible.draft.end_date}
            onChange={set('end_date')}
            disabled={disabled}
          />
          <ManagementField
            label="End time (HH:mm)"
            value={visible.draft.end_time}
            onChange={set('end_time')}
            disabled={disabled}
          />
          {selectionError ? (
            <Text accessibilityRole="alert">{selectionError}</Text>
          ) : null}
          {scheduled.ambiguousTitles.length ? (
            <Text accessibilityRole="alert">
              Some scheduled names match multiple centre activities and cannot
              be chosen safely: {scheduled.ambiguousTitles.join(', ')}.
            </Text>
          ) : null}
          {!disabled ? (
            <>
              <SelectionInputField
                title="Scheduled activity to replace"
                value={String(visible.draft.old_centre_activity_id)}
                dataArray={options(
                  centres.filter((r) => scheduled.ids.includes(String(r.id))),
                )}
                onDataChange={set('old_centre_activity_id')}
              />
              <SelectionInputField
                title="Replacement centre activity"
                value={String(visible.draft.new_centre_activity_id)}
                dataArray={options(
                  centres.filter(
                    (r) =>
                      String(r.id) !==
                        String(visible.draft.old_centre_activity_id) &&
                      !blocked.includes(String(r.id)),
                  ),
                )}
                onDataChange={set('new_centre_activity_id')}
              />
            </>
          ) : null}
          <TouchableOpacity
            disabled={disabled || !!selectionError}
            style={styles.button}
            onPress={() =>
              confirm(visible.draft.id ? 'update' : 'create', visible.draft)
            }
          >
            <Text>Review and save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={state.busy}
            style={styles.button}
            onPress={close}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            disabled={disabled}
            style={styles.button}
            onPress={() => open(null)}
          >
            <Text>Add patient ad hoc request</Text>
          </TouchableOpacity>
          {state.data && !state.data.adhocs.length ? (
            <Text>No active ad hoc requests for this patient.</Text>
          ) : null}
          {state.data ? (
            <Text>
              {rows.length} patient requests; page {page + 1}
            </Text>
          ) : null}
          {rows.slice(page * 50, (page + 1) * 50).map((row) => {
            let mutable = false;
            try {
              mutable =
                dates.includes(dateTimeFields(row.start_date).date) &&
                dates.includes(dateTimeFields(row.end_date).date);
            } catch {
              /* Invalid records remain read-only. */
            }
            return (
              <View key={String(row.id)} style={styles.card}>
                <Text>
                  Request {row.id}: {row.status}
                </Text>
                <Text>
                  {activityLabel(
                    centres.find(
                      (r) =>
                        String(r.id) === String(row.old_centre_activity_id),
                    ) || { id: row.old_centre_activity_id },
                    state.data.activities,
                  )}{' '}
                  to{' '}
                  {activityLabel(
                    centres.find(
                      (r) =>
                        String(r.id) === String(row.new_centre_activity_id),
                    ) || { id: row.new_centre_activity_id },
                    state.data.activities,
                  )}
                </Text>
                <Text>
                  {row.start_date} to {row.end_date}
                </Text>
                {mutable ? (
                  <View>
                    <TouchableOpacity
                      disabled={disabled}
                      style={styles.button}
                      onPress={() => open(row)}
                    >
                      <Text>Edit request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={disabled}
                      style={styles.button}
                      onPress={() => {
                        generation.current += 1;
                        confirm('delete', row);
                      }}
                    >
                      <Text>Delete request</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text>Earlier or out-of-week records are read-only.</Text>
                )}
              </View>
            );
          })}
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
        </>
      )}
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
