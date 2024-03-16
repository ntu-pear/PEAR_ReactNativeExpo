// Libs
import React, { useRef } from 'react';
import { Modal, Text, ScrollView, Icon, View } from 'native-base';
import { Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import { formatTimeHM24 } from 'app/utility/miscFunctions';

const MedicationModal = ({
  isModalVisible,
  setIsModalVisible,  
  activityTitle,
  activityStartTime,
  activityEndTime,
  currentTime,
  medications,
}) => {  
  
  const initialRef = useRef(null);
  const finalRef = useRef(null);

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
          <Text style={styles.headerStyle}>Medication Details</Text>
            <ScrollView
              flex={1}
              >
                {medications.map((item)=>(
                  <View 
                    key={item.medName}
                    style={styles.medContainer}>
                      <Icon
                        as={
                          <MaterialIcons 
                          name="medical-services" 
                          />
                        } 
                        size={12}
                        color={colors.green}
                      >
                      </Icon>
                      <View style={styles.medTextContainer}>
                        <Text style={styles.heading}>{item.medName} ({item.medDosage})</Text>
                        {item.medNote != undefined ? (
                          <Text style={[styles.medText, styles.red]}>Note: {item.medNote}</Text>
                          ): null}
                      </View>
                      <View>
                        <Text style={styles.medTime}>{formatTimeHM24(item.medTime)}</Text>
                      </View>
                    </View>
                ))}

                
            </ScrollView>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  filterIcon: {
    marginLeft: 8,
  },
  chipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chipOption: {
    marginRight: 5,
  },
  filterContainer: {
    marginTop: '3%',
  },
  caregiverViewStyle: {
    padding: 5,
    paddingBottom: 30,
  },
  resetViewStyle: {
    alignItems: 'center',
  },
  headerStyle: {
    fontSize: 25,
    alignSelf: 'center',
    padding: 10,
    // paddingBottom: 20,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,    
  },
  textStyle: {
    fontSize: 13.5,
    padding: 5,
    paddingBottom: 10,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  dateTitle: {
    paddingHorizontal: 5,
    alignItems: 'center', 
    marginTop: 15
  },
  dateFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  dateText: {
    fontSize: 17
  },
  medContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.green_lightest, 
    padding: 20, 
    borderRadius: 7,
    marginTop: 20,
  },
  medTextContainer: {
    flex: 1
  },
  heading: {
    marginLeft: 20,
    fontSize: 19,
    fontWeight: '600',
  },
  medText: {
    marginTop: 4,
    marginLeft: 20,
    fontSize: 16,
  },
  medTime: {
    fontSize: 20,
    marginLeft: 10,
    marginRight: 15,
  },
  red: {
    color: colors.dark_red
  }
});

export default MedicationModal;
