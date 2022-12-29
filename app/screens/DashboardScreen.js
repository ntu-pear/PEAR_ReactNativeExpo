import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';

function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <View style={styles.centeredView}>
      <PatientDailyHighlights
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textStyle}>See Patients Daily Highlights</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    borderWidth: 1,
    borderColor: 'black',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DashboardScreen;
