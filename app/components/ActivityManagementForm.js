import React from 'react';
import { Text, TextInput, View, Switch, StyleSheet } from 'react-native';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import {
  activityLabel,
  weekDays,
  hasWeekday,
} from 'app/utility/centreManagement';

export const ManagementField = ({
  label,
  value,
  onChange,
  numeric = false,
  disabled = false,
}) => (
  <View style={styles.field}>
    <Text>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      value={String(value ?? '')}
      onChangeText={onChange}
      editable={!disabled}
      keyboardType={numeric ? 'number-pad' : 'default'}
      autoCapitalize="none"
      style={styles.input}
    />
  </View>
);
const Toggle = ({ label, value, onChange, disabled }) => (
  <View style={styles.toggle}>
    <Text>{label}</Text>
    <Switch
      accessibilityLabel={label}
      value={!!value}
      onValueChange={onChange}
      disabled={disabled}
    />
  </View>
);
export default function ActivityManagementForm({
  kind,
  draft,
  onChange,
  data,
  disabled,
}) {
  const set = (key) => (value) => onChange({ ...draft, [key]: value });
  const choices =
    kind === 'centre'
      ? data.activities
          .filter((r) => !r.is_deleted)
          .map((r) => ({ value: String(r.id), label: `${r.title} (#${r.id})` }))
      : data.centres
          .filter((r) => !r.is_deleted)
          .map((r) => ({
            value: String(r.id),
            label: activityLabel(r, data.activities),
          }));
  return (
    <View>
      {kind === 'activity' ? (
        <>
          <ManagementField
            label="Activity name"
            value={draft.title}
            onChange={set('title')}
            disabled={disabled}
          />
          <ManagementField
            label="Description"
            value={draft.description}
            onChange={set('description')}
            disabled={disabled}
          />
        </>
      ) : (
        <>
          {!disabled ? (
            <SelectionInputField
              title={
                kind === 'centre' ? 'Catalogue activity' : 'Centre activity'
              }
              value={String(
                draft.activity_id ?? draft.centre_activity_id ?? '',
              )}
              dataArray={choices}
              onDataChange={set(
                kind === 'centre' ? 'activity_id' : 'centre_activity_id',
              )}
            />
          ) : null}
          <ManagementField
            label="Start date (YYYY-MM-DD)"
            value={draft.start_date}
            onChange={set('start_date')}
            disabled={disabled}
          />
          <ManagementField
            label="End date (YYYY-MM-DD)"
            value={draft.end_date}
            onChange={set('end_date')}
            disabled={disabled}
          />
          {kind === 'centre' ? (
            <>
              <Toggle
                label="Compulsory"
                value={draft.is_compulsory}
                onChange={set('is_compulsory')}
                disabled={disabled}
              />
              <Toggle
                label="Fixed times"
                value={draft.is_fixed}
                onChange={set('is_fixed')}
                disabled={disabled}
              />
              <Toggle
                label="Group participation"
                value={draft.is_group}
                onChange={set('is_group')}
                disabled={disabled}
              />
              {!disabled ? (
                <SelectionInputField
                  title="Duration"
                  value={String(draft.min_duration)}
                  dataArray={[
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '60 minutes' },
                  ]}
                  onDataChange={set('min_duration')}
                />
              ) : null}
              {draft.is_group ? (
                <ManagementField
                  label="Minimum participants"
                  value={draft.min_people_req}
                  onChange={set('min_people_req')}
                  numeric
                  disabled={disabled}
                />
              ) : null}
              {draft.is_fixed ? (
                <ManagementField
                  label="Fixed slots (Monday 09:00,Friday 11:00)"
                  value={draft.fixed_time_slots}
                  onChange={set('fixed_time_slots')}
                  disabled={disabled}
                />
              ) : null}
              <Text>
                Fixed activities need one or more slots inside centre hours. The
                current service requires compulsory activities to use fixed
                times.
              </Text>
            </>
          ) : (
            <>
              <ManagementField
                label="Start time (HH:mm)"
                value={draft.start_time}
                onChange={set('start_time')}
                disabled={disabled}
              />
              <ManagementField
                label="End time (HH:mm)"
                value={draft.end_time}
                onChange={set('end_time')}
                disabled={disabled}
              />
              <Text>
                Choose recurring weekdays, or leave them clear for one date.
              </Text>
              {weekDays.map((day, i) => (
                <Toggle
                  key={day}
                  label={day}
                  value={hasWeekday(draft.days_of_week, i)}
                  disabled={disabled}
                  onChange={(value) =>
                    set('days_of_week')(
                      Number(draft.days_of_week) +
                        (value === hasWeekday(draft.days_of_week, i)
                          ? 0
                          : value
                          ? 2 ** i
                          : -(2 ** i)),
                    )
                  }
                />
              ))}
              <Text>
                A fixed availability matches the activity duration. Flexible
                availability can cover a longer window inside centre hours.
              </Text>
            </>
          )}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  field: { marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 6,
    minHeight: 48,
    padding: 10,
    color: '#222',
    backgroundColor: '#fff',
  },
  toggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
