// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'native-base';

// Components
import AddEditModal from 'app/components/AddEditModal';
import RadioButtonInput from 'app/components/input-components/RadioButtonsInput';

// API
import activity from 'app/api/activity';

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

  // Define radio button options for each activity preference
  const preferenceOptions = [
    { label: 'Neutral', value: 0 },
    { label: 'Like', value: 1 },
    { label: 'Dislike', value: -1 },
  ];

  // Fetch the full list of activities and initialize preferences to neutral
  const getListData = async () => {
    try {
      const response = await activity.getCentreActivities();
      const responseData = response.data.data;
      const extractedObjects = responseData.map((object) => ({
        label: object.activityTitle,
        value: object.centreActivityID, // adjust if your API uses a different key
      }));
      setActivityList(extractedObjects);
      const initialPrefs = {};
      extractedObjects.forEach((item) => {
        const existing = existingActivityPreferences?.find(
          (pref) => pref.CentreActivityID === item.value,
        );
        initialPrefs[item.value] = existing ? existing.isLike : 0;
      });
      setPreferences(initialPrefs);
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
  };

  // Load activity list when the modal is shown
  useEffect(() => {
    if (showModal) {
      getListData();
    } else {
      // Optionally reset when modal is closed
      setActivityList([]);
      setPreferences({});
    }
  }, [showModal, existingActivityIDs]);

  // Handler to update the preference for a given activity
  const handlePreferenceChange = (activityId, newValue) => {
    setPreferences((prev) => ({ ...prev, [activityId]: newValue }));
  };

  // Handle form submission
  const handleSubmit = () => {
    const submission = Object.entries(preferences).map(
      ([activityId, pref]) => ({
        centreActivityID: parseInt(activityId, 10),
        isLike: pref,
      }),
    );
    onSubmit(submission);
    onClose();
  };

  // Build the modal content: list all activities with a radio group for each
  const modalContent = (
    <ScrollView>
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
      isInputErrors={false}
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
