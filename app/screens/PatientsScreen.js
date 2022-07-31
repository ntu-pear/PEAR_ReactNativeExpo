import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Center, Image, VStack, Box } from "native-base";
import patientApi from "../api/patient";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";
import PatientScreenCard from "../components/PatientScreenCard";
import colors from "../config/colors";

function PatientsScreen() {
  const [listOfPatients, setListOfPatients] = useState({});
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();

  useEffect(() => {
    // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
    // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
    const promiseFunction = async () => {
      await getListOfPatients();
    };
    promiseFunction();
  }, []);

  const getListOfPatients = async () => {
    const response = await patientApi.getPatient(null, true, true);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    // Save the PatientData
    setListOfPatients(response.data);
  };

  return (
    <Center>
      <VStack>
        <Box
          bg={colors.light_var1}
          minW="90%"
          minH="20%"
          overflow="hidden"
          rounded="lg"
        >
          <PatientScreenCard />
        </Box>
      </VStack>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientsScreen;
