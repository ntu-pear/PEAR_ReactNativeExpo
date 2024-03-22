// Libs
import React, { useEffect, useState } from 'react';
import { Modal, Button, VStack, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

// Components
import SelectionInputField from './input-components/SelectionInputField';
import InputField from './input-components/InputField';
import AppButton from './AppButton';
import DateInputField from './input-components/DateInputField';

// Configurations
import colors from 'app/config/colors';
import { Chip } from 'react-native-elements';
import { convertTimeHM24, formatTimeAMPM, formatTimeHM24 } from 'app/utility/miscFunctions';

function AddPatientMedicationModal({
  showModal,
  modalMode,
  medicationData,
  setMedicationData,
  onClose,
  onSubmit,
}) {
  

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isPrescriptionNameError, setIsPrescriptionNameError] = useState(false);
  const [isDosageError, setIsDosageError] = useState(false);
  const [isAdministerTimeError, setIsAdministerTimeError] = useState(false);
  const [isInstructionError, setIsInstructionError] = useState(false);
  const [isStartDateTimeError, setIsStartDateTimeError] = useState(false);
  const [isEndDateTimeError, setIsEndDateTimeError] = useState(false);
  const [isPrescriptionRemarksError, setIsPrescriptionRemarksError] = useState(false);

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(
      isPrescriptionNameError ||
      isDosageError ||
      isAdministerTimeError ||
      isInstructionError ||
      isStartDateTimeError ||
      isEndDateTimeError ||
      isPrescriptionRemarksError
    );
  }, [
    isPrescriptionNameError,
    isDosageError,
    isAdministerTimeError,
    isInstructionError,
    isStartDateTimeError,
    isEndDateTimeError,
    isPrescriptionRemarksError,
  ]);

  // Reset form 
  const resetForm = () => {
    setMedicationData({
      "medicationID": null,
      "prescriptionName": "",
      "dosage": "",
      "administerTime": [],
      "instruction": "",
      "startDateTime": new Date(),
      "endDateTime": new Date(),
      "prescriptionRemarks": ""
    });
    setIsPrescriptionNameError(false);
    setIsDosageError(false);
    setIsAdministerTimeError(false);
    setIsInstructionError(false);
    setIsStartDateTimeError(false);
    setIsEndDateTimeError(false);
    setIsPrescriptionRemarksError(false);
  };

  // When modal is closed, reset form
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Update administer time error state whenever administer time data is updated
  useEffect(() => {
    setIsAdministerTimeError(medicationData.administerTime.length == 0);
  }, [medicationData.administerTime])

  // Function to update  data
  const handleMedicationData = (field) => (e) => {
    const newData = medicationData;
    if(field == 'administerTime') {
      let tempTime = medicationData.administerTime;
      tempTime.push(e);
      const newTempTime = checkDuplicateAdministerTime(tempTime);
      setMedicationData((prevState) => ({
        ...prevState,
        [field]: newTempTime,
      }));
    } else {
      setMedicationData((prevState) => ({
        ...prevState,
        [field]: e,
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(medicationData);
      onClose();
    }
  };

  // Check if duplicate adm times have been
  const checkDuplicateAdministerTime = (tempTime) => {
    const timeStr = [...new Set(tempTime.map(item=>(
      formatTimeHM24(item)
    )))]

    const newTempTime = timeStr.map(item=>(
      convertTimeHM24(item)
      )) 
      
    return newTempTime;
  }

  // Delete an administer time option
  const deleteAdministerTime = (i) => {
    let tempTime = medicationData.administerTime;
    tempTime.splice(i, 1);
    setMedicationData((prevState) => ({
      ...prevState,
      administerTime: [...tempTime],
    }));
  }

  return (
    <Modal isOpen={showModal} onClose={onClose}>
      <Modal.Content maxWidth="65%">
        <Modal.CloseButton />
        <Modal.Header style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>{modalMode} Medication</Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>            
            <InputField
              isRequired={true}
              title={'Prescription Name'}
              value={medicationData.prescriptionName}
              onChangeText={handleMedicationData('prescriptionName')}
              onEndEditing={setIsPrescriptionNameError}
              autoCapitalize='none'
            />
            <InputField
              isRequired={true}
              title={'Dosage'}
              value={medicationData.dosage}
              onChangeText={handleMedicationData('dosage')}
              onEndEditing={setIsDosageError}
              autoCapitalize='none'
            />
            <View style={styles.dateSelectionContainer}>
              <DateInputField
                isRequired
                title={'Administer Time'}
                mode='time'
                value={null}
                allowNull
                hideDayOfWeek={true}
                handleFormData={handleMedicationData('administerTime')}
              />
            </View> 
            {medicationData.administerTime.length > 0 ? (
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {medicationData.administerTime.map((item,i) => (
                  <Chip
                  key={i}
                  title={formatTimeAMPM(item)}
                  type="solid"
                  buttonStyle={{backgroundColor: colors.green}}
                  containerStyle={{marginLeft: 5}}
                  iconRight
                  icon={{
                    name: 'close',
                    type: "font-awesome",
                    size: 13.5,
                    color: 'white',
                    }}
                  onPress={()=>deleteAdministerTime(i)}
                  />
                ))}
              </View>
            ) : null}            
            <InputField
              isRequired={true}
              title={'Instructions'}
              value={medicationData.instruction}
              onChangeText={handleMedicationData('instruction')}
              onEndEditing={setIsInstructionError}
              autoCapitalize='none'
            />
            <InputField
              isRequired={true}
              title={'Prescription Remarks'}
              value={medicationData.prescriptionRemarks}
              onChangeText={handleMedicationData('prescriptionRemarks')}
              onEndEditing={setIsPrescriptionRemarksError}
              autoCapitalize='none'
            />
            <View style={styles.dateSelectionContainer}>
              <DateInputField
                isRequired
                title={'Start Date'}
                value={medicationData.startDateTime}
                hideDayOfWeek={true}
                handleFormData={handleMedicationData('startDateTime')}
                onEndEditing={setIsStartDateTimeError}
                minimumInputDate={new Date()}
                maximumInputDate={medicationData.endDateTime}
              />
            </View>  
            <View style={styles.dateSelectionContainer}>
              <DateInputField
                isRequired
                title={'End Date'}
                value={medicationData.endDateTime}
                hideDayOfWeek={true}
                handleFormData={handleMedicationData('endDateTime')}
                onEndEditing={setIsEndDateTimeError}
                minimumInputDate={medicationData.startDateTime}
              />
            </View>            
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <AppButton color="red" title="Cancel" onPress={onClose}></AppButton>
            <AppButton
              onPress={handleSubmit}
              title="Submit"
              color="green"
              isDisabled={isInputErrors}
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
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientMedicationModal;
