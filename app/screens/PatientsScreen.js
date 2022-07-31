import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Center, Image, VStack, Box } from "native-base";
import AppButton from "../components/AppButton";
import patientApi from "../api/patient";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";
import PatientScreenCard from "../components/PatientScreenCard";
import colors from "../config/colors";

function PatientsScreen() {
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();

  const getListOfPatients = async () => {
    const response = await patientApi.getPatient(null, true, true);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
    }
  };

  return (
    <Center>
      <VStack>
        <Box 
        bg={colors.light_var1} 
        minW="90%"
        minH="20%"
        overflow="hidden"
        rounded="lg">
          <PatientScreenCard />
        </Box>
      </VStack>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientsScreen;
