import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import patientApi from "../api/patient";

function PatientsScreen() {
  const getListOfPatients = async () => {
    console.log("Test")
    const result = await patientApi.getPatient(null, true, true);
    console.log(result);
  };

  return (
    <View>
      <Text>This is patients screen.</Text>
      <AppButton title="Test" color="red" onPress={getListOfPatients}/>
    </View>
  );
}

const styles = StyleSheet.create({});

export default PatientsScreen;
