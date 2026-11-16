import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import scheduleApi from 'app/api/schedule';
import requestDeadline from 'app/utility/requestDeadline';
import {
  previewDates,
  previewActivities,
  affectedPatients,
} from 'app/utility/adhocPreview';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import colors from 'app/config/colors';

export default function ActivityWideAdhocPreviewScreen() {
  const { user } = useContext(AuthContext);
  const permitted =
    String(user?.roleName || user?.role || '').toUpperCase() === 'SUPERVISOR';
  const [date, setDate] = useState(() => previewDates()[0]);
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) {
      return;
    }
    if (!permitted) {
      return;
    }
    let active = true;
    setLoading(true);
    setRows(null);
    setSelected('');
    setError('');
    const load = async () => {
      try {
        const res = await requestDeadline(
          Promise.resolve().then(() => scheduleApi.getScheduleV1()),
        );
        if (
          !res?.ok ||
          (res.data?.Status != null && String(res.data.Status) !== '200') ||
          !Array.isArray(res.data?.Data)
        ) {
          throw new Error(
            'The existing weekly schedule could not be loaded. Check the VPN connection and retry.',
          );
        }
        if (active) {
          setRows(res.data.Data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [permitted, focused, reload]);
  if (!permitted) {
    return (
      <Text>Activity-wide ad hoc preview requires Supervisor access.</Text>
    );
  }
  let preview = null;
  let patients = [];
  let previewError = '';
  if (rows) {
    try {
      preview = previewActivities(rows, date);
      if (selected) {
        patients = affectedPatients(preview, selected);
      }
    } catch (err) {
      previewError = err.message;
    }
  }
  const dates = previewDates();
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      testID="activity_wide_adhoc_preview"
    >
      <Text style={styles.heading}>Patients scheduled for an activity</Text>
      <Text style={styles.meta}>
        Choose a day and an activity to see which patients are scheduled for it.
        Dates use Singapore time.
      </Text>
      <View style={styles.dates}>
        {dates.map((value, index) => (
          <TouchableOpacity
            key={value}
            accessibilityRole="button"
            onPress={() => {
              setDate(value);
              setSelected('');
            }}
            accessibilityState={{ selected: date === value }}
            style={[styles.chip, date === value && styles.chipSelected]}
          >
            <Text
              style={[
                styles.chipText,
                date === value && styles.chipTextSelected,
              ]}
            >
              {index ? 'Tomorrow' : 'Today'} ({value})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? <ActivityIndicator /> : null}
      {error || previewError ? (
        <Text accessibilityRole="alert">{error || previewError}</Text>
      ) : null}
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.button}
        onPress={() => setReload((n) => n + 1)}
      >
        <Text style={styles.buttonText}>Refresh existing schedule</Text>
      </TouchableOpacity>
      {preview ? (
        <SelectionInputField
          title="Scheduled activity"
          placeholder="Select an activity"
          value={selected}
          dataArray={preview.activities.map((title) => ({
            value: title,
            label: title,
          }))}
          onDataChange={setSelected}
        />
      ) : null}
      {selected && preview && !previewError ? (
        <>
          <Text style={styles.subheading}>
            {patients.length} {patients.length === 1 ? 'patient' : 'patients'}{' '}
            scheduled for {selected} on {date}
          </Text>
          <View style={styles.list}>
            {patients.map((patient) => (
              <Text key={String(patient.id)} style={styles.listRow}>
                {patient.name}
              </Text>
            ))}
          </View>
        </>
      ) : null}
      <Text style={styles.notice}>
        Activity-wide changes are not available yet. This preview does not
        change any patient or schedule.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  heading: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  meta: { color: colors.grey, marginBottom: 12 },
  dates: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    marginVertical: 8,
    backgroundColor: colors.green,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  list: { borderWidth: 1, borderColor: colors.grey_lighter, borderRadius: 8 },
  listRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_lighter,
    color: colors.black,
  },
  notice: {
    backgroundColor: colors.green_lightest,
    color: colors.black,
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
});
