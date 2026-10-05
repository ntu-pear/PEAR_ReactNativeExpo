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
      <Text>Preview patients already scheduled for an activity</Text>
      <Text>
        Dates use Singapore time. This preview reads the existing weekly
        schedule.
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
            style={styles.dateButton}
          >
            <Text>
              {index ? 'Tomorrow' : 'Today'} ({value})
              {date === value ? ' - selected' : ''}
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
        onPress={() => setReload((n) => n + 1)}
      >
        <Text>Refresh existing schedule</Text>
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
          <Text>
            {patients.length} affected patients for {selected} on {date}
          </Text>
          {patients.map((patient) => (
            <Text key={String(patient.id)}>{patient.name}</Text>
          ))}
        </>
      ) : null}
      <Text>
        Activity-wide changes are not available yet. This preview does not
        change any patient or schedule.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  dates: { flexDirection: 'row' },
  dateButton: { padding: 16 },
});
