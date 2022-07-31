import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import patientApi from "../api/patient";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";

function PatientsScreen() {
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();

  const getListOfPatients = async () => {
    const response = await patientApi.getPatient(null, true, true);
    if(!response.ok){
      // If token is expired, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
    }
  };

  return (
    <View>
      <Text>This is patients screen.</Text>
      <AppButton title="Test" color="red" onPress={getListOfPatients} />
    </View>
  );
}

const styles = StyleSheet.create({});

export default PatientsScreen;
