import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  Switch,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import AuthContext from 'app/auth/context';
import api from 'app/api/activityTemplates';
import {
  newTemplate,
  templatePayload,
  templateMatches,
  writeTemplate,
} from 'app/utility/templateEditing';
import { currentUserId } from 'app/utility/medicationAdminister';
import useCareRead from 'app/hooks/useCareRead';
import { requireRead } from 'app/utility/careReadResults';
import InputField from 'app/components/input-components/InputField';
import AppButton from 'app/components/AppButton';
import ActivityIndicator from 'app/components/ActivityIndicator';
import layout from 'app/config/layout';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import requestDeadline from 'app/utility/requestDeadline';

const fields = [
  ['name', 'Template name'],
  ['title', 'Activity title'],
  ['description', 'Description'],
  ['start_date', 'Default start date (YYYY-MM-DD)'],
  ['end_date', 'Default end date (YYYY-MM-DD)'],
  ['min_duration', 'Minimum duration (minutes)'],
  ['max_duration', 'Maximum duration (minutes)'],
  ['min_people_req', 'Minimum people'],
  ['fixed_time_slots', 'Fixed time slots (optional)'],
];
export default function ActivityTemplatesScreen() {
  const { user } = useContext(AuthContext) || {};
  const permitted =
    String(user?.roleName || user?.role || '').toUpperCase() === 'SUPERVISOR';
  const identity = JSON.stringify([currentUserId(user), permitted]);
  const current = useRef(identity);
  current.current = identity;
  const operation = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [page, setPage] = useState(0);
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    const response = await api.list(page);
    requireRead(response, 'activity templates');
    if (
      !Array.isArray(response.data) ||
      response.data.some((row) => !row.id || typeof row.name !== 'string')
    ) {
      throw new Error('The template list could not be verified.');
    }
    return response.data;
  }, [page]);
  const state = useCareRead(JSON.stringify([identity, page]), load, permitted);
  const shown = editor?.identity === identity ? editor : null;
  const unconfirmed = pending?.identity === identity ? pending : null;
  const open = async (row) => {
    if (operation.current || unconfirmed) {
      return;
    }
    const owner = identity;
    setMessage('');
    if (!row) {
      setEditor({ identity: owner, draft: newTemplate() });
      return;
    }
    operation.current = true;
    setBusy(true);
    try {
      const response = await requestDeadline(api.get(row.id));
      requireRead(response, 'template');
      if (String(response.data?.id) !== String(row.id)) {
        throw new Error('The response did not match this template.');
      }
      if (alive.current && current.current === owner) {
        setEditor({ identity: owner, draft: { ...response.data } });
      }
    } catch (error) {
      if (alive.current && current.current === owner) {
        setMessage(error.message);
      }
    } finally {
      operation.current = false;
      if (alive.current && current.current === owner) {
        setBusy(false);
      }
    }
  };
  const execute = async (remove = false) => {
    if (!shown || operation.current || unconfirmed) {
      return;
    }
    const owner = identity;
    operation.current = true;
    setBusy(true);
    setMessage('');
    try {
      const payload = templatePayload(shown.draft, user);
      const result = await writeTemplate({
        api,
        payload: { ...payload, expectedModified: shown.draft.modified_date },
        remove,
        isCurrent: () => alive.current && current.current === owner,
      });
      if (
        !alive.current ||
        current.current !== owner ||
        result.outcome === 'stale'
      ) {
        return;
      }
      if (result.outcome === 'verified') {
        setEditor(null);
        setMessage(
          remove
            ? 'Template deleted and verified.'
            : 'Template saved and verified.',
        );
        state.reload();
      } else {
        setMessage(result.message);
        if (result.outcome === 'uncertain') {
          setPending({ identity: owner, id: result.id, payload, remove });
        }
      }
    } catch (error) {
      if (alive.current && current.current === owner) {
        setMessage(error.message);
      }
    } finally {
      operation.current = false;
      if (alive.current && current.current === owner) {
        setBusy(false);
      }
    }
  };
  const check = async () => {
    if (!unconfirmed || operation.current) {
      return;
    }
    const owner = identity;
    operation.current = true;
    setBusy(true);
    try {
      const response = await requestDeadline(
        unconfirmed.id
          ? api.get(unconfirmed.id, unconfirmed.remove)
          : api.list(0),
      );
      const rows = Array.isArray(response?.data)
        ? response.data
        : [response?.data];
      const record = rows.find(
        (row) =>
          row &&
          (unconfirmed.id
            ? String(row.id) === String(unconfirmed.id)
            : row.name === unconfirmed.payload.name),
      );
      const expected = unconfirmed.remove
        ? { id: Number(unconfirmed.id), is_deleted: true }
        : { ...unconfirmed.payload, id: record?.id, is_deleted: false };
      if (!alive.current || current.current !== owner) {
        return;
      }
      if (response?.ok && templateMatches(expected, record)) {
        setPending(null);
        setEditor(null);
        setMessage('The saved outcome has been verified.');
        state.reload();
      } else {
        setMessage(
          'The outcome is still unconfirmed. No new change has been sent. Check again later.',
        );
      }
    } catch {
      if (alive.current && current.current === owner) {
        setMessage(
          'The outcome is still unconfirmed. No new change has been sent.',
        );
      }
    } finally {
      operation.current = false;
      if (alive.current && current.current === owner) {
        setBusy(false);
      }
    }
  };
  if (!permitted) {
    return (
      <Text style={styles.message}>
        Template management requires Supervisor access.
      </Text>
    );
  }
  if (shown) {
    return (
      <ScrollView
        style={layout.page}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={layout.formContent}
      >
        <Text style={styles.heading}>
          {shown.draft.id ? 'Edit template' : 'New template'}
        </Text>
        <Text style={styles.message}>
          Save reusable defaults here. Saving a template does not create or
          schedule an activity.
        </Text>
        <View pointerEvents={busy || unconfirmed ? 'none' : 'auto'}>
          {fields.map(([key, title]) => (
            <InputField
              key={key}
              testID={`template-${key}`}
              title={title}
              value={String(shown.draft[key] ?? '')}
              autoCapitalize="none"
              isRequired={['name', 'title'].includes(key)}
              variant={key === 'description' ? 'multiLine' : 'singleLine'}
              keyboardType={
                ['min_duration', 'max_duration', 'min_people_req'].includes(key)
                  ? 'numeric'
                  : 'default'
              }
              onChangeText={(value) =>
                setEditor((old) =>
                  old?.identity === identity
                    ? { ...old, draft: { ...old.draft, [key]: value } }
                    : old,
                )
              }
            />
          ))}
          {[
            ['is_compulsory', 'Compulsory by default'],
            ['is_fixed', 'Fixed timing by default'],
            ['is_group', 'Group activity by default'],
          ].map(([key, label]) => (
            <View key={key} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{label}</Text>
              <Switch
                accessibilityLabel={label}
                value={!!shown.draft[key]}
                trackColor={{ true: colors.green }}
                onValueChange={(value) =>
                  setEditor((old) =>
                    old?.identity === identity
                      ? { ...old, draft: { ...old.draft, [key]: value } }
                      : old,
                  )
                }
              />
            </View>
          ))}
        </View>
        {message ? (
          <Text accessibilityRole="alert" style={styles.message}>
            {message}
          </Text>
        ) : null}
        {unconfirmed ? (
          <AppButton
            title="Check outcome"
            color="green"
            isDisabled={busy}
            onPress={check}
          />
        ) : (
          <AppButton
            title={busy ? 'Saving...' : 'Save template'}
            color="green"
            isDisabled={busy}
            testID="template-save"
            onPress={() => execute(false)}
          />
        )}
        {shown.draft.id && !unconfirmed ? (
          <AppButton
            title="Delete template"
            color="red"
            isDisabled={busy}
            testID="template-delete"
            onPress={() =>
              Alert.alert(
                'Delete template?',
                `Delete ${shown.draft.name}? Activities already created from it are unchanged.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => execute(true),
                  },
                ],
              )
            }
          />
        ) : null}
        <AppButton
          title="Back to templates"
          color="grey"
          isDisabled={busy}
          onPress={() => setEditor(null)}
        />
      </ScrollView>
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
            title="Retry templates"
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
      testID="activity-template-list"
      data={state.data}
      keyExtractor={(row) => String(row.id)}
      ListHeaderComponent={
        <View style={layout.section}>
          <Text style={styles.heading}>Activity templates</Text>
          <Text style={styles.message}>
            Reusable activity forms. Creating centre activities and availability
            is a separate step.
          </Text>
          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}
          {unconfirmed ? (
            <AppButton
              title="Check outcome"
              color="green"
              isDisabled={busy}
              onPress={check}
            />
          ) : (
            <AppButton
              title="New template"
              color="green"
              testID="template-new"
              isDisabled={busy}
              onPress={() => open(null)}
            />
          )}
          <Text style={styles.meta}>Page {page + 1}</Text>
        </View>
      }
      ListEmptyComponent={<Text>No templates were returned on this page.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.title}</Text>
          <AppButton
            title="Edit template"
            color="grey"
            testID={`template-edit-${item.id}`}
            isDisabled={busy || !!unconfirmed}
            onPress={() => open(item)}
          />
        </View>
      )}
      ListFooterComponent={
        <View style={styles.paging}>
          <AppButton
            title="Previous page"
            color="grey"
            isDisabled={busy || page === 0}
            onPress={() => setPage((n) => n - 1)}
          />
          <AppButton
            title="Next page"
            color="green"
            isDisabled={busy || state.data.length < 20}
            onPress={() => setPage((n) => n + 1)}
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
    lineHeight: 24,
    color: colors.black,
    marginBottom: 16,
  },
  meta: { ...typography.body1, color: colors.grey, lineHeight: 20 },
  name: {
    ...typography.subheading1SemiBold,
    color: colors.black,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 16,
    borderBottomColor: colors.grey_lighter,
    borderBottomWidth: 1,
  },
  paging: { paddingVertical: 20 },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: { ...typography.subheading1, flex: 1, marginRight: 16 },
});
