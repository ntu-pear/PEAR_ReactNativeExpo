// Libs
import React, { useRef } from 'react';
import { Modal, Text, ScrollView, } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import routes from 'app/navigation/routes';

// Utilities
import MedicationItem from './MedicationItem';


const MedicationModal = ({
  isModalVisible,
  setIsModalVisible, 
  medications,
  patientName,
  patientID,
  date,
  navigation,
}) => {  
  
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const onPressViewAll = () => {
    navigation.push(routes.PATIENT_MEDICATION, { id: patientID });
  }

  return (
    <Modal
      size={'lg'}
      animationPreset={'slide'}
      isOpen={isModalVisible}
      onClose={()=>setIsModalVisible(false)}
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
    >
      <Modal.Content
        backgroundColor={colors.white_var1}
        >
        <Modal.Body padding={6}>
          <Text style={styles.headerStyle}>Medication Details for {patientName}</Text>
          <Text style={[styles.headerStyle, styles.subheaderStyle]} italic>{date}</Text>
            <ScrollView
              flex={1}
              >
                {medications.map((item, i)=>(
                  <MedicationItem
                  key={i}
                  medName={item.medName}
                  medDosage={item.medDosage}
                  medTime={item.medTime}
                  medNote={item.medNote}
                  />
                ))}
                <TouchableOpacity style={styles.viewAllContainer} onPress={onPressViewAll}>
                  <Text style={styles.viewAllText}>View all medications for {patientName}</Text>
                </TouchableOpacity>                
            </ScrollView>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginTop: '3%',
  },
  headerStyle: {
    fontSize: 25,
    alignSelf: 'center',
    padding: 10,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,    
  }, 
  subheaderStyle: {
    fontSize: 20,    
  },
  viewAllContainer: {
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  viewAllText: {
    color: colors.green,
    fontSize: 15    
  }
});

export default MedicationModal;
