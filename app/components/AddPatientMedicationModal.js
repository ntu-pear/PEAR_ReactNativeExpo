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
import AddEditModal from './AddEditModal';

function AddPatientMedicationModal({
  showModal,
  modalMode,
  formData,
  setFormData,
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
    setFormData({
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
    setIsAdministerTimeError(formData.administerTime.length == 0);
  }, [formData.administerTime])

  // Function to update  data
  const handleMedicationData = (field) => (e) => {
    const newData = formData;
    if(field == 'administerTime') {
      let tempTime = formData.administerTime;
      tempTime.push(e);
      const newTempTime = checkDuplicateAdministerTime(tempTime);
      setFormData((prevState) => ({
        ...prevState,
        [field]: newTempTime,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: e,
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isInputErrors) {
      onSubmit(formData);
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
    let tempTime = formData.administerTime;
    tempTime.splice(i, 1);
    setFormData((prevState) => ({
      ...prevState,
      administerTime: [...tempTime],
    }));
  }

  return (
    <AddEditModal
      handleSubmit={handleSubmit}
      isInputErrors={isInputErrors}
      modalMode={modalMode}
      onClose={onClose}
      showModal={showModal}
      modalTitle='Medication' 
      modalContent={(
        <>
        <InputField
          isRequired={true}
          title={'Prescription Name'}
          value={formData.prescriptionName}
          onChangeText={handleMedicationData('prescriptionName')}
          onEndEditing={setIsPrescriptionNameError}
          autoCapitalize='none'
        />
        <InputField
          isRequired={true}
          title={'Dosage'}
          value={formData.dosage}
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
        {formData.administerTime.length > 0 ? (
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {formData.administerTime.map((item,i) => (
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
          value={formData.instruction}
          onChangeText={handleMedicationData('instruction')}
          onEndEditing={setIsInstructionError}
          autoCapitalize='none'
        />
        <InputField
          isRequired={true}
          title={'Prescription Remarks'}
          value={formData.prescriptionRemarks}
          onChangeText={handleMedicationData('prescriptionRemarks')}
          onEndEditing={setIsPrescriptionRemarksError}
          autoCapitalize='none'
        />
        <View style={styles.dateSelectionContainer}>
          <DateInputField
            isRequired
            title={'Start Date'}
            value={formData.startDateTime}
            hideDayOfWeek={true}
            handleFormData={handleMedicationData('startDateTime')}
            onEndEditing={setIsStartDateTimeError}
            minimumInputDate={new Date()}
            maximumInputDate={formData.endDateTime}
          />
        </View>  
        <View style={styles.dateSelectionContainer}>
          <DateInputField
            isRequired
            title={'End Date'}
            value={formData.endDateTime}
            hideDayOfWeek={true}
            handleFormData={handleMedicationData('endDateTime')}
            onEndEditing={setIsEndDateTimeError}
            minimumInputDate={formData.startDateTime}
          />
        </View> 
        </>
      )}    
/>
  );
}

const styles = StyleSheet.create({
  dateSelectionContainer: {
    width: '100%',
  },
});

export default AddPatientMedicationModal;
