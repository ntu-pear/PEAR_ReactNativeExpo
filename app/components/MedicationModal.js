// Libs
import React, { useRef } from 'react';
import { Modal, Text, ScrollView, View, } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import routes from 'app/navigation/routes';

// Utilities
import MedicationItem from './patient-profile-components/MedicationItem';
import { convertDateDMY } from 'app/utility/miscFunctions';


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
    navigation.push(routes.PATIENT_MEDICATION, { patientID: patientID });
  }

  return (
    <Modal
      animationPreset={'slide'}
      isOpen={isModalVisible}
      onClose={()=>setIsModalVisible(false)}
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
    >
      <Modal.Content
        backgroundColor={colors.white_var1}
        maxWidth={'70%'}
        >
        <Modal.Body padding={6}>
          <Text style={styles.headerStyle}>Medication Details for {patientName}</Text>
          <Text style={[styles.headerStyle, styles.subheaderStyle]} italic>{date}</Text>
            <ScrollView
              flex={1}
              >
                {medications.map((item, i)=>(
                  <View key={i} style={{marginTop: 20, marginHorizontal: 17}}>
                    <MedicationItem
                    medID={item.medID}
                    patientID={item.patientID}
                    patientName={item.patientName}
                    medName={item.medName}
                    medDosage={item.medDosage}
                    medTime={item.medTime}
                    medNote={item.medNote}
                    date={convertDateDMY(date)}
                    />
                  </View>
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
    paddingTop: 20,
    alignSelf: 'flex-end',
    marginRight: 17
  },
  viewAllText: {
    color: colors.green,
    fontSize: 15    
  }
});

export default MedicationModal;
