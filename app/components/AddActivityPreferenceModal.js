// Libs
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View, Alert } from 'react-native';

// Components
import SelectionInputField from './input-components/SelectionInputField';
import InputField from './input-components/InputField';
import AppButton from './AppButton';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';
import colors from 'app/config/colors';

// API
import activity from 'app/api/activity'; //need to create a list of array for dataArray

// Configurations

function AddActivityPreferenceModal({
  showModal,
  onClose,
  onSubmit,
  existingActivityIDs,
}) {

  const [activityData, setActivityData] = useState({
    centreActivityID: null,
    isLike: null,
  });

  const [isError, setIsError] = useState(false);
  const [isActivityError, setIsActivityError] = useState(true);
  const [isActivityIsLikeError, setIsActivityIsLikeError] = useState(true);
  const [disabledActivityOptions, setDisabledActivityOptions] = useState({});

  const [activityList, setActivityList] = useState([]);
  const [isLikeList] = useState([
    { label: 'Like', value: 1 },
    { label: 'Dislike', value: 0 },
  ]);

  let extractedObjects = [];

  const getListData = async () => {
    try {
      const response = await activity.getCentreActivities();
      const responseData = response.data.data;

      responseData.map((object) => {
      const valuesArray = Object.values(object);
      const id = valuesArray[0];
      const value = object.activityTitle;
      const extractedObject = { label: value, value: id };
      extractedObjects.push(extractedObject);
      });
      setActivityList(extractedObjects);
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
  };

  const handleActivityChange = (value) => {
    setActivityData({ ...activityData, centreActivityID: value });
    setIsActivityError(false);
  };

  const handleIsLikeChange = (value) => {
    setActivityData({ ...activityData, isLike: value });
    setIsActivityIsLikeError(false);
  };

  const resetForm = () => {
    setActivityData({
      centreActivityID: null,
      isLike: null,
    });
    setIsActivityError(true);
    setIsActivityIsLikeError(true);
  };

  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  useEffect(() => {
    const newDisabledOptions = {};

    if(existingActivityIDs){
      existingActivityIDs.forEach((id) => {
        newDisabledOptions[id] = true;
      });
    }

    setDisabledActivityOptions(newDisabledOptions);
  }, [existingActivityIDs]);

  useEffect(() => {
    getListData();
  }, []);

  // Handle form submission
  const handleSubmit = () => {
    let alertTitle = 'Please Try Again';
    let alertDetails = 'Field(s) cannot be left empty';

    if (!isActivityError && !isActivityIsLikeError) {
      onSubmit(activityData);
      onClose();
    }else{
      Alert.alert(alertTitle, alertDetails);
    }
  };

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Add Activity Preference</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <SelectionInputField
              isRequired
              title={'Activity'}
              onDataChange={handleActivityChange}
              value={activityData.centreActivityID}
              dataArray={activityList}
              isDisabledItems={disabledActivityOptions}
            />
            <SelectionInputField
              isRequired
              title={'Like/Dislike'}
              onDataChange={handleIsLikeChange}
              value={activityData.isLike}
              dataArray={isLikeList}
            />
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton color="red" title="Cancel" onPress={onClose}></AppButton>
            <AppButton
              onPress={handleSubmit}
              title="Submit"
              color="green"
            ></AppButton>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: colors.green, // Change to your preferred green color
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    color: 'white', // Text color
    fontSize: 18, // Adjust font size as needed
    fontWeight: 'bold', // Optional: if you want the text to be bold
    textTransform: 'uppercase',
  },
});

export default AddActivityPreferenceModal;