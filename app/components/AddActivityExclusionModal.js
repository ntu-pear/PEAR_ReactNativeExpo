import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ScrollView } from 'native-base';

import AddEditModal from 'app/components/AddEditModal';
import InputField from 'app/components/input-components/InputField';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import SingleOptionCheckBox from 'app/components/input-components/SingleOptionCheckBox';
import activity, {
  applyActivityTitles,
  buildActivityTitleMap,
  isMissingActivityTitle,
} from 'app/api/activity';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toDateOnly = (value) => String(value || '').slice(0, 10);

const isIndefiniteEnd = (value) => {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return true;
  return Number(dateOnly.slice(0, 4)) >= 2999;
};

function AddActivityExclusionModal({
  testID = 'add_activity_exclusion_modal',
  showModal,
  modalMode = 'add',
  onClose,
  onSubmit,
  existingExclusion,
  excludedActivityIds = [],
}) {
  const [activityList, setActivityList] = useState([]);
  const [centreActivityID, setCentreActivityID] = useState(null);
  const [exclusionRemarks, setExclusionRemarks] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);

  const isEdit = modalMode === 'edit' && existingExclusion;

  const loadActivities = async () => {
    try {
      const [centreRes, activitiesRes] = await Promise.all([
        activity.getCentreActivities(),
        activity.getActivities(),
      ]);
      const centreRows = centreRes?.ok ? centreRes.data?.data || [] : [];
      const titleMap = buildActivityTitleMap(
        centreRows,
        activitiesRes?.ok ? activitiesRes.data?.data || [] : [],
      );
      const excluded = new Set(excludedActivityIds.map((id) => String(id)));
      const options = applyActivityTitles(centreRows, titleMap)
        .filter((row) => !isMissingActivityTitle(row.activityTitle))
        .filter((row) => {
          const id = row.centreActivityID ?? row.CentreActivityID;
          if (isEdit) {
            return String(id) === String(existingExclusion.centreActivityID);
          }
          return !excluded.has(String(id));
        })
        .map((row) => ({
          label: row.activityTitle,
          value: row.centreActivityID ?? row.CentreActivityID,
        }));
      setActivityList(options);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to load activities', 'Please try again.');
    }
  };

  useEffect(() => {
    if (!showModal) {
      setActivityList([]);
      setCentreActivityID(null);
      setExclusionRemarks('');
      setStartDate(todayIso());
      setEndDate('');
      setIsIndefinite(false);
      return;
    }

    loadActivities();

    if (isEdit) {
      setCentreActivityID(existingExclusion.centreActivityID);
      setExclusionRemarks(existingExclusion.exclusionRemarks || '');
      setStartDate(toDateOnly(existingExclusion.startDate) || todayIso());
      const indefinite = isIndefiniteEnd(existingExclusion.endDate);
      setIsIndefinite(indefinite);
      setEndDate(indefinite ? '' : toDateOnly(existingExclusion.endDate));
    } else {
      setCentreActivityID(null);
      setExclusionRemarks('');
      setStartDate(todayIso());
      setEndDate('');
      setIsIndefinite(false);
    }
  }, [showModal, modalMode, existingExclusion]);

  const handleSubmit = () => {
    if (centreActivityID == null) {
      Alert.alert('Missing activity', 'Select a named centre activity to exclude.');
      return;
    }
    if (!String(exclusionRemarks).trim()) {
      Alert.alert('Missing remarks', 'Exclusion remarks are required.');
      return;
    }
    if (!ISO_DATE.test(String(startDate).trim())) {
      Alert.alert('Invalid start date', 'Use YYYY-MM-DD.');
      return;
    }
    if (!isIndefinite && !ISO_DATE.test(String(endDate).trim())) {
      Alert.alert(
        'Invalid end date',
        'Enter an end date as YYYY-MM-DD, or tick Indefinite.',
      );
      return;
    }

    onSubmit({
      id: existingExclusion?.id,
      centreActivityID: Number(centreActivityID),
      exclusionRemarks: String(exclusionRemarks).trim(),
      startDate: String(startDate).trim(),
      endDate: isIndefinite ? null : String(endDate).trim(),
    });
  };

  const modalContent = (
    <ScrollView>
      <SelectionInputField
        testID={`${testID}_activity`}
        isRequired
        title="Activity"
        placeholder="Select activity"
        value={centreActivityID}
        dataArray={activityList}
        onDataChange={setCentreActivityID}
      />
      <InputField
        testID={`${testID}_remarks`}
        isRequired
        title="Remarks"
        value={exclusionRemarks}
        onChangeText={setExclusionRemarks}
        autoCapitalize="none"
      />
      <InputField
        testID={`${testID}_start_date`}
        isRequired
        title="Start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <View style={styles.checkbox}>
        <SingleOptionCheckBox
          testID={`${testID}_indefinite`}
          title="Indefinite (no end date)"
          value={isIndefinite}
          onChangeData={(checked) => {
            setIsIndefinite(checked);
            if (checked) setEndDate('');
          }}
        />
      </View>
      {!isIndefinite && (
        <InputField
          testID={`${testID}_end_date`}
          isRequired
          title="End date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
      )}
    </ScrollView>
  );

  return (
    <AddEditModal
      testID={testID}
      handleSubmit={handleSubmit}
      isInputErrors={false}
      modalMode={isEdit ? 'edit' : 'add'}
      onClose={onClose}
      showModal={showModal}
      modalTitle="Activity Exclusion"
      modalContent={modalContent}
    />
  );
}

const styles = StyleSheet.create({
  checkbox: {
    marginVertical: 8,
  },
});

export default AddActivityExclusionModal;
