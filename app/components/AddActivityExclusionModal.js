import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ScrollView, Text } from 'native-base';
import AppButton from 'app/components/AppButton';

import AddEditModal from 'app/components/AddEditModal';
import InputField from 'app/components/input-components/InputField';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import SingleOptionCheckBox from 'app/components/input-components/SingleOptionCheckBox';
import activity, {
  applyActivityTitles,
  buildActivityTitleMap,
  isMissingActivityTitle,
} from 'app/api/activity';
import { centreDay } from 'app/utility/centreClock';
import requestDeadline from 'app/utility/requestDeadline';
import {
  activityEntityId,
  validateExclusionDates,
} from 'app/utility/exclusionEligibility';
const todayIso = () => centreDay();

const toDateOnly = (value) => String(value || '').slice(0, 10);

const isIndefiniteEnd = (value) => {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) {
    return true;
  }
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
  rulesUnavailable = false,
}) {
  const [activityList, setActivityList] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [centreActivityID, setCentreActivityID] = useState(null);
  const [exclusionRemarks, setExclusionRemarks] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);

  const isEdit = modalMode === 'edit' && Boolean(existingExclusion);
  const existingCentreActivityID = existingExclusion?.centreActivityID;
  const excludedIdsKey = excludedActivityIds.map(String).sort().join(',');

  useEffect(() => {
    let live = true;
    if (!showModal) {
      return;
    }
    setActivityList([]);
    setLoadError('');
    setIsLoading(true);
    const load = async () => {
      try {
        if (rulesUnavailable && !isEdit) {
          throw new Error('Eligibility unavailable');
        }
        const [centreRes, activitiesRes] = await requestDeadline(
          Promise.all([
            activity.getCentreActivities(),
            activity.getActivities(),
          ]),
        );
        if (
          !centreRes?.ok ||
          !activitiesRes?.ok ||
          !Array.isArray(centreRes.data?.data) ||
          !Array.isArray(activitiesRes.data?.data)
        ) {
          throw new Error('Catalogue unavailable');
        }
        const centreRows = centreRes.data.data;
        const titleMap = buildActivityTitleMap(
          centreRows,
          activitiesRes.data.data,
        );
        const excluded = new Set(excludedIdsKey.split(','));
        const options = applyActivityTitles(centreRows, titleMap)
          .filter((row) => !isMissingActivityTitle(row.activityTitle))
          .filter(
            (row) =>
              ![true, 1, '1', 'true'].includes(
                row.isDeleted ?? row.is_deleted ?? row.IsDeleted,
              ),
          )
          .filter((row) => {
            const id = activityEntityId(
              row.centreActivityID ?? row.CentreActivityID,
            );
            return isEdit
              ? String(id) === String(existingCentreActivityID)
              : !excluded.has(String(id));
          })
          .map((row) => ({
            label: row.activityTitle,
            value: activityEntityId(
              row.centreActivityID ?? row.CentreActivityID,
            ),
          }));
        if (live) {
          setActivityList(options);
        }
      } catch {
        if (live) {
          setLoadError(
            rulesUnavailable && !isEdit
              ? 'Patient activity eligibility could not be verified. Close this form and refresh Activity Overview.'
              : 'Activities could not be loaded. Retry to verify the available choices.',
          );
        }
      } finally {
        if (live) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      live = false;
    };
  }, [
    showModal,
    excludedIdsKey,
    existingCentreActivityID,
    isEdit,
    reload,
    rulesUnavailable,
  ]);

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
  }, [showModal, isEdit, existingExclusion]);

  const handleSubmit = () => {
    if (centreActivityID == null) {
      Alert.alert(
        'Missing activity',
        'Select a named centre activity to exclude.',
      );
      return;
    }
    if (!String(exclusionRemarks).trim()) {
      Alert.alert('Missing remarks', 'Exclusion remarks are required.');
      return;
    }
    if (
      isLoading ||
      loadError ||
      (rulesUnavailable && !isEdit) ||
      !activityList.some(
        (row) => String(row.value) === String(centreActivityID),
      )
    ) {
      Alert.alert(
        'Activity unavailable',
        'Verify the available choices before saving.',
      );
      return;
    }
    try {
      const dates = validateExclusionDates(startDate, endDate, isIndefinite);
      onSubmit({
        id: existingExclusion?.id,
        centreActivityID: activityEntityId(centreActivityID),
        exclusionRemarks: String(exclusionRemarks).trim(),
        ...dates,
      });
    } catch (error) {
      Alert.alert('Check exclusion', error.message);
    }
  };

  const modalContent = (
    <ScrollView>
      {isLoading ? <Text>Loading activities...</Text> : null}
      {loadError ? <Text>{loadError}</Text> : null}
      {loadError && !(rulesUnavailable && !isEdit) ? (
        <AppButton
          title="Retry activities"
          onPress={() => setReload((value) => value + 1)}
        />
      ) : null}
      {!isLoading && !loadError && activityList.length === 0 ? (
        <Text>No eligible activities available.</Text>
      ) : null}
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
            if (checked) {
              setEndDate('');
            }
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
      isInputErrors={
        isLoading ||
        !!loadError ||
        (rulesUnavailable && !isEdit) ||
        !activityList.some(
          (row) => String(row.value) === String(centreActivityID),
        )
      }
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
