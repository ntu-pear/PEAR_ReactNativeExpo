// Libs
import React, { useEffect, useRef, useState } from 'react';
import requestDeadline from 'app/utility/requestDeadline';
import { StyleSheet, View } from 'react-native';
import { ScrollView, Text } from 'native-base';

// Components
import AddEditModal from 'app/components/AddEditModal';
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';

// API
import activity, {
  applyActivityTitles,
  buildActivityTitleMap,
  isMissingActivityTitle,
} from 'app/api/activity';

function AddActivityPreferenceModal({
  testID,
  showModal,
  modalMode, // e.g. 'add' or 'edit'
  onClose,
  onSubmit,
  existingActivityIDs, // No longer used to disable options
  existingActivityPreferences,
}) {
  // List of all centre activities from the backend
  const [activityList, setActivityList] = useState([]);

  // Object to store preferences: key = centreActivityID, value = preference (0 for Neutral, 1 for Like, -1 for Dislike)
  const [preferences, setPreferences] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialPreferences = useRef({});

  // Define radio button options for each activity preference
  const preferenceOptions = [
    { label: 'Neutral', value: 0 },
    { label: 'Like', value: 1 },
    { label: 'Dislike', value: -1 },
  ];

  // Fetch the full list of activities and initialize preferences to neutral
  const getListData = async (isCurrent) => {
    try {
      const [centreRes, activitiesRes] = await requestDeadline(
        Promise.all([activity.getCentreActivities(), activity.getActivities()]),
      );
      if (!isCurrent()) {
        return;
      }
      if (!centreRes?.ok || !activitiesRes?.ok) {
        throw new Error('Catalogue unavailable');
      }
      const responseData = centreRes.data.data || [];
      const titleMap = buildActivityTitleMap(
        responseData,
        activitiesRes?.ok ? activitiesRes.data?.data || [] : [],
      );
      const extractedObjects = applyActivityTitles(responseData, titleMap)
        .filter((object) => !isMissingActivityTitle(object.activityTitle))
        .map((object) => ({
          label: object.activityTitle,
          value: object.centreActivityID,
        }));
      setActivityList(extractedObjects);
      const initialPrefs = {};
      extractedObjects.forEach((item) => {
        const existing = existingActivityPreferences?.find(
          (pref) =>
            String(pref.CentreActivityID ?? pref.centreActivityID) ===
            String(item.value),
        );
        initialPrefs[item.value] =
          existing && [-1, 0, 1].includes(Number(existing.isLike))
            ? Number(existing.isLike)
            : 0;
      });
      initialPreferences.current = initialPrefs;
      setPreferences(initialPrefs);
    } catch {
      if (isCurrent()) {
        setIsError(true);
      }
    } finally {
      if (isCurrent()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    setActivityList([]);
    setPreferences({});
    initialPreferences.current = {};
    setIsError(false);
    setIsLoading(showModal);
    if (showModal) {
      getListData(() => active);
    }
    return () => {
      active = false;
    };
  }, [showModal, existingActivityPreferences]);

  // Handler to update the preference for a given activity
  const handlePreferenceChange = (activityId, newValue) => {
    setPreferences((prev) => ({ ...prev, [activityId]: newValue }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isLoading || isError) {
      return;
    }
    const submission = Object.entries(preferences)
      .filter(([id, value]) => value !== initialPreferences.current[id])
      .map(([activityId, pref]) => ({
        centreActivityID: parseInt(activityId, 10),
        isLike: pref,
      }));
    if (submission.length) {
      onSubmit(submission);
    }
    onClose();
  };

  // Build the modal content: list all activities with a radio group for each
  const modalContent = (
    <ScrollView>
      {isLoading ? <Text>Loading activities...</Text> : null}
      {isError ? (
        <Text>Activities could not be loaded. Close and reopen to retry.</Text>
      ) : null}
      {activityList.map((activityItem) => (
        <View key={activityItem.value} style={styles.activityRow}>
          <RadioButtonInput
            testID={`${testID}_activity_radio_${activityItem.value}`}
            isRequired={true}
            title={activityItem.label}
            value={preferences[activityItem.value]}
            dataArray={preferenceOptions}
            onChangeData={(newValue) =>
              handlePreferenceChange(activityItem.value, newValue)
            }
            isDisabled={false}
          />
        </View>
      ))}
    </ScrollView>
  );

  return (
    <AddEditModal
      testID={testID}
      handleSubmit={handleSubmit}
      isInputErrors={isLoading || isError}
      modalMode={modalMode}
      onClose={onClose}
      showModal={showModal}
      modalTitle="Edit Activity Preferences"
      modalContent={modalContent}
    />
  );
}

const styles = StyleSheet.create({
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    justifyContent: 'space-between',
  },
  activityLabel: {
    flex: 1,
    fontSize: 16,
  },
});

export default AddActivityPreferenceModal;
