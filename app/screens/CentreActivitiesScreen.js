import colors from 'app/config/colors';
import React, { useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import useCentreManagement from 'app/hooks/useCentreManagement';
import ActivityManagementForm from 'app/components/ActivityManagementForm';
import {
  buildActivityPayload,
  activityLabel,
  weekDays,
  hasWeekday,
} from 'app/utility/centreManagement';
import { centreDay } from 'app/utility/centreClock';
import { activityMutationBlockReason } from 'app/utility/activityManagementPolicy';

const kinds = {
  activity: 'Catalogue',
  centre: 'Centre activities',
  availability: 'Availabilities',
};
export default function CentreActivitiesScreen() {
  const state = useCentreManagement();
  const [kind, setKind] = useState('centre');
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const editGeneration = useRef(0);
  const visibleEditor =
    editor?.identity === state.identity && editor.kind === kind ? editor : null;
  const close = () => {
    editGeneration.current += 1;
    setEditor(null);
    setMessage('');
  };
  const open = (row) => {
    editGeneration.current += 1;
    setMessage('');
    const today = centreDay();
    setEditor({
      identity: state.identity,
      kind,
      generation: editGeneration.current,
      draft: row
        ? { ...row }
        : {
            title: '',
            description: '',
            activity_id: '',
            centre_activity_id: '',
            start_date: today,
            end_date: kind === 'centre' ? '2999-01-01' : today,
            min_duration: 60,
            min_people_req: 2,
            is_fixed: false,
            is_compulsory: false,
            is_group: false,
            fixed_time_slots: '',
            start_time: '',
            end_time: '',
            days_of_week: 0,
          },
    });
  };
  const execute = async (action, draft, generation) => {
    if (
      !state.current() ||
      generation !== editGeneration.current ||
      state.busy ||
      state.pending
    ) {
      return;
    }
    try {
      const payload = buildActivityPayload({
        kind,
        action,
        draft,
        user: state.user,
        data: state.data,
      });
      const result = await state.save({
        kind,
        action,
        payload,
        expectedModifiedDate: draft.modified_date,
      });
      if (!state.current() || generation !== editGeneration.current) {
        return;
      }
      if (result.outcome === 'verified') {
        setEditor(null);
        setMessage(
          action === 'delete' ? 'Activity deleted.' : 'Activity saved.',
        );
        state.refresh();
      } else {
        setMessage(
          result.message ||
            'The change is unconfirmed. Check its outcome before another change.',
        );
      }
    } catch (error) {
      if (state.current()) {
        setMessage(error.message);
      }
    }
  };
  const confirm = (action, draft) => {
    const generation = editGeneration.current;
    Alert.alert(
      action === 'delete' ? 'Delete activity?' : 'Save activity?',
      action === 'delete'
        ? 'This removes the activity from active lists and retains its history.'
        : 'Confirm the activity settings and configured centre hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'delete' ? 'Delete' : 'Save',
          onPress: () => execute(action, draft, generation),
        },
      ],
    );
  };
  if (!state.permitted) {
    return <Text>Activity management requires Supervisor access.</Text>;
  }
  const blockedReason = activityMutationBlockReason(kind);
  const disabled =
    state.busy ||
    state.pending ||
    state.loading ||
    !state.data ||
    !!blockedReason;
  const items =
    state.data?.[
      kind === 'activity'
        ? 'activities'
        : kind === 'centre'
        ? 'centres'
        : 'availabilities'
    ] || [];
  const label = (row) =>
    kind === 'activity'
      ? `${row.title} (#${row.id})`
      : kind === 'centre'
      ? activityLabel(row, state.data.activities)
      : `${activityLabel(
          state.data.centres.find(
            (c) => String(c.id) === String(row.centre_activity_id),
          ) || { id: row.centre_activity_id },
          state.data.activities,
        )}: ${row.start_time?.slice(0, 5)}–${row.end_time?.slice(0, 5)} (#${
          row.id
        })`;
  const rows = items.filter(
    (r) =>
      (includeDeleted || !r.is_deleted) &&
      label(r).toLowerCase().includes(search.toLowerCase()),
  );
  const displayPage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / 50) - 1),
  );
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="centre_activity_management"
    >
      <Text style={styles.heading}>Centre activities</Text>
      <View style={styles.tabs}>
        {Object.entries(kinds).map(([value, title]) => (
          <TouchableOpacity
            key={value}
            disabled={state.busy}
            accessibilityState={{ selected: kind === value }}
            style={[styles.chip, kind === value && styles.chipSelected]}
            onPress={() => {
              close();
              setKind(value);
              setPage(0);
            }}
          >
            <Text
              style={[
                styles.chipText,
                kind === value && styles.chipTextSelected,
              ]}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {blockedReason && kind !== 'availability' ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          {blockedReason}
        </Text>
      ) : null}
      {kind === 'availability' ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          This list shows at most 100 entries, so it may be incomplete.{' '}
          {blockedReason}
        </Text>
      ) : null}
      {state.loading ? <ActivityIndicator /> : null}
      {state.error ? (
        <Text accessibilityRole="alert">{state.error}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        disabled={state.busy}
        onPress={() => {
          close();
          state.refresh();
        }}
      >
        <Text style={styles.buttonText}>Reload activities and hours</Text>
      </TouchableOpacity>
      {state.data ? (
        <View>
          <Text style={styles.heading}>Configured centre hours</Text>
          {state.data.hours.map((r) => (
            <Text key={r.day} style={styles.detail}>
              {r.day}: {r.open ? `${r.open}–${r.close}` : 'Closed'}
            </Text>
          ))}
        </View>
      ) : null}
      {state.pending ? (
        <View>
          <Text accessibilityRole="alert">
            A change is unconfirmed. Do not submit it again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            disabled={state.busy}
            onPress={async () => {
              const result = await state.reconcile();
              if (state.current()) {
                setMessage(
                  result.outcome === 'observed'
                    ? 'The recorded change was found. Changes remain read-only while confirmation is reviewed.'
                    : result.outcome === 'no_pending'
                    ? 'No recorded change was found. Changes remain read-only.'
                    : 'The outcome is still unconfirmed. No change was resent.',
                );
                if (['verified', 'no_pending'].includes(result.outcome)) {
                  state.refresh();
                }
              }
            }}
          >
            <Text style={styles.buttonText}>Check saved outcome</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {message ? <Text accessibilityRole="alert">{message}</Text> : null}
      {visibleEditor && state.data ? (
        <View style={styles.card}>
          <Text style={styles.heading}>
            {visibleEditor.draft.id ? 'Edit' : 'Add'} {kinds[kind]}
          </Text>
          <ActivityManagementForm
            kind={kind}
            data={state.data}
            draft={visibleEditor.draft}
            disabled={disabled}
            onChange={(draft) => setEditor({ ...visibleEditor, draft })}
          />
          <TouchableOpacity
            style={styles.button}
            disabled={disabled}
            onPress={() =>
              confirm(
                visibleEditor.draft.id ? 'update' : 'create',
                visibleEditor.draft,
              )
            }
          >
            <Text style={styles.buttonText}>Review and save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            disabled={state.busy}
            onPress={close}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            accessibilityLabel="Search activities"
            placeholder="Search activities"
            style={styles.search}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(0);
            }}
          />
          <View style={styles.tabs}>
            <Text>Include deleted</Text>
            <Switch
              accessibilityLabel="Include deleted"
              value={includeDeleted}
              onValueChange={(value) => {
                setIncludeDeleted(value);
                setPage(0);
              }}
            />
          </View>
          {!blockedReason ? (
            <TouchableOpacity
              style={styles.button}
              disabled={disabled}
              onPress={() => open(null)}
            >
              <Text style={styles.buttonText}>Add {kinds[kind]}</Text>
            </TouchableOpacity>
          ) : null}
          {state.data && rows.length === 0 ? (
            <Text>
              {kind === 'availability'
                ? 'No matching rows in the returned availability snapshot. More records may exist.'
                : 'No matching activities.'}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
            {rows.length > 50 ? `, page ${displayPage + 1}` : ''}
          </Text>
          {rows.slice(displayPage * 50, (displayPage + 1) * 50).map((row) => (
            <View key={String(row.id)} style={styles.card}>
              <Text style={styles.name}>
                {label(row)}
                {row.is_deleted ? ' (deleted)' : ''}
              </Text>
              {kind !== 'activity' ? (
                <Text style={styles.detail}>
                  {row.start_date} to {row.end_date}
                  {kind === 'centre'
                    ? `; ${row.min_duration} minutes; ${
                        row.is_compulsory ? 'Compulsory' : 'Optional'
                      }; ${row.is_group ? 'Group' : 'Individual'}; ${
                        row.is_fixed ? 'Fixed' : 'Flexible'
                      }`
                    : `; ${
                        weekDays
                          .filter((_, i) => hasWeekday(row.days_of_week, i))
                          .join(', ') || 'One date'
                      }`}
                </Text>
              ) : (
                <Text style={styles.detail}>{row.description || ''}</Text>
              )}
              {row.fixed_time_slots ? (
                <Text style={styles.detail}>
                  {String(row.fixed_time_slots).split(',').join(', ')}
                </Text>
              ) : null}
              {!row.is_deleted && !blockedReason ? (
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={styles.button}
                    disabled={disabled}
                    onPress={() => open(row)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    disabled={disabled}
                    onPress={() => {
                      editGeneration.current += 1;
                      confirm('delete', row);
                    }}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))}
          {rows.length > 50 ? (
            <View style={styles.tabs}>
              <TouchableOpacity
                disabled={displayPage === 0}
                style={styles.button}
                onPress={() => setPage(Math.max(0, displayPage - 1))}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={(displayPage + 1) * 50 >= rows.length}
                style={styles.button}
                onPress={() => setPage(displayPage + 1)}
              >
                <Text style={styles.buttonText}>Next</Text>
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
  tabs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    marginVertical: 4,
    marginRight: 6,
    backgroundColor: colors.green,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.green,
  },
  chipSelected: { backgroundColor: colors.green },
  chipText: { color: colors.green, fontWeight: '600' },
  chipTextSelected: { color: colors.white },
  notice: {
    backgroundColor: colors.green_lightest,
    color: colors.black,
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  detail: { color: colors.black, lineHeight: 21 },
  meta: { color: colors.grey, marginVertical: 8 },
  card: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey_lighter,
    borderRadius: 8,
  },
  search: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 6,
    minHeight: 48,
    marginTop: 16,
  },
});
